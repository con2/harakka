-- Usage (psql or supabase db connect):
-- For local CLI:
--         psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
-- then copy this into terminal:
--        \set org_ids 'first-org-uuid, second-org-uuid'
--        \i supabase/scripts/delete_organizations.sql
--
-- Usage (Supabase SQL editor):
--   Replace the target_org_ids array below with your org UUIDs and run the script as a whole.
--
-- \echo '*** delete_organizations.sql ***'
-- \echo 'Set a comma-separated list of organization UUIDs before running.'
-- \echo 'Example: \set org_ids ''699f...-uuid-1, 6b9b...-uuid-2'''
-- \echo ''

-- \if :{?org_ids}
-- \else
--   \echo 'ERROR: org_ids parameter is not set.'
--   \echo 'Usage: \set org_ids ''org-id-1, org-id-2'''
--   \quit
-- \endif

begin;

do $$
declare
  target_org_ids uuid[] := array[
    '368212c7-ea9a-43b1-927c-8f19f4253104'::uuid,
    'f5148479-0f64-4db7-b28c-dbabfa3bec89'::uuid
  ];
-- declare
--   target_org_ids uuid[] := coalesce((
--     select array_agg(trim(value)::uuid)
--     from regexp_split_to_table(:'org_ids', ',') as value
--     where trim(value) <> ''
--   ), array[]::uuid[]);

  role_assignment_ids uuid[];
  storage_item_ids uuid[];
  booking_ids uuid[];
  deleted_count integer := 0;
begin
  if cardinality(target_org_ids) = 0 then
    raise exception 'Target organization list is empty; nothing to delete.';
  end if;

  raise notice 'Target organizations: %', target_org_ids;

  select coalesce(array_agg(id), array[]::uuid[])
    into role_assignment_ids
  from public.user_organization_roles
  where organization_id = any(target_org_ids);

  select coalesce(array_agg(id), array[]::uuid[])
    into storage_item_ids
  from public.storage_items
  where org_id = any(target_org_ids);

  select coalesce(array_agg(distinct booking_id), array[]::uuid[])
    into booking_ids
  from public.booking_items
  where provider_organization_id = any(target_org_ids);

  -- 1. Clean dependent audit/security tables.
  delete from public.user_ban_history
  where organization_id = any(target_org_ids)
     or role_assignment_id = any(role_assignment_ids);
  get diagnostics deleted_count = row_count;
  raise notice 'user_ban_history: % rows deleted', deleted_count;

  -- 2. Remove reminder logs tied to affected bookings.
  delete from public.reminder_logs
  where booking_id = any(booking_ids);
  get diagnostics deleted_count = row_count;
  raise notice 'reminder_logs: % rows deleted', deleted_count;

  -- 3. Remove booking items owned by the organizations.
  delete from public.booking_items
  where provider_organization_id = any(target_org_ids);
  get diagnostics deleted_count = row_count;
  raise notice 'booking_items: % rows deleted', deleted_count;

  -- 4. Purge storage artifacts belonging to the organizations.
  delete from public.storage_item_images
  where item_id = any(storage_item_ids);
  get diagnostics deleted_count = row_count;
  raise notice 'storage_item_images: % rows deleted', deleted_count;

  delete from public.storage_item_tags
  where item_id = any(storage_item_ids);
  get diagnostics deleted_count = row_count;
  raise notice 'storage_item_tags: % rows deleted', deleted_count;

  delete from public.storage_items
  where org_id = any(target_org_ids);
  get diagnostics deleted_count = row_count;
  raise notice 'storage_items: % rows deleted', deleted_count;

  -- 5. Remove promotions and org-location links.
  delete from public.promotions
  where owner_organization_id = any(target_org_ids);
  get diagnostics deleted_count = row_count;
  raise notice 'promotions: % rows deleted', deleted_count;

  delete from public.organization_locations
  where organization_id = any(target_org_ids);
  get diagnostics deleted_count = row_count;
  raise notice 'organization_locations: % rows deleted', deleted_count;

  -- 6. Drop role assignments (after dependent history cleanup).
  delete from public.user_organization_roles
  where organization_id = any(target_org_ids);
  get diagnostics deleted_count = row_count;
  raise notice 'user_organization_roles: % rows deleted', deleted_count;

  -- 7. Nullify booking pointers to the soon-to-be deleted organizations.
  update public.bookings
  set booked_by_org = null
  where booked_by_org = any(target_org_ids);
  get diagnostics deleted_count = row_count;
  raise notice 'bookings updated (booked_by_org Cleared): % rows affected', deleted_count;

  -- 8. Finally delete the organizations themselves.
  delete from public.organizations
  where id = any(target_org_ids);
  get diagnostics deleted_count = row_count;
  raise notice 'organizations: % rows deleted', deleted_count;
end $$;

commit;

-- \echo 'Cleanup complete.'
