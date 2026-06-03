-- Demo companies for the demo org (idempotent).
do $$
declare v_org uuid; c_vfo uuid;
begin
  select org_id into v_org from profiles where email = 'demo@nocodedistrict.com' limit 1;
  if v_org is null then raise notice 'demo org missing'; return; end if;
  if exists (select 1 from companies where org_id = v_org) then raise notice 'companies already seeded'; return; end if;

  insert into companies (org_id, name, type, country, website) values
    (v_org, 'Marettimo Holdings', 'owner', 'Malta', 'marettimo-holdings.example'),
    (v_org, 'Fraser Yachts', 'partner', 'United Kingdom', 'fraser.example'),
    (v_org, 'Costa Maritime Ltd', 'client', 'Italy', 'costamaritime.example');
  insert into companies (org_id, name, type, country, website) values
    (v_org, 'Vasquez Family Office', 'client', 'Monaco', 'vfo.example')
  returning id into c_vfo;

  update clients set company_id = c_vfo where org_id = v_org and name = 'Isabel Vasquez';
  raise notice 'companies seeded';
end $$;
