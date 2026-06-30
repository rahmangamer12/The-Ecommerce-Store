-- =============================================================
--  Migration 0002 — Affiliate links + payment method
-- =============================================================
--  affiliate_url: when set on a product, the storefront shows a
--  "Buy now" button that links out to this URL (e.g. an Amazon
--  affiliate link) so you can earn affiliate commission.
--
--  payment_method: how the customer chose to pay (e.g. Cash on
--  Delivery). Physical-goods stores in Qatar/GCC commonly use COD.
--
--  How to apply: paste into Supabase SQL Editor and Run. Safe to
--  re-run (uses "if not exists").
-- =============================================================

alter table products
  add column if not exists affiliate_url text;

alter table orders
  add column if not exists payment_method text default 'cod';
  