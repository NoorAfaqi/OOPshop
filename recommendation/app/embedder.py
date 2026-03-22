from __future__ import annotations

import threading
from typing import TYPE_CHECKING

import numpy as np

if TYPE_CHECKING:
    from app.config import Settings

_lock = threading.Lock()
_model = None


def _get_model(settings: Settings):
    global _model
    with _lock:
        if _model is None:
            from sentence_transformers import SentenceTransformer

            _model = SentenceTransformer(settings.embedding_model)
        return _model


def encode_texts(settings: Settings, texts: list[str]) -> list[np.ndarray]:
    if not texts:
        return []
    model = _get_model(settings)
    mat = model.encode(
        texts,
        convert_to_numpy=True,
        show_progress_bar=False,
        normalize_embeddings=True,
    )
    return [np.asarray(mat[i], dtype=np.float32) for i in range(len(texts))]


def encode_single(settings: Settings, text: str) -> np.ndarray:
    vecs = encode_texts(settings, [text])
    if not vecs:
        raise ValueError("empty embedding")
    return vecs[0]
