-- ============================================================================
-- 0016_owner_reports — periodic owner statements + public share
-- ============================================================================
create table if not exists owner_reports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  owner_id uuid references owners(id) on delete set null,
  yacht_id uuid references yachts(id) on delete set null,
  title text not null,
  period_start date,
  period_end date,
  status text not null default 'draft',
  share_token text unique,
  metrics jsonb not null default '{}',
  narrative text,
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);

create index if not exists owner_reports_org_idx on owner_reports (org_id, created_at desc);

alter table owner_reports enable row level security;
drop policy if exists owner_reports_all on owner_reports;
create policy owner_reports_all on owner_reports
  for all using (org_id = current_org_id()) with check (org_id = current_org_id());

drop trigger if exists trg_set_updated_at on owner_reports;
create trigger trg_set_updated_at before update on owner_reports for each row execute function set_updated_at();

-- public read (anon, published only)
create or replace function public_owner_report(p_token text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'title', r.title, 'period_start', r.period_start, 'period_end', r.period_end,
    'metrics', r.metrics, 'narrative', r.narrative, 'generated_at', r.generated_at,
    'owner', o.name, 'org', org.name
  )
  from owner_reports r
  left join owners o on o.id = r.owner_id
  join organisations org on org.id = r.org_id
  where r.share_token = p_token and r.status = 'published'
  limit 1;
$$;
grant execute on function public_owner_report(text) to anon, authenticated;
