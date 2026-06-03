-- ============================================================================
-- 0021_owner_portal — link a 'client' profile to an owner for the portal
-- ============================================================================
alter table profiles add column if not exists owner_id uuid references owners(id) on delete set null;
alter table invitations add column if not exists owner_id uuid references owners(id) on delete set null;

-- Allow a portal (client) user to read their own owner + that owner's
-- published reports + their yachts. (Profiles RLS already lets a user read
-- their own row.) owners/owner_reports/yachts are org-isolated; the portal
-- user shares the org, so existing org-read policies cover them. We just need
-- the profile to carry owner_id (above).

-- provision_user: also carry owner_id from the invite.
create or replace function provision_user(p_user_id uuid, p_email text, p_meta jsonb) returns void
  language plpgsql security definer set search_path = public as $$
declare v_org uuid; v_office uuid; v_name text; v_company text; v_initials text; v_invite invitations%rowtype;
begin
  if exists (select 1 from profiles where id = p_user_id) then return; end if;

  v_name := coalesce(nullif(p_meta->>'full_name',''), split_part(p_email,'@',1));
  v_initials := upper(left(coalesce(nullif(split_part(v_name,' ',1),''),'V'),1)
              || coalesce(left(nullif(split_part(v_name,' ',2),''),1),''));
  if v_initials = '' then v_initials := upper(left(v_name,2)); end if;

  select * into v_invite from invitations
    where token = nullif(p_meta->>'invite_token','') and status = 'pending' limit 1;
  if v_invite.id is not null then
    insert into profiles (id, org_id, role, full_name, email, avatar_initials, owner_id)
      values (p_user_id, v_invite.org_id, v_invite.role, v_name, p_email, v_initials, v_invite.owner_id);
    update invitations set status = 'accepted', accepted_at = now() where id = v_invite.id;
    return;
  end if;

  v_company := coalesce(nullif(p_meta->>'company_name',''), v_name || '''s workspace');
  insert into organisations (name, account_type, region, fleet_size)
    values (v_company, p_meta->>'account_type', p_meta->>'region', p_meta->>'fleet_size')
    returning id into v_org;
  insert into offices (org_id, name) values (v_org, 'Head office') returning id into v_office;
  insert into profiles (id, org_id, role, full_name, email, title, office_id, avatar_initials)
    values (p_user_id, v_org, 'admin', v_name, p_email, nullif(p_meta->>'role',''), v_office, v_initials);
  perform seed_lob_stages(v_org);
end $$;
