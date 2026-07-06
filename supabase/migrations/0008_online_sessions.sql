-- =============================================================
--  Migration 0008 — Live "online now" presence
-- =============================================================
--  One row per active browser session, refreshed by a heartbeat
--  every ~45s while the tab is open. "Online now" = rows whose
--  last_seen is within the last ~90 seconds.
--
--  How to apply:  npm run db:migrate
-- =============================================================

create table if not exists online_sessions (
  session_id text primary key,
  last_seen timestamptz not null default now()
);

create index if not exists online_sessions_seen_idx on online_sessions (last_seen);

alter table online_sessions enable row level security;
