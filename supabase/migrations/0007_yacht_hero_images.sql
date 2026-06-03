-- ============================================================================
-- 0007_yacht_hero_images — per-yacht listing photo
-- ============================================================================
-- Adds yachts.hero_image (the storage path of the uploaded listing photo) and
-- a PUBLIC 'yacht-images' bucket. Listing photos are marketing material meant
-- to be displayed (web, brochures), so reads are public; writes/deletes are
-- restricted to staff of the owning org via the {org_id}/ path convention.

alter table yachts add column if not exists hero_image text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'yacht-images', 'yacht-images', true, 10485760,  -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public CDN reads bypass RLS, but authenticated operations (notably
-- storage.remove, which does an internal SELECT to locate the object before
-- deleting) need an explicit select policy — without it, remove silently
-- no-ops and orphans the object.
drop policy if exists "yacht_images_auth_read" on storage.objects;
create policy "yacht_images_auth_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'yacht-images');

-- Reads are public (bucket flag). Writes are staff-only, org-scoped.
drop policy if exists "yacht_images_staff_insert" on storage.objects;
create policy "yacht_images_staff_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'yacht-images'
    and (storage.foldername(name))[1] = current_org_id()::text
    and is_staff()
  );

drop policy if exists "yacht_images_staff_update" on storage.objects;
create policy "yacht_images_staff_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'yacht-images'
    and (storage.foldername(name))[1] = current_org_id()::text
    and is_staff()
  )
  with check (
    bucket_id = 'yacht-images'
    and (storage.foldername(name))[1] = current_org_id()::text
    and is_staff()
  );

drop policy if exists "yacht_images_staff_delete" on storage.objects;
create policy "yacht_images_staff_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'yacht-images'
    and (storage.foldername(name))[1] = current_org_id()::text
    and is_staff()
  );
