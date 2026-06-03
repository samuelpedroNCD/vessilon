-- ============================================================================
-- 0012_listings — public-facing marketing catalogue
-- ============================================================================
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  yacht_id uuid not null references yachts(id) on delete cascade,
  headline text,
  description text,
  highlights text[] not null default '{}',
  featured boolean not null default false,
  status text not null default 'draft',
  share_token text unique,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null,
  unique (yacht_id)
);

create table if not exists listing_media (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  yacht_id uuid not null references yachts(id) on delete cascade,
  storage_path text not null,
  caption text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists listing_media_yacht_idx on listing_media (yacht_id, position);

do $$
declare t text;
begin
  foreach t in array array['listings','listing_media']
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists %1$s_all on %1$s;', t);
    execute format('create policy %1$s_all on %1$s for all using (org_id = current_org_id()) with check (org_id = current_org_id());', t);
  end loop;
end $$;

-- updated_at trigger for listings (reuse the shared set_updated_at function)
drop trigger if exists trg_set_updated_at on listings;
create trigger trg_set_updated_at before update on listings
  for each row execute function set_updated_at();

-- give any org without a slug a unique one (needed for the public catalogue URL)
update organisations set slug = 'org-' || left(id::text, 8) where slug is null;

-- ---------------- public read RPCs (anon, published only) ----------------
create or replace function public_listings(p_slug text)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(row order by featured desc, name), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'token', l.share_token, 'headline', l.headline, 'featured', l.featured,
      'name', y.name, 'type', y.type, 'builder', y.builder, 'year', y.year,
      'loa_m', y.loa_m, 'price', y.price, 'currency', y.currency, 'lob', y.lob,
      'hero_image', y.hero_image
    ) as row, l.featured as featured, y.name as name
    from listings l
    join yachts y on y.id = l.yacht_id
    join organisations o on o.id = l.org_id
    where o.slug = p_slug and l.status = 'published'
  ) s;
$$;

create or replace function public_listing(p_token text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'headline', l.headline, 'description', l.description, 'highlights', l.highlights,
    'name', y.name, 'type', y.type, 'builder', y.builder, 'year', y.year,
    'loa_m', y.loa_m, 'price', y.price, 'currency', y.currency, 'lob', y.lob,
    'region', y.region, 'status', y.status, 'hero_image', y.hero_image, 'specs', y.specs,
    'org', o.name, 'org_slug', o.slug
  )
  from listings l
  join yachts y on y.id = l.yacht_id
  join organisations o on o.id = l.org_id
  where l.share_token = p_token and l.status = 'published'
  limit 1;
$$;

grant execute on function public_listings(text) to anon, authenticated;
grant execute on function public_listing(text) to anon, authenticated;
