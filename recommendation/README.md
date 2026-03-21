# Product recommendations (FastAPI)

Reads product text from your **MySQL** `products` table, builds **local** embeddings with [sentence-transformers](https://www.sbert.net/) (free, runs on your CPU/GPU; default `all-MiniLM-L6-v2`), stores vectors in **Supabase Postgres** with **pgvector**, and serves **top‑k** neighbors by **cosine similarity** on description-derived text.

**Python:** use **3.10–3.12** for the smoothest installs (PyTorch wheels). Newer Python versions may lack prebuilt `torch` wheels.

## Prerequisites

1. **MySQL** with the same `products` schema as the main OOPshop backend (`id`, `name`, `category`, `description`, …).
2. **Supabase** with **pgvector enabled** on the same database your `DATABASE_URL` uses:
   - **SQL Editor:** run `create extension if not exists vector;` first, then run the rest of `supabase_schema.sql`.
   - **Or** Dashboard → **Database** → **Extensions** → enable **vector**.
3. **Connection string**: Supabase → Project Settings → Database → URI (use `?sslmode=require` if your client requires it).

If you see **`vector type not found`**, enable the **vector** extension (see above) or fix `DATABASE_URL`.

If you see **`relation "public.product_embeddings" does not exist`**, run the **entire** `supabase_schema.sql` — not only `CREATE EXTENSION`. The table and HNSW index must be created in the same database.

## Setup

```bash
cd recommendation
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env   # or cp; then edit .env
```

Fill `.env` with MySQL credentials (`DB_*` or `MYSQL_*`) and `DATABASE_URL` for Supabase.

## Run (local)

```bash
python main.py
# or: uvicorn app.main:app --reload --host 0.0.0.0 --port 8088
```

- `GET /health` — liveness  
- `POST /embeddings/sync` — pull all products from MySQL, embed rows that have some text (name / category / description), upsert into `product_embeddings`  
- `GET /recommendations/{product_id}?k=10` — cosine‑similar products (enriched from MySQL). If the source product has no stored vector yet, it is embedded on the fly and saved.

## Embedding text

For each product, the embedded string is: **name**, **category**, and **description** joined with spaces (empty fields skipped). Rows with nothing to embed are skipped during sync.

## Model and dimensions

Default model: `sentence-transformers/all-MiniLM-L6-v2` (**384** dimensions). If you change `EMBEDDING_MODEL`, set `EMBEDDING_DIM` to match and alter the `vector(384)` column in Supabase accordingly.

## Deploy on Vercel

This folder matches [Vercel’s FastAPI layout](https://vercel.com/docs/frameworks/backend/fastapi): a **root** `main.py` re-exports the `app` instance from `app.main`, so the platform can bundle one serverless function.

1. **Monorepo:** in the Vercel project, set **Root Directory** to `recommendation` (this subdirectory).
2. **Environment variables:** add the same values as `.env.example` (`DATABASE_URL`, `DB_*` / `MYSQL_*`, optional `EMBEDDING_*`, optional `HF_TOKEN` for Hugging Face rate limits).
3. **Python version:** `.python-version` pins **3.12** for Linux builds (aligns with stable PyTorch wheels). Local Windows may still use another version.
4. Deploy: `vercel` / Git push, or `vercel dev` for a local Vercel-shaped run.

**Limits (incl. Hobby):** Python functions allow up to **~500 MB** uncompressed bundle. On Hobby, Vercel fixes functions at **2 GB / 1 vCPU** and [does not allow memory override in `vercel.json`](https://vercel.com/docs/functions/configuring-functions/memory). This project now uses FastAPI zero-config discovery (no `functions` block) to stay compatible with Hobby monorepo builds.

**PyTorch + sentence-transformers** are heavy: builds can hit **size or install timeouts**; cold starts may download the Hugging Face model—use **`HF_TOKEN`** if rate-limited. If deploys still fail on Hobby, use a container/VM host (Railway, Fly.io, Render, etc.) instead.

## Deploy on Render (and IPv6 / Supabase)

**If the build fails with “packages do not match the hashes from the requirements file”:** pip is running in **hash-check mode**. On Render → **Environment**, remove **`PIP_REQUIRE_HASHES`** (or set it to `0`). Your **Build Command** must **not** include `--require-hashes`. Your `requirements.txt` must **not** contain per-line `--hash=sha256:…` entries unless they were generated for **Linux** wheels (Windows/macOS hashes will not match).

**Smaller installs on Render:** `requirements.txt` uses PyTorch’s **CPU** index so the deploy does not pull CUDA/NVIDIA wheels (~several GB).


If logs show **`Network is unreachable`** to `db.*.supabase.co` with an **IPv6** address in parentheses, the platform usually has **no IPv6 egress**. Supabase’s **direct** URL targets IPv6.

**Fix:** In Supabase → **Project Settings** → **Database**, switch to **Connection pooling** and copy the URI (host like `aws-0-*.pooler.supabase.com`, port **6543**). Set that as `DATABASE_URL` on Render (keep `?sslmode=require`). If you hit pooler quirks, try **Session** vs **Transaction** mode in the dashboard. Alternatively, enable Supabase’s **IPv4 add-on** and keep the direct host.

**Production:** run without reload, e.g. `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (Render sets `PORT`; use it instead of hard-coding 8088 if you wire the start command that way).
