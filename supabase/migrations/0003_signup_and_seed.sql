-- Vessilon — Phase 2 · Signup provisioning + LOB stage seeding + backfill
-- Idempotent.

-- ============================ seed default LOB stages (spec §8) ============================
create or replace function seed_lob_stages(p_org uuid) returns void
  language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from lob_stages where org_id = p_org) then return; end if;
  insert into lob_stages (org_id, lob, name, position, probability, is_won, is_lost) values
  -- Sale
  (p_org,'sale','Enquiry',1,5,false,false),
  (p_org,'sale','Qualified',2,15,false,false),
  (p_org,'sale','Viewing Scheduled',3,25,false,false),
  (p_org,'sale','Viewed',4,35,false,false),
  (p_org,'sale','Offer Made',5,50,false,false),
  (p_org,'sale','Negotiation',6,60,false,false),
  (p_org,'sale','Conditional',7,75,false,false),
  (p_org,'sale','Survey & Sea Trial',8,85,false,false),
  (p_org,'sale','Completion',9,95,false,false),
  (p_org,'sale','Won',10,100,true,false),
  (p_org,'sale','Lost',11,0,false,true),
  -- Charter
  (p_org,'charter','Enquiry',1,10,false,false),
  (p_org,'charter','Availability Check',2,20,false,false),
  (p_org,'charter','Proposal Sent',3,35,false,false),
  (p_org,'charter','Deposit Requested',4,50,false,false),
  (p_org,'charter','Deposit Received',5,70,false,false),
  (p_org,'charter','Contract Signed',6,85,false,false),
  (p_org,'charter','Pre-Charter Preparation',7,95,false,false),
  (p_org,'charter','Charter Completed',8,100,true,false),
  (p_org,'charter','Lost',9,0,false,true),
  -- New Builds
  (p_org,'new_build','Enquiry',1,5,false,false),
  (p_org,'new_build','Brief Defined',2,15,false,false),
  (p_org,'new_build','Shipyard Shortlist',3,25,false,false),
  (p_org,'new_build','Design Proposal',4,40,false,false),
  (p_org,'new_build','Contract Negotiation',5,60,false,false),
  (p_org,'new_build','Build Contract Signed',6,80,false,false),
  (p_org,'new_build','Build Monitoring',7,90,false,false),
  (p_org,'new_build','Delivery',8,100,true,false),
  (p_org,'new_build','Lost',9,0,false,true),
  -- Co-Ownership
  (p_org,'co_ownership','Enquiry',1,5,false,false),
  (p_org,'co_ownership','Scheme Introduction',2,15,false,false),
  (p_org,'co_ownership','Application Submitted',3,30,false,false),
  (p_org,'co_ownership','Application Review',4,45,false,false),
  (p_org,'co_ownership','Share Agreement Drafted',5,60,false,false),
  (p_org,'co_ownership','Legal Review',6,75,false,false),
  (p_org,'co_ownership','Share Agreement Signed',7,90,false,false),
  (p_org,'co_ownership','Onboarding',8,95,false,false),
  (p_org,'co_ownership','Active',9,100,true,false),
  (p_org,'co_ownership','Lost',10,0,false,true),
  -- Trade
  (p_org,'trade','Enquiry',1,10,false,false),
  (p_org,'trade','Trade-In Valuation',2,30,false,false),
  (p_org,'trade','Trade-In Accepted',3,55,false,false),
  (p_org,'trade','Part-Exchange Contract',4,80,false,false),
  (p_org,'trade','Completion',5,100,true,false),
  (p_org,'trade','Lost',6,0,false,true),
  -- Services
  (p_org,'services','Enquiry',1,10,false,false),
  (p_org,'services','Scope Defined',2,25,false,false),
  (p_org,'services','Proposal Sent',3,45,false,false),
  (p_org,'services','Agreement Signed',4,75,false,false),
  (p_org,'services','Service Active',5,100,true,false),
  (p_org,'services','Renewal Due',6,90,false,false),
  (p_org,'services','Lost',7,0,false,true);
end $$;

-- ============================ provision an org+profile for a user ============================
create or replace function provision_user(p_user_id uuid, p_email text, p_meta jsonb) returns void
  language plpgsql security definer set search_path = public as $$
declare v_org uuid; v_office uuid; v_name text; v_company text; v_initials text;
begin
  if exists (select 1 from profiles where id = p_user_id) then return; end if;

  v_name := coalesce(nullif(p_meta->>'full_name',''), split_part(p_email,'@',1));
  v_company := coalesce(nullif(p_meta->>'company_name',''), v_name || '''s workspace');
  v_initials := upper(left(coalesce(nullif(split_part(v_name,' ',1),''),'V'),1)
              || coalesce(left(nullif(split_part(v_name,' ',2),''),1),''));
  if v_initials = '' then v_initials := upper(left(v_name,2)); end if;

  insert into organisations (name, account_type, region, fleet_size)
    values (v_company, p_meta->>'account_type', p_meta->>'region', p_meta->>'fleet_size')
    returning id into v_org;

  insert into offices (org_id, name) values (v_org, 'Head office') returning id into v_office;

  insert into profiles (id, org_id, role, full_name, email, title, office_id, avatar_initials)
    values (p_user_id, v_org, 'admin', v_name, p_email, nullif(p_meta->>'role',''), v_office, v_initials);

  perform seed_lob_stages(v_org);
end $$;

-- ============================ trigger on new auth users ============================
create or replace function handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  perform provision_user(new.id, new.email, coalesce(new.raw_user_meta_data, '{}'::jsonb));
  return new;
exception when others then
  return new; -- never block auth signup
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================ backfill existing users ============================
do $$
declare u record;
begin
  for u in select id, email, raw_user_meta_data from auth.users
           where id not in (select id from profiles)
  loop
    perform provision_user(u.id, u.email, coalesce(u.raw_user_meta_data, '{}'::jsonb));
  end loop;
end $$;
