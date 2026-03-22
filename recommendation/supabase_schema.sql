-- Run in Supabase SQL Editor (once per project).
-- Enables pgvector and stores one row per product aligned with MySQL `products.id`.

create extension if not exists vector;

create table if not exists public.product_embeddings (
  product_id bigint primary key,
  description_preview text,
  embedding vector(384),
  updated_at timestamptz not null default now()
);

-- Cosine distance for "similar descriptions" (same space as 1 - distance ≈ similarity).
create index if not exists product_embeddings_embedding_idx
  on public.product_embeddings
  using hnsw (embedding vector_cosine_ops);

comment on table public.product_embeddings is 'OOPshop product vectors; product_id matches MySQL products.id';
