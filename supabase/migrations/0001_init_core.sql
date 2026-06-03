-- Vessilon — Phase 2 · Core data model (V1)
-- Yacht-centric, multi-tenant. Every business table carries org_id.
-- Idempotent: safe to re-run.

create extension if not exists pgcrypto;

-- ============================ ENUMS ============================
do $$ begin create type app_role as enum ('admin','executive','senior_broker','broker','marketing','operations','client'); exception when duplicate_object then null; end $$;
do $$ begin create type lob as enum ('sale','charter','new_build','co_ownership','trade','services'); exception when duplicate_object then null; end $$;
do $$ begin create type yacht_type as enum ('motor','sail'); exception when duplicate_object then null; end $$;
do $$ begin create type yacht_status as enum ('draft','active','under_offer','conditional','sold','off_market','expired','charter_only','new_build','co_ownership'); exception when duplicate_object then null; end $$;
do $$ begin create type lead_status as enum ('new','contacted','qualified','converted','unqualified','lost'); exception when duplicate_object then null; end $$;
do $$ begin create type temperature as enum ('hot','warm','cold'); exception when duplicate_object then null; end $$;
do $$ begin create type interaction_type as enum ('call','email','meeting','viewing','brochure_share','whatsapp','note','task_completion','event','other'); exception when duplicate_object then null; end $$;
do $$ begin create type task_status as enum ('todo','in_progress','waiting','completed','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type task_priority as enum ('high','medium','low'); exception when duplicate_object then null; end $$;
do $$ begin create type opp_status as enum ('open','won','lost'); exception when duplicate_object then null; end $$;
do $$ begin create type client_category as enum ('buyer','seller','charter_guest','co_owner','owner'); exception when duplicate_object then null; end $$;
do $$ begin create type company_type as enum ('owner','client','partner','broker','other'); exception when duplicate_object then null; end $$;
do $$ begin create type document_type as enum ('yacht_spec','survey','sea_trial','purchase_agreement','charter_contract','invoice','loi','nda','insurance','owner_mandate','marketing','other'); exception when duplicate_object then null; end $$;
do $$ begin create type brochure_type as enum ('sale','charter','full_spec','co_ownership','one_page'); exception when duplicate_object then null; end $$;

-- shared updated_at trigger fn
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ============================ TABLES ============================
create table if not exists organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  account_type text,
  region text,
  fleet_size text,
  settings jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists offices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  name text not null,
  city text, country text, timezone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references organisations(id) on delete cascade,
  role app_role not null default 'broker',
  full_name text,
  email text,
  title text,
  office_id uuid references offices(id) on delete set null,
  avatar_initials text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  name text not null,
  type company_type not null default 'other',
  vat_id text, country text, website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);

create table if not exists owners (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  name text not null,
  company_id uuid references companies(id) on delete set null,
  email text, phone text, notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  name text not null,
  company_id uuid references companies(id) on delete set null,
  email text, phone text,
  categories client_category[] not null default '{}',
  temperature temperature,
  source text,
  preferences jsonb not null default '{}',
  assigned_broker uuid references profiles(id) on delete set null,
  gdpr_consent boolean not null default false,
  gdpr_consent_at timestamptz,
  last_interaction_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  name text, email text, phone text,
  lob lob,
  status lead_status not null default 'new',
  temperature temperature,
  source text, sub_source text,
  ai_confidence numeric,
  preferences jsonb not null default '{}',
  assigned_broker uuid references profiles(id) on delete set null,
  converted_client_id uuid references clients(id) on delete set null,
  do_not_contact boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);

create table if not exists yachts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  name text not null,
  type yacht_type,
  builder text,
  loa_m numeric,
  year int,
  price numeric,
  currency text default 'USD',
  lob lob not null default 'sale',
  status yacht_status not null default 'active',
  region text,
  hull_id text,
  imo text,
  office_id uuid references offices(id) on delete set null,
  owner_id uuid references owners(id) on delete set null,
  primary_broker uuid references profiles(id) on delete set null,
  specs jsonb not null default '{}',
  hero_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);

create table if not exists lob_stages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  lob lob not null,
  name text not null,
  position int not null,
  probability numeric not null default 0,
  is_won boolean not null default false,
  is_lost boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists lob_stages_org_lob_pos on lob_stages(org_id, lob, position);

create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  title text not null,
  lob lob not null,
  client_id uuid references clients(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  yacht_id uuid references yachts(id) on delete set null,
  stage_id uuid references lob_stages(id) on delete set null,
  value numeric,
  currency text default 'USD',
  probability numeric,
  expected_close date,
  status opp_status not null default 'open',
  assigned_broker uuid references profiles(id) on delete set null,
  won_at timestamptz,
  lost_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);

create table if not exists interactions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  type interaction_type not null default 'note',
  client_id uuid references clients(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  yacht_id uuid references yachts(id) on delete set null,
  opportunity_id uuid references opportunities(id) on delete set null,
  broker_id uuid references profiles(id) on delete set null,
  notes text, outcome text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  priority task_priority not null default 'medium',
  status task_status not null default 'todo',
  assignee uuid references profiles(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  yacht_id uuid references yachts(id) on delete set null,
  opportunity_id uuid references opportunities(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  name text not null,
  type document_type not null default 'other',
  yacht_id uuid references yachts(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  owner_id uuid references owners(id) on delete set null,
  opportunity_id uuid references opportunities(id) on delete set null,
  storage_path text,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);

create table if not exists brochures (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  yacht_id uuid references yachts(id) on delete cascade,
  type brochure_type not null default 'sale',
  status text not null default 'draft',
  share_token text unique,
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);

-- ============================ updated_at triggers ============================
do $$
declare t text;
begin
  foreach t in array array['organisations','offices','profiles','companies','owners','clients','leads','yachts','opportunities','interactions','tasks','documents','brochures']
  loop
    execute format('drop trigger if exists trg_set_updated_at on %I;', t);
    execute format('create trigger trg_set_updated_at before update on %I for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- ============================ indexes ============================
create index if not exists idx_offices_org on offices(org_id);
create index if not exists idx_profiles_org on profiles(org_id);
create index if not exists idx_companies_org on companies(org_id);
create index if not exists idx_owners_org on owners(org_id);
create index if not exists idx_clients_org on clients(org_id);
create index if not exists idx_clients_broker on clients(assigned_broker);
create index if not exists idx_leads_org on leads(org_id);
create index if not exists idx_leads_broker on leads(assigned_broker);
create index if not exists idx_yachts_org on yachts(org_id);
create index if not exists idx_yachts_broker on yachts(primary_broker);
create index if not exists idx_yachts_status on yachts(org_id, status);
create index if not exists idx_lob_stages_org on lob_stages(org_id, lob);
create index if not exists idx_opps_org on opportunities(org_id);
create index if not exists idx_opps_stage on opportunities(stage_id);
create index if not exists idx_opps_yacht on opportunities(yacht_id);
create index if not exists idx_opps_broker on opportunities(assigned_broker);
create index if not exists idx_opps_close on opportunities(org_id, expected_close);
create index if not exists idx_interactions_org on interactions(org_id);
create index if not exists idx_interactions_occurred on interactions(org_id, occurred_at desc);
create index if not exists idx_tasks_org on tasks(org_id);
create index if not exists idx_tasks_assignee_due on tasks(assignee, due_at);
create index if not exists idx_documents_org on documents(org_id);
create index if not exists idx_brochures_org on brochures(org_id);
