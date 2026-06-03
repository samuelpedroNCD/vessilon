-- Vessilon — Phase 5 depth: stage history, offers, closing checklist, SLA, LOB details
-- Idempotent.

alter table opportunities add column if not exists stage_entered_at timestamptz default now();
alter table opportunities add column if not exists details jsonb not null default '{}';
alter table opportunities add column if not exists close_reason text;

alter table lob_stages add column if not exists sla_days int;

-- stage-change / won / lost history
create table if not exists opportunity_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  kind text not null default 'stage_change',
  from_stage text,
  to_stage text,
  note text,
  actor uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_oppevents_opp on opportunity_events(opportunity_id, created_at desc);
create index if not exists idx_oppevents_org on opportunity_events(org_id);

-- structured offers / LOI
create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  party text,
  kind text not null default 'offer',
  amount numeric,
  currency text default 'USD',
  conditions text,
  response_deadline date,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);
create index if not exists idx_offers_opp on offers(opportunity_id, created_at desc);
create index if not exists idx_offers_org on offers(org_id);

-- closing checklist
create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  label text not null,
  position int not null default 0,
  done boolean not null default false,
  done_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_checklist_opp on checklist_items(opportunity_id, position);
create index if not exists idx_checklist_org on checklist_items(org_id);

-- updated_at not needed on these append-mostly tables

-- RLS: org isolation (single permissive policy per table)
alter table opportunity_events enable row level security;
alter table offers enable row level security;
alter table checklist_items enable row level security;
do $$
declare t text;
begin
  foreach t in array array['opportunity_events','offers','checklist_items'] loop
    execute format('drop policy if exists %1$s_all on %1$s;', t);
    execute format('create policy %1$s_all on %1$s for all using (org_id = current_org_id()) with check (org_id = current_org_id());', t);
  end loop;
end $$;

-- sensible default SLA per sale stage (days) for the demo org's stages
update lob_stages set sla_days = case
  when name in ('Enquiry') then 14
  when name in ('Qualified','Viewing Scheduled','Viewed') then 21
  when name in ('Offer Made','Negotiation') then 14
  when name in ('Conditional','Survey & Sea Trial') then 30
  when name in ('Completion') then 21
  else null end
where sla_days is null and lob = 'sale';
