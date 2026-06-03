-- ============================================================================
-- 0009_public_brochure — anonymous read of a PUBLISHED brochure by share token
-- ============================================================================
-- A SECURITY DEFINER function lets the public /b/[token] page resolve a
-- published brochure into its yacht's marketing data without granting anon any
-- table access. Only brochures with status='published' are ever returned.

create or replace function public_brochure(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'name', y.name,
    'builder', y.builder,
    'year', y.year,
    'loa_m', y.loa_m,
    'price', y.price,
    'currency', y.currency,
    'type', y.type,
    'lob', y.lob,
    'region', y.region,
    'status', y.status,
    'hero_image', y.hero_image,
    'specs', y.specs,
    'org', o.name,
    'brochure_type', b.type,
    'generated_at', b.generated_at
  )
  from brochures b
  join yachts y on y.id = b.yacht_id
  join organisations o on o.id = b.org_id
  where b.share_token = p_token
    and b.status = 'published'
  limit 1;
$$;

grant execute on function public_brochure(text) to anon, authenticated;
