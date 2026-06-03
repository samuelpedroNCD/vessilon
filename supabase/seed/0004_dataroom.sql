-- Demo DataRoom reference data (idempotent per table).
do $$
declare v_org uuid;
begin
  select org_id into v_org from profiles where email = 'demo@nocodedistrict.com' limit 1;
  if v_org is null then return; end if;

  if not exists (select 1 from shipyards where org_id = v_org) then
    insert into shipyards (org_id, name, country, city, specialisations, services) values
      (v_org, 'Benetti', 'Italy', 'Viareggio', 'Custom & semi-custom motor yachts', 'New Build, Refit'),
      (v_org, 'Feadship', 'Netherlands', 'Amsterdam', 'Full-custom superyachts', 'New Build'),
      (v_org, 'Lürssen', 'Germany', 'Bremen', 'Large custom superyachts', 'New Build, Refit');
  end if;
  if not exists (select 1 from marinas where org_id = v_org) then
    insert into marinas (org_id, name, country, city, berths, max_loa, amenities) values
      (v_org, 'Port Hercule', 'Monaco', 'Monaco', 700, 135, 'Fuel, water, security, concierge'),
      (v_org, 'Marina di Portofino', 'Italy', 'Portofino', 280, 70, 'Fuel, water, restaurant'),
      (v_org, 'Puerto Banús', 'Spain', 'Marbella', 915, 50, 'Fuel, chandlery, shopping');
  end if;
  if not exists (select 1 from suppliers where org_id = v_org) then
    insert into suppliers (org_id, name, supplier_type, country, email, rating) values
      (v_org, 'BMT Surveyors', 'Surveyor', 'United Kingdom', 'ops@bmt.example', 5),
      (v_org, 'Pantaenius', 'Insurance Broker', 'Germany', 'yacht@pantaenius.example', 5),
      (v_org, 'Hill Dickinson', 'Legal', 'United Kingdom', 'marine@hilldickinson.example', 4);
  end if;
  if not exists (select 1 from designers where org_id = v_org) then
    insert into designers (org_id, name, discipline, nationality, notable_works) values
      (v_org, 'Espen Øino', 'Naval Architect', 'Norway', 'Numerous 60m+ motor yachts'),
      (v_org, 'Winch Design', 'Exterior Designer', 'United Kingdom', 'Full-custom exterior & interior'),
      (v_org, 'Reymond Langton', 'Interior Designer', 'United Kingdom', 'Award-winning interiors');
  end if;
  if not exists (select 1 from partnerships where org_id = v_org) then
    insert into partnerships (org_id, name, type, region, commission_structure, status) values
      (v_org, 'Fraser Yachts', 'Co-Brokerage', 'Global', '50 / 50 co-broke', 'active'),
      (v_org, 'Burgess', 'Co-Brokerage', 'Global', '50 / 50 co-broke', 'active');
  end if;
  if not exists (select 1 from destinations where org_id = v_org) then
    insert into destinations (org_id, name, country, region, description) values
      (v_org, 'Amalfi Coast', 'Italy', 'West Med', 'Dramatic cliffs, Positano, Capri.'),
      (v_org, 'Balearics', 'Spain', 'West Med', 'Ibiza, Formentera, Mallorca.'),
      (v_org, 'French Riviera', 'France', 'West Med', 'St-Tropez, Cannes, Monaco.');
  end if;
end $$;
