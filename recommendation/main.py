"""
Vercel FastAPI entrypoint.

Vercel discovers the ASGI app from a top-level ``main.py`` with an ``app`` attribute:
https://vercel.com/docs/frameworks/backend/fastapi

Run locally: ``python main.py`` or ``uvicorn app.main:app --reload``.
"""

from app.main import app

__all__ = ["app"]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8088, reload=True)
