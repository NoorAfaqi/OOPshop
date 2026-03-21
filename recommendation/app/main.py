from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

from app.config import get_settings
from app.embedder import encode_single
from app.mysql_repo import (
    fetch_product_by_id,
    fetch_products_by_ids,
    mysql_connect,
    text_for_embedding,
)
from app.sync_service import sync_all_embeddings
from app.vector_store import get_embedding, match_similar, upsert_embedding

logger = logging.getLogger(__name__)

app = FastAPI(title="OOPshop product recommendations", version="1.0.0")

@app.get("/")
def root():
    return {"message": "API is working"}

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


class SyncResponse(BaseModel):
    products_in_mysql: int
    embedded: int
    skipped_no_text: int
    pruned: int = Field(
        default=0,
        description="Supabase rows removed (deleted products or no longer embeddable text)",
    )


@app.post("/embeddings/sync", response_model=SyncResponse)
def post_embeddings_sync() -> SyncResponse:
    settings = get_settings()
    try:
        stats = sync_all_embeddings(settings)
    except RuntimeError as e:
        logger.warning("embeddings/sync failed: %s", e)
        raise HTTPException(status_code=503, detail=str(e)) from e
    return SyncResponse(**stats)


class RecommendedProduct(BaseModel):
    product_id: int
    similarity: float = Field(description="Cosine similarity in [0,1] (approx.)")
    name: str | None = None
    category: str | None = None
    description: str | None = None


class RecommendationsResponse(BaseModel):
    product_id: int
    k: int
    recommendations: list[RecommendedProduct]


@app.get("/recommendations/{product_id}", response_model=RecommendationsResponse)
def get_recommendations(
    product_id: int,
    k: int = Query(default=10, ge=1, le=50),
) -> RecommendationsResponse:
    settings = get_settings()
    try:
        vec = get_embedding(settings, product_id)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e

    mconn = mysql_connect(settings)
    try:
        if vec is None:
            row = fetch_product_by_id(mconn, product_id)
            if not row:
                raise HTTPException(status_code=404, detail="Product not found in MySQL")
            text = text_for_embedding(row)
            if not text:
                raise HTTPException(
                    status_code=400,
                    detail="Product has no name/category/description to embed",
                )
            vec = encode_single(settings, text)
            preview = text[:500] if len(text) > 500 else text
            try:
                upsert_embedding(settings, product_id, preview, vec)
            except RuntimeError as e:
                raise HTTPException(status_code=503, detail=str(e)) from e

        try:
            matches = match_similar(settings, vec, product_id, k)
        except RuntimeError as e:
            raise HTTPException(status_code=503, detail=str(e)) from e
        ids = [m[0] for m in matches]
        by_id = fetch_products_by_ids(mconn, ids)
    finally:
        mconn.close()

    recommendations: list[RecommendedProduct] = []
    for pid, sim in matches:
        p = by_id.get(pid)
        recommendations.append(
            RecommendedProduct(
                product_id=pid,
                similarity=round(sim, 6),
                name=p.get("name") if p else None,
                category=p.get("category") if p else None,
                description=p.get("description") if p else None,
            )
        )
    return RecommendationsResponse(product_id=product_id, k=k, recommendations=recommendations)
