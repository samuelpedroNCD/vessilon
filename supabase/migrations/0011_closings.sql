-- ============================================================================
-- 0011_closings — transaction/closing workspace
-- ============================================================================
alter table opportunities add column if not exists escrow_amount numeric;
alter table opportunities add column if not exists escrow_status text;
alter table opportunities add column if not exists closing_date date;

create table if not exists closing_milestones (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  title text not null,
  due_on date,
  done boolean not null default false,
  done_at timestamptz,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists closing_parties (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  role text not null default 'other',
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists commission_splits (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  broker_id uuid references profiles(id) on delete set null,
  name text,
  pct numeric,
  amount numeric,
  created_at timestamptz not null default now()
);

create index if not exists closing_milestones_opp_idx on closing_milestones (opportunity_id, position);
create index if not exists closing_parties_opp_idx on closing_parties (opportunity_id);
create index if not exists commission_splits_opp_idx on commission_splits (opportunity_id);

-- RLS: org-isolation, single permissive policy (append-only style)
do $$
declare t text;
begin
  foreach t in array array['closing_milestones','closing_parties','commission_splits']
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists %1$s_all on %1$s;', t);
    execute format('create policy %1$s_all on %1$s for all using (org_id = current_org_id()) with check (org_id = current_org_id());', t);
  end loop;
end $$;
