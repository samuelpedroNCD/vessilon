-- Vessilon — demo org seed. Idempotent (skips if the demo org already has yachts).
-- Resolves the demo org from the demo user's profile (demo@nocodedistrict.com).
do $$
declare
  v_org uuid; v_broker uuid; v_office uuid;
  s_enq uuid; s_view uuid; s_offer uuid; s_cond uuid; s_won uuid;
begin
  select p.org_id, p.id into v_org, v_broker from profiles p where p.email = 'demo@nocodedistrict.com' limit 1;
  if v_org is null then raise notice 'demo user not provisioned yet; skipping seed'; return; end if;
  select id into v_office from offices where org_id = v_org limit 1;
  if exists (select 1 from yachts where org_id = v_org) then raise notice 'demo org already seeded'; return; end if;

  -- sale stage ids
  select id into s_enq   from lob_stages where org_id=v_org and lob='sale' and name='Enquiry';
  select id into s_view  from lob_stages where org_id=v_org and lob='sale' and name='Viewing Scheduled';
  select id into s_offer from lob_stages where org_id=v_org and lob='sale' and name='Offer Made';
  select id into s_cond  from lob_stages where org_id=v_org and lob='sale' and name='Conditional';
  select id into s_won   from lob_stages where org_id=v_org and lob='sale' and name='Won';

  -- owners
  insert into owners (org_id, name, email) values
    (v_org,'Bernet Holdings','contact@bernet.example'),
    (v_org,'Vasquez Family Office','office@vasquez.example'),
    (v_org,'Costa Maritime Ltd','info@costamaritime.example');

  -- clients (assigned to the demo broker)
  insert into clients (org_id, name, email, categories, temperature, source, assigned_broker, gdpr_consent, last_interaction_at) values
    (v_org,'Isabel Vasquez','i.vasquez@example.com','{buyer}','hot','referral',v_broker,true, now()-interval '2 days'),
    (v_org,'Frederic Costa','f.costa@example.com','{buyer}','warm','website',v_broker,true, now()-interval '5 days'),
    (v_org,'Edmund Halbert','e.halbert@example.com','{buyer,seller}','warm','event',v_broker,true, now()-interval '9 days'),
    (v_org,'Lena Bernet','l.bernet@example.com','{buyer}','hot','referral',v_broker,true, now()-interval '1 day'),
    (v_org,'Marco Aurelio','m.aurelio@example.com','{charter_guest}','cold','website',v_broker,false, now()-interval '20 days');

  -- leads
  insert into leads (org_id, name, email, lob, status, temperature, source, ai_confidence, assigned_broker) values
    (v_org,'Monaco enquiry','charter.monaco@example.com','charter','new','hot','website form',0.94,v_broker),
    (v_org,'UAE HNW (Apollo)','hnw.uae@example.com','sale','contacted','warm','prospecting',0.81,v_broker),
    (v_org,'Genoa walk-in','genoa@example.com','sale','qualified','warm','event',null,v_broker);

  -- yachts (hero_color maps to the dashboard vthumb variants: '', 'b','c','d')
  insert into yachts (org_id, name, type, builder, loa_m, year, price, currency, lob, status, region, hull_id, primary_broker, hero_color) values
    (v_org,'M/Y Astralis','motor','Benetti',54.0,2019,37400000,'USD','sale','under_offer','West Med','BEN84221',v_broker,''),
    (v_org,'M/Y Caelum','motor','Lurssen',42.7,2017,22000000,'USD','sale','active','West Med','LUR55709',v_broker,'c'),
    (v_org,'S/Y Polaris IV','sail','Nautor',38.4,2015,12900000,'USD','sale','active','Caribbean','NAU63310',v_broker,'b'),
    (v_org,'S/Y Brisant','sail','Baltic',33.1,2014,8200000,'USD','sale','conditional','North Europe','BAL30912',v_broker,'b'),
    (v_org,'M/Y Solenne','motor','Lindblad',44.5,2018,19500000,'USD','sale','conditional','West Med','LIN44721',v_broker,'c'),
    (v_org,'M/Y Ardea','motor','Benetti',48.0,2016,26300000,'USD','sale','conditional','West Med','BEN72031',v_broker,''),
    (v_org,'M/Y Larkspur','motor','Oceanco',61.3,2012,74000000,'USD','sale','active','West Med','OCE71450',v_broker,''),
    (v_org,'M/Y Hectorin','motor','Ferretti',49.2,2013,28400000,'USD','sale','active','West Med','FER41028',v_broker,'c'),
    (v_org,'S/Y Calliope','sail','Sanlorenzo',32.0,2011,6800000,'USD','sale','active','Caribbean','SAN29103',v_broker,'b'),
    (v_org,'M/Y Aurelia','motor','Baglietto',46.0,2015,21200000,'USD','sale','under_offer','West Med','BAG72104',v_broker,'b'),
    (v_org,'M/Y Selene','motor','Oceanco',39.0,2010,13400000,'USD','sale','sold','West Med','OCE12048',v_broker,'d'),
    (v_org,'M/Y Mistral','motor','CRN',52.8,2014,33900000,'USD','sale','sold','West Med','CRN30412',v_broker,'');

  -- opportunities mapped onto real sale stages
  -- Enquiry
  insert into opportunities (org_id, title, lob, yacht_id, stage_id, value, expected_close, status, assigned_broker)
    select v_org,'Hectorin · enquiry','sale', y.id, s_enq, 28400000, current_date+60,'open',v_broker from yachts y where y.org_id=v_org and y.name='M/Y Hectorin';
  insert into opportunities (org_id, title, lob, yacht_id, stage_id, value, expected_close, status, assigned_broker)
    select v_org,'Calliope · enquiry','sale', y.id, s_enq, 6800000, current_date+75,'open',v_broker from yachts y where y.org_id=v_org and y.name='S/Y Calliope';
  insert into opportunities (org_id, title, lob, yacht_id, stage_id, value, expected_close, status, assigned_broker)
    select v_org,'Larkspur · enquiry','sale', y.id, s_enq, 74000000, current_date+90,'open',v_broker from yachts y where y.org_id=v_org and y.name='M/Y Larkspur';
  -- Viewing
  insert into opportunities (org_id, title, lob, yacht_id, stage_id, value, expected_close, status, assigned_broker)
    select v_org,'Caelum · 2 showings','sale', y.id, s_view, 22000000, current_date+30,'open',v_broker from yachts y where y.org_id=v_org and y.name='M/Y Caelum';
  insert into opportunities (org_id, title, lob, yacht_id, stage_id, value, expected_close, status, assigned_broker)
    select v_org,'Polaris IV · showing','sale', y.id, s_view, 12900000, current_date+40,'open',v_broker from yachts y where y.org_id=v_org and y.name='S/Y Polaris IV';
  -- Offer
  insert into opportunities (org_id, title, lob, yacht_id, stage_id, value, expected_close, status, assigned_broker)
    select v_org,'Astralis · counter sent','sale', y.id, s_offer, 37400000, current_date+21,'open',v_broker from yachts y where y.org_id=v_org and y.name='M/Y Astralis';
  insert into opportunities (org_id, title, lob, yacht_id, stage_id, value, expected_close, status, assigned_broker)
    select v_org,'Aurelia · offer received','sale', y.id, s_offer, 21200000, current_date+28,'open',v_broker from yachts y where y.org_id=v_org and y.name='M/Y Aurelia';
  -- Conditional / closing this week
  insert into opportunities (org_id, title, lob, yacht_id, stage_id, value, expected_close, status, assigned_broker)
    select v_org,'Brisant · closing','sale', y.id, s_cond, 8200000, current_date+2,'open',v_broker from yachts y where y.org_id=v_org and y.name='S/Y Brisant';
  insert into opportunities (org_id, title, lob, yacht_id, stage_id, value, expected_close, status, assigned_broker)
    select v_org,'Solenne · survey pending','sale', y.id, s_cond, 19500000, current_date+4,'open',v_broker from yachts y where y.org_id=v_org and y.name='M/Y Solenne';
  insert into opportunities (org_id, title, lob, yacht_id, stage_id, value, expected_close, status, assigned_broker)
    select v_org,'Ardea · docs signed','sale', y.id, s_cond, 26300000, current_date+6,'open',v_broker from yachts y where y.org_id=v_org and y.name='M/Y Ardea';
  -- Won (within 30d)
  insert into opportunities (org_id, title, lob, yacht_id, stage_id, value, status, won_at, assigned_broker)
    select v_org,'Selene · closed','sale', y.id, s_won, 13400000,'won', now()-interval '6 days',v_broker from yachts y where y.org_id=v_org and y.name='M/Y Selene';
  insert into opportunities (org_id, title, lob, yacht_id, stage_id, value, status, won_at, assigned_broker)
    select v_org,'Mistral · closed','sale', y.id, s_won, 33900000,'won', now()-interval '14 days',v_broker from yachts y where y.org_id=v_org and y.name='M/Y Mistral';

  -- interactions (recent activity)
  insert into interactions (org_id, type, yacht_id, broker_id, notes, outcome, occurred_at)
    select v_org,'note', y.id, v_broker, 'Drafted counter at $37.4M on M/Y Astralis · 6 comps, MAE ±$0.4M','Follow-up Required', now()-interval '2 hours' from yachts y where y.org_id=v_org and y.name='M/Y Astralis';
  insert into interactions (org_id, type, yacht_id, broker_id, notes, occurred_at)
    select v_org,'viewing', y.id, v_broker, 'Caelum sea trial confirmed Fri 14:00 CET', now()-interval '6 hours' from yachts y where y.org_id=v_org and y.name='M/Y Caelum';
  insert into interactions (org_id, type, yacht_id, broker_id, notes, occurred_at)
    select v_org,'meeting', y.id, v_broker, 'Moved S/Y Brisant to Closing · signing scheduled', now()-interval '1 day' from yachts y where y.org_id=v_org and y.name='S/Y Brisant';

  -- tasks for the demo broker (today)
  insert into tasks (org_id, title, due_at, priority, status, assignee) values
    (v_org,'Confirm Caelum sea trial slot', date_trunc('day',now())+interval '10 hours 30 min','medium','completed',v_broker),
    (v_org,'Send Astralis counter to L. Bernet', date_trunc('day',now())+interval '14 hours','high','todo',v_broker),
    (v_org,'Call I. Vasquez · closing walkthrough', date_trunc('day',now())+interval '15 hours 30 min','medium','todo',v_broker),
    (v_org,'Review Larkspur price-drop proposal', date_trunc('day',now())+interval '16 hours','medium','todo',v_broker),
    (v_org,'Approve May owner reports (8)', date_trunc('day',now())+interval '18 hours','low','todo',v_broker);

  update tasks set completed_at = now() where org_id=v_org and status='completed';
  raise notice 'demo org seeded';
end $$;
