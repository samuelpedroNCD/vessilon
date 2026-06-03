-- ============================================================================
-- 0010_offers_register — deepen offers for a standalone register
-- ============================================================================
-- The offers table already exists (created in pipeline-depth). Add a couple of
-- columns to support a full offer workflow + notes outside the deal view.
alter table offers add column if not exists responded_at timestamptz;
alter table offers add column if not exists notes text;
