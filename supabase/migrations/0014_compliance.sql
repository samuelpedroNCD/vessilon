-- ============================================================================
-- 0014_compliance — vessel certificate / expiry tracking
-- ============================================================================
create table if not exists vessel_certificates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  yacht_id uuid not null references yachts(id) on delete cascade,
  type text not null default 'other',
  name text,
  issuer text,
  reference text,
  issued_on date,
  expires_on date,
  created_at timestamptz not null default now()
);

create index if not exists vessel_certificates_yacht_idx on vessel_certificates (yacht_id);
create index if not exists vessel_certificates_org_idx on vessel_certificates (org_id, expires_on);

alter table vessel_certificates enable row level security;
drop policy if exists vessel_certificates_all on vessel_certificates;
create policy vessel_certificates_all on vessel_certificates
  for all using (org_id = current_org_id()) with check (org_id = current_org_id());
