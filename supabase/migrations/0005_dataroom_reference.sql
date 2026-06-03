-- Vessilon — DataRoom reference directories (§3.7–3.14). Idempotent.
create table if not exists shipyards (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  name text not null, country text, city text, website text,
  specialisations text, services text, status text default 'active',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);
create table if not exists marinas (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  name text not null, country text, city text, website text,
  berths int, max_loa numeric, amenities text, status text default 'active',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  name text not null, supplier_type text, country text, email text, phone text,
  rating int, notes text, status text default 'active',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);
create table if not exists designers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  name text not null, discipline text, nationality text, website text, notable_works text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);
create table if not exists partnerships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  name text not null, type text, region text, commission_structure text, status text default 'active',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);
create table if not exists destinations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  name text not null, country text, region text, description text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);

-- updated_at + RLS + indexes
do $$
declare t text;
begin
  foreach t in array array['shipyards','marinas','suppliers','designers','partnerships','destinations']
  loop
    execute format('drop trigger if exists trg_set_updated_at on %I; create trigger trg_set_updated_at before update on %I for each row execute function set_updated_at();', t, t);
    execute format('create index if not exists idx_%1$s_org on %1$s(org_id);', t);
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists %1$s_all on %1$s;', t);
    execute format('create policy %1$s_all on %1$s for all using (org_id = current_org_id()) with check (org_id = current_org_id());', t);
  end loop;
end $$;
