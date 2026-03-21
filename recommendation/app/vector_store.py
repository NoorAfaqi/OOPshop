from __future__ import annotations

from contextlib import contextmanager
from typing import Generator

import numpy as np
import psycopg2
import psycopg2.errors
from pgvector.psycopg2 import register_vector

from app.config import Settings

_PGVECTOR_SETUP_HINT = (
    "PostgreSQL does not expose the pgvector type on this database. "
    "In Supabase: open SQL Editor and run: CREATE EXTENSION IF NOT EXISTS vector; "
    "(or Dashboard → Database → Extensions → enable “vector”). "
    "Then run supabase_schema.sql. "
    "Confirm DATABASE_URL points at the same Supabase project database."
)

_TABLE_MISSING_HINT = (
    'Table public.product_embeddings is missing. In Supabase → SQL Editor, run the full '
    "recommendation/supabase_schema.sql (extension + CREATE TABLE + index). "
    "Enabling the vector extension alone does not create this table."
)

_IPV6_EGRESS_HINT = (
    "Postgres is unreachable from this host (often IPv6). Supabase 'Direct connection' "
    "(db.*.supabase.co:5432) commonly resolves to IPv6; Render and many clouds have no IPv6 egress. "
    "Fix: in Supabase → Project Settings → Database, copy the 'Connection pooling' URI "
    "(host like aws-0-*.pooler.supabase.com, port 6543). Use Session mode if Transaction mode "
    "misbehaves with your client. Append ?sslmode=require. Optionally enable Supabase IPv4 add-on "
    "for direct connections."
)


def _translate_pg_exception(exc: BaseException) -> RuntimeError | None:
    if isinstance(exc, psycopg2.errors.UndefinedTable):
        if "product_embeddings" in str(exc):
            return RuntimeError(_TABLE_MISSING_HINT)
    if isinstance(exc, psycopg2.OperationalError):
        msg = str(exc).lower()
        if "network is unreachable" in msg or "no route to host" in msg:
            return RuntimeError(_IPV6_EGRESS_HINT)
        if "could not translate host name" in msg:
            return RuntimeError(
                "Postgres DNS lookup failed. Check DATABASE_URL and outbound DNS from this host."
            )
    return None


def _register_vector(conn: psycopg2.extensions.connection) -> None:
    try:
        register_vector(conn)
    except psycopg2.ProgrammingError as e:
        msg = str(e).lower()
        if "vector" in msg and "not found" in msg:
            raise RuntimeError(_PGVECTOR_SETUP_HINT) from e
        raise


@contextmanager
def pg_conn(settings: Settings) -> Generator[psycopg2.extensions.connection, None, None]:
    conn = None
    try:
        conn = psycopg2.connect(settings.database_url)
        _register_vector(conn)
        yield conn
        conn.commit()
    except Exception as e:
        if conn is not None:
            conn.rollback()
        replacement = _translate_pg_exception(e)
        if replacement is not None:
            raise replacement from e
        raise
    finally:
        if conn is not None:
            conn.close()


def upsert_many(
    settings: Settings,
    items: list[tuple[int, str | None, np.ndarray]],
) -> None:
    if not items:
        return
    with pg_conn(settings) as conn:
        with conn.cursor() as cur:
            for product_id, description_preview, embedding in items:
                cur.execute(
                    """
                    INSERT INTO public.product_embeddings (product_id, description_preview, embedding)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (product_id) DO UPDATE SET
                      description_preview = EXCLUDED.description_preview,
                      embedding = EXCLUDED.embedding,
                      updated_at = now()
                    """,
                    (product_id, description_preview, embedding),
                )


def upsert_embedding(
    settings: Settings,
    product_id: int,
    description_preview: str | None,
    embedding: np.ndarray,
) -> None:
    upsert_many(settings, [(product_id, description_preview, embedding)])


def get_embedding(settings: Settings, product_id: int) -> np.ndarray | None:
    with pg_conn(settings) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT embedding FROM public.product_embeddings
                WHERE product_id = %s
                """,
                (product_id,),
            )
            row = cur.fetchone()
            if not row:
                return None
            return np.asarray(row[0], dtype=np.float32)


def match_similar(
    settings: Settings,
    query_embedding: np.ndarray,
    exclude_product_id: int,
    k: int,
) -> list[tuple[int, float]]:
    with pg_conn(settings) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT product_id, 1 - (embedding <=> %s) AS similarity
                FROM public.product_embeddings
                WHERE product_id <> %s
                ORDER BY embedding <=> %s
                LIMIT %s
                """,
                (query_embedding, exclude_product_id, query_embedding, k),
            )
            rows = cur.fetchall()
    return [(int(r[0]), float(r[1])) for r in rows]
