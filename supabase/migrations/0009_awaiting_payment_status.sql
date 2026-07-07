-- =============================================================
--  Migration 0009 — "awaiting_payment" order status
-- =============================================================
--  Bank transfer & WhatsApp orders are pay-later: they start as
--  "awaiting_payment" (NOT a successful/paid order) until the
--  customer pays and the store owner confirms it.
--
--  How to apply:  npm run db:migrate
-- =============================================================

alter type order_status add value if not exists 'awaiting_payment';
