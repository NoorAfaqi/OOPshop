from __future__ import annotations

from typing import Any

import pymysql

from app.config import Settings


def mysql_connect(settings: Settings) -> pymysql.connections.Connection:
    return pymysql.connect(**settings.mysql_config)


def fetch_all_products_for_embedding(
    conn: pymysql.connections.Connection,
) -> list[dict[str, Any]]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT id, name, category, description
            FROM products
            ORDER BY id
            """
        )
        return list(cur.fetchall())


def fetch_product_by_id(
    conn: pymysql.connections.Connection, product_id: int
) -> dict[str, Any] | None:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT id, name, category, description
            FROM products
            WHERE id = %s
            """,
            (product_id,),
        )
        row = cur.fetchone()
        return dict(row) if row else None


def fetch_products_by_ids(
    conn: pymysql.connections.Connection, ids: list[int]
) -> dict[int, dict[str, Any]]:
    if not ids:
        return {}
    placeholders = ",".join(["%s"] * len(ids))
    with conn.cursor() as cur:
        cur.execute(
            f"""
            SELECT id, name, category, description, price, brand, image_url, stock_quantity
            FROM products
            WHERE id IN ({placeholders})
            """,
            ids,
        )
        rows = cur.fetchall()
    return {int(r["id"]): dict(r) for r in rows}


def text_for_embedding(row: dict[str, Any]) -> str | None:
    parts: list[str] = []
    if row.get("name"):
        parts.append(str(row["name"]).strip())
    if row.get("category"):
        parts.append(str(row["category"]).strip())
    if row.get("description"):
        parts.append(str(row["description"]).strip())
    joined = " ".join(p for p in parts if p)
    return joined or None
