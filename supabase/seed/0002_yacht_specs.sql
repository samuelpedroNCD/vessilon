-- Enrich demo-org yachts with plausible specs (derived from LOA) so detail
-- pages render fully. Idempotent: only fills empty specs.
update yachts y set specs = jsonb_build_object(
  'beam', round((y.loa_m * 0.17)::numeric, 1)::text || ' m',
  'gross_tonnage', round((y.loa_m * y.loa_m * 0.28)::numeric)::text || ' GT',
  'guests', '12',
  'cabins', '6',
  'engines', '2× MTU 16V',
  'cruise', '12',
  'max_speed', '16',
  'range', '4,000 nm',
  'fuel', '85,000 L',
  'naval_architect', coalesce(y.builder, 'In-house'),
  'refit_year', (y.year + 5)::text,
  'flag', 'Cayman Islands',
  'class', 'LR 100A1 SSC',
  'hull_material', case when y.type = 'sail' then 'Composite' else 'Steel / aluminium' end,
  'tender', 'Williams 505'
)
from profiles p
where p.email = 'demo@nocodedistrict.com'
  and y.org_id = p.org_id
  and (y.specs is null or y.specs = '{}'::jsonb);
