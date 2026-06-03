-- ============================================================================
-- 0008_audit_log — immutable activity/audit trail
-- ============================================================================
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  actor_name text,
  action text not null,            -- create | update | delete | upload | stage_move | ...
  entity_type text not null,       -- yacht | lead | client | owner | opportunity | document | user | brochure
  entity_id uuid,
  entity_label text,
  summary text,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists audit_log_org_created_idx on audit_log (org_id, created_at desc);
create index if not exists audit_log_entity_idx on audit_log (org_id, entity_type, entity_id);

alter table audit_log enable row level security;

-- Staff read their org's trail; any member may append; rows are immutable
-- (no update/delete policies).
drop policy if exists audit_log_select on audit_log;
create policy audit_log_select on audit_log
  for select using (org_id = current_org_id() and is_staff());

drop policy if exists audit_log_insert on audit_log;
create policy audit_log_insert on audit_log
  for insert with check (org_id = current_org_id());
