-- ============================================================================
-- 0013_crew — crew roster, certificates, assignments
-- ============================================================================
create table if not exists crew (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  name text not null,
  position text,
  nationality text,
  email text,
  phone text,
  status text not null default 'available',
  current_yacht_id uuid references yachts(id) on delete set null,
  day_rate numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);

create table if not exists crew_certificates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  crew_id uuid not null references crew(id) on delete cascade,
  name text not null,
  number text,
  issuer text,
  issued_on date,
  expires_on date,
  created_at timestamptz not null default now()
);

create table if not exists crew_assignments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  crew_id uuid not null references crew(id) on delete cascade,
  yacht_id uuid references yachts(id) on delete set null,
  role text,
  start_on date,
  end_on date,
  created_at timestamptz not null default now()
);

create index if not exists crew_certificates_crew_idx on crew_certificates (crew_id);
create index if not exists crew_assignments_crew_idx on crew_assignments (crew_id);
create index if not exists crew_assignments_yacht_idx on crew_assignments (yacht_id);

do $$
declare t text;
begin
  foreach t in array array['crew','crew_certificates','crew_assignments']
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists %1$s_all on %1$s;', t);
    execute format('create policy %1$s_all on %1$s for all using (org_id = current_org_id()) with check (org_id = current_org_id());', t);
  end loop;
end $$;

drop trigger if exists trg_set_updated_at on crew;
create trigger trg_set_updated_at before update on crew for each row execute function set_updated_at();
