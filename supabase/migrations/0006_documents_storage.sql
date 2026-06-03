-- ============================================================================
-- 0006_documents_storage — private Storage bucket for documents + org RLS
-- ============================================================================
-- Files are stored under a path convention of:  {org_id}/{entity}/{uuid}-{name}
-- so the first path segment identifies the owning organisation. Object-level
-- RLS mirrors the `documents` table policies: any org member may read; staff
-- may write/replace/delete. The bucket is PRIVATE — downloads go through
-- short-lived signed URLs generated server-side.

insert into storage.buckets (id, name, public, file_size_limit)
values ('documents', 'documents', false, 52428800)  -- 50 MB cap
on conflict (id) do update set public = excluded.public,
                               file_size_limit = excluded.file_size_limit;

-- helper: the org_id segment of an object's path
-- (storage.foldername(name) returns the path folders as a text[])

drop policy if exists "documents_org_read" on storage.objects;
create policy "documents_org_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = current_org_id()::text
  );

drop policy if exists "documents_staff_insert" on storage.objects;
create policy "documents_staff_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = current_org_id()::text
    and is_staff()
  );

drop policy if exists "documents_staff_update" on storage.objects;
create policy "documents_staff_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = current_org_id()::text
    and is_staff()
  )
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = current_org_id()::text
    and is_staff()
  );

drop policy if exists "documents_staff_delete" on storage.objects;
create policy "documents_staff_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = current_org_id()::text
    and is_staff()
  );
