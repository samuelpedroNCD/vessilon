-- Vessilon — Phase 2 · Row-Level Security
-- Hard tenant isolation by org_id, with broker-assignment refinement.
-- Idempotent.

-- ============================ helpers (SECURITY DEFINER bypass RLS to avoid recursion) ============================
create or replace function current_org_id() returns uuid
  language sql stable security definer set search_path = public as $$
  select org_id from profiles where id = auth.uid()
$$;

create or replace function current_app_role() returns app_role
  language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function is_staff() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role from profiles where id = auth.uid())
      in ('admin','senior_broker','executive','operations','marketing'),
    false)
$$;

create or replace function is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce((select role from profiles where id = auth.uid()) = 'admin', false)
$$;

-- ============================ enable RLS ============================
do $$
declare t text;
begin
  foreach t in array array['organisations','offices','profiles','companies','owners','clients','leads','yachts','lob_stages','opportunities','interactions','tasks','documents','brochures']
  loop
    execute format('alter table %I enable row level security;', t);
  end loop;
end $$;

-- ============================ organisations ============================
drop policy if exists org_select on organisations;
create policy org_select on organisations for select using (id = current_org_id());
drop policy if exists org_update on organisations;
create policy org_update on organisations for update using (id = current_org_id() and is_admin()) with check (id = current_org_id());

-- ============================ profiles ============================
drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles for select using (org_id = current_org_id());
drop policy if exists profiles_insert on profiles;
create policy profiles_insert on profiles for insert with check (org_id = current_org_id() and is_admin());
drop policy if exists profiles_update on profiles;
create policy profiles_update on profiles for update using (id = auth.uid() or (org_id = current_org_id() and is_admin())) with check (org_id = current_org_id());

-- ============================ simple org-isolation tables ============================
-- offices, companies, owners, lob_stages, documents, brochures:
-- any org member reads; staff write (admin can delete).
do $$
declare t text;
begin
  foreach t in array array['offices','companies','owners','lob_stages','documents','brochures']
  loop
    execute format('drop policy if exists %1$s_select on %1$s;', t);
    execute format('create policy %1$s_select on %1$s for select using (org_id = current_org_id());', t);
    execute format('drop policy if exists %1$s_insert on %1$s;', t);
    execute format('create policy %1$s_insert on %1$s for insert with check (org_id = current_org_id());', t);
    execute format('drop policy if exists %1$s_update on %1$s;', t);
    execute format('create policy %1$s_update on %1$s for update using (org_id = current_org_id()) with check (org_id = current_org_id());', t);
    execute format('drop policy if exists %1$s_delete on %1$s;', t);
    execute format('create policy %1$s_delete on %1$s for delete using (org_id = current_org_id() and is_staff());', t);
  end loop;
end $$;

-- ============================ assignable tables (broker scoping) ============================
-- yachts.primary_broker / clients|leads|opportunities|interactions(broker_id)|tasks(assignee) assignment.
-- staff see all org rows; brokers see own/assigned/unassigned.

-- yachts (assignment column = primary_broker)
drop policy if exists yachts_select on yachts;
create policy yachts_select on yachts for select
  using (org_id = current_org_id() and (is_staff() or primary_broker = auth.uid() or primary_broker is null));
drop policy if exists yachts_insert on yachts;
create policy yachts_insert on yachts for insert with check (org_id = current_org_id());
drop policy if exists yachts_update on yachts;
create policy yachts_update on yachts for update
  using (org_id = current_org_id() and (is_staff() or primary_broker = auth.uid())) with check (org_id = current_org_id());
drop policy if exists yachts_delete on yachts;
create policy yachts_delete on yachts for delete using (org_id = current_org_id() and is_staff());

-- clients / leads / opportunities (assignment column = assigned_broker)
do $$
declare t text;
begin
  foreach t in array array['clients','leads','opportunities']
  loop
    execute format('drop policy if exists %1$s_select on %1$s;', t);
    execute format('create policy %1$s_select on %1$s for select using (org_id = current_org_id() and (is_staff() or assigned_broker = auth.uid() or assigned_broker is null));', t);
    execute format('drop policy if exists %1$s_insert on %1$s;', t);
    execute format('create policy %1$s_insert on %1$s for insert with check (org_id = current_org_id());', t);
    execute format('drop policy if exists %1$s_update on %1$s;', t);
    execute format('create policy %1$s_update on %1$s for update using (org_id = current_org_id() and (is_staff() or assigned_broker = auth.uid())) with check (org_id = current_org_id());', t);
    execute format('drop policy if exists %1$s_delete on %1$s;', t);
    execute format('create policy %1$s_delete on %1$s for delete using (org_id = current_org_id() and is_staff());', t);
  end loop;
end $$;

-- interactions (assignment column = broker_id)
drop policy if exists interactions_select on interactions;
create policy interactions_select on interactions for select
  using (org_id = current_org_id() and (is_staff() or broker_id = auth.uid() or broker_id is null));
drop policy if exists interactions_insert on interactions;
create policy interactions_insert on interactions for insert with check (org_id = current_org_id());
drop policy if exists interactions_update on interactions;
create policy interactions_update on interactions for update
  using (org_id = current_org_id() and (is_staff() or broker_id = auth.uid())) with check (org_id = current_org_id());
drop policy if exists interactions_delete on interactions;
create policy interactions_delete on interactions for delete using (org_id = current_org_id() and is_staff());

-- tasks (assignment column = assignee)
drop policy if exists tasks_select on tasks;
create policy tasks_select on tasks for select
  using (org_id = current_org_id() and (is_staff() or assignee = auth.uid() or assignee is null));
drop policy if exists tasks_insert on tasks;
create policy tasks_insert on tasks for insert with check (org_id = current_org_id());
drop policy if exists tasks_update on tasks;
create policy tasks_update on tasks for update
  using (org_id = current_org_id() and (is_staff() or assignee = auth.uid())) with check (org_id = current_org_id());
drop policy if exists tasks_delete on tasks;
create policy tasks_delete on tasks for delete using (org_id = current_org_id() and is_staff());
