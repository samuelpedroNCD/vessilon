-- ============================================================================
-- 0020_invitations — link-based team invites (no email send / no auth-admin)
-- ============================================================================
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organisations(id) on delete cascade,
  email text,
  role app_role not null default 'broker',
  token text unique not null,
  status text not null default 'pending',
  invited_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create index if not exists invitations_org_idx on invitations (org_id, status);

alter table invitations enable row level security;
drop policy if exists invitations_select on invitations;
create policy invitations_select on invitations for select using (org_id = current_org_id());
drop policy if exists invitations_write on invitations;
create policy invitations_write on invitations for all
  using (org_id = current_org_id() and is_staff())
  with check (org_id = current_org_id() and is_staff());

-- Public preview of an invite (anon, pending only) for the signup page.
create or replace function invite_info(p_token text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('valid', true, 'org', o.name, 'role', i.role, 'email', i.email)
  from invitations i join organisations o on o.id = i.org_id
  where i.token = p_token and i.status = 'pending'
  limit 1;
$$;
grant execute on function invite_info(text) to anon, authenticated;

-- Re-provision: if signup metadata carries a valid invite token, attach the
-- new user to that org + role instead of creating a brand-new org.
create or replace function provision_user(p_user_id uuid, p_email text, p_meta jsonb) returns void
  language plpgsql security definer set search_path = public as $$
declare v_org uuid; v_office uuid; v_name text; v_company text; v_initials text; v_invite invitations%rowtype;
begin
  if exists (select 1 from profiles where id = p_user_id) then return; end if;

  v_name := coalesce(nullif(p_meta->>'full_name',''), split_part(p_email,'@',1));
  v_initials := upper(left(coalesce(nullif(split_part(v_name,' ',1),''),'V'),1)
              || coalesce(left(nullif(split_part(v_name,' ',2),''),1),''));
  if v_initials = '' then v_initials := upper(left(v_name,2)); end if;

  -- invite path
  select * into v_invite from invitations
    where token = nullif(p_meta->>'invite_token','') and status = 'pending' limit 1;
  if v_invite.id is not null then
    insert into profiles (id, org_id, role, full_name, email, avatar_initials)
      values (p_user_id, v_invite.org_id, v_invite.role, v_name, p_email, v_initials);
    update invitations set status = 'accepted', accepted_at = now() where id = v_invite.id;
    return;
  end if;

  -- default path: new org
  v_company := coalesce(nullif(p_meta->>'company_name',''), v_name || '''s workspace');
  insert into organisations (name, account_type, region, fleet_size)
    values (v_company, p_meta->>'account_type', p_meta->>'region', p_meta->>'fleet_size')
    returning id into v_org;
  insert into offices (org_id, name) values (v_org, 'Head office') returning id into v_office;
  insert into profiles (id, org_id, role, full_name, email, title, office_id, avatar_initials)
    values (p_user_id, v_org, 'admin', v_name, p_email, nullif(p_meta->>'role',''), v_office, v_initials);
  perform seed_lob_stages(v_org);
end $$;
