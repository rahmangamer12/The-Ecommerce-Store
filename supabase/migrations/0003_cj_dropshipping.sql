-- =============================================================
--  Migration 0003 — CJ Dropshipping automation
-- =============================================================
--  Adds the columns needed to (a) import products from CJ and
--  (b) auto-forward paid orders to CJ for fulfilment.
--
--  products:
--    source        where the product came from: 'manual' | 'cj' | 'affiliate'
--    cost          what YOU pay the supplier (USD) — used to show your margin
--    cj_pid        CJ product id (the whole product)
--    cj_vid        CJ variant id (the exact SKU we order for the customer)
--    cj_sku        CJ SKU code (human-readable)
--
--  orders:
--    cj_order_id       the order id CJ gives back after we forward it
--    cj_order_num      the order number CJ assigns
--    fulfillment_status  'not_sent' | 'sent' | 'failed' | 'skipped'
--    fulfillment_error   last error text when a CJ push failed
--    tracking_number   parcel tracking number (once CJ ships)
--    tracking_url      link the customer can track the parcel on
--
--  How to apply: paste into Supabase SQL Editor and Run. Safe to
--  re-run (uses "if not exists").
-- =============================================================

alter table products
  add column if not exists source text default 'manual',
  add column if not exists cost numeric(10,2),
  add column if not exists cj_pid text,
  add column if not exists cj_vid text,
  add column if not exists cj_sku text;

alter table orders
  add column if not exists cj_order_id text,
  add column if not exists cj_order_num text,
  add column if not exists fulfillment_status text default 'not_sent',
  add column if not exists fulfillment_error text,
  add column if not exists tracking_number text,
  add column if not exists tracking_url text;

-- Helpful for looking up which DB product maps to a CJ product.
create index if not exists products_cj_pid_idx on products (cj_pid);
