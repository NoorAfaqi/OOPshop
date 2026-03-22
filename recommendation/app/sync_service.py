from __future__ import annotations

from app.config import Settings
from app.embedder import encode_texts
from app.mysql_repo import (
    fetch_all_products_for_embedding,
    mysql_connect,
    text_for_embedding,
)
from app.vector_store import delete_embeddings_not_in, upsert_many


def sync_all_embeddings(settings: Settings, batch_size: int = 32) -> dict[str, int]:
    mconn = mysql_connect(settings)
    try:
        rows = fetch_all_products_for_embedding(mconn)
    finally:
        mconn.close()

    prepared: list[tuple[int, str | None, str]] = []
    for r in rows:
        t = text_for_embedding(r)
        if not t:
            continue
        preview = t[:500] if len(t) > 500 else t
        prepared.append((int(r["id"]), preview, t))

    total_embedded = 0
    for i in range(0, len(prepared), batch_size):
        chunk = prepared[i : i + batch_size]
        texts = [c[2] for c in chunk]
        vectors = encode_texts(settings, texts)
        batch: list[tuple[int, str | None, object]] = []
        for (pid, preview, _), emb in zip(chunk, vectors):
            if emb.shape[0] != settings.embedding_dim:
                raise ValueError(
                    f"Embedding dim {emb.shape[0]} != EMBEDDING_DIM {settings.embedding_dim}"
                )
            batch.append((pid, preview, emb))
        upsert_many(settings, batch)
        total_embedded += len(batch)

    keep_ids = {pid for pid, _, _ in prepared}
    pruned = delete_embeddings_not_in(settings, keep_ids)

    return {
        "products_in_mysql": len(rows),
        "embedded": total_embedded,
        "skipped_no_text": len(rows) - len(prepared),
        "pruned": pruned,
    }
