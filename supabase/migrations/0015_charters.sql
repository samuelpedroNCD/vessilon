-- ============================================================================
-- 0015_charters — charter bookings + seasonal rates
-- ============================================================================
create table if not exists charters (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  yacht_id uuid references yachts(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  broker uuid references profiles(id) on delete set null,
  start_on date,
  end_on date,
  gross_fee numeric,
  apa numeric,
  currency text default 'EUR',
  status text not null default 'enquiry',
  destination text,
  guests int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);

create table if not exists charter_rates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  yacht_id uuid not null references yachts(id) on delete cascade,
  season text,
  weekly_rate numeric,
  currency text default 'EUR',
  created_at timestamptz not null default now()
);

create index if not exists charters_org_start_idx on charters (org_id, start_on);
create index if not exists charter_rates_yacht_idx on charter_rates (yacht_id);

do $$
declare t text;
begin
  foreach t in array array['charters','charter_rates']
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists %1$s_all on %1$s;', t);
    execute format('create policy %1$s_all on %1$s for all using (org_id = current_org_id()) with check (org_id = current_org_id());', t);
  end loop;
end $$;

drop trigger if exists trg_set_updated_at on charters;
create trigger trg_set_updated_at before update on charters for each row execute function set_updated_at();
