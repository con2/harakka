-- ==========================================================================
-- STORAGE TABLES - ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================================
-- Applies consistent multi-tenant policies to:
--   • storage_items
--   • storage_item_images
--   • storage_images
--   • storage_locations
--   • storage_item_tags
--
-- Policy summary per your chart:
--   • Everyone (including anon/guest) can SELECT (read).
--   • tenant_admin and storage_manager can INSERT any new rows (no org restriction).
--   • UPDATE and DELETE are allowed only for own organization data
--     (tenant_admin or storage_manager in the owning org). 
--   • Super admins can only VIEW - no create/update/delete permissions.
--
-- Notes on org ownership columns/joins:
--   • storage_items has column org_id.
--   • storage_item_images -> joins via item_id -> storage_items(org_id).
--   • storage_images      -> joins via location_id -> organization_locations(organization_id).
--   • storage_locations   -> org link is via organization_locations(location_id ↔ storage_location_id).
--   • storage_item_tags   -> joins via item_id -> storage_items(org_id).
--
-- Helper functions used (defined earlier in migrations):
--   • app.me_has_any_role(p_org_id uuid, p_roles public.roles_type[])
--   • app.me_has_role_anywhere(p_role public.roles_type)
-- ==========================================================================

-- --------------------------------------------------------------------------
-- storage_items
-- --------------------------------------------------------------------------
alter table public.storage_items enable row level security;
alter table public.storage_items force row level security;

-- Read: everyone (anon + authenticated)
create policy "All users can read storage_items"
  on public.storage_items
  for select
  using (true);

-- Create: tenant_admin or storage_manager can create ANY new rows (no org restriction)
create policy "Org managers can create storage_items"
  on public.storage_items
  for insert
  to authenticated
  with check (
    app.me_has_role_anywhere('tenant_admin'::public.roles_type)
    or app.me_has_role_anywhere('storage_manager'::public.roles_type)
  );

-- Update: only within own org; super_admin anywhere
create policy "Org managers can update storage_items in their orgs"
  on public.storage_items
  for update
  to authenticated
  using (
    app.me_has_any_role(
      org_id,
      array['tenant_admin','storage_manager']::public.roles_type[]
    )
  )
  with check (
    app.me_has_any_role(
      org_id,
      array['tenant_admin','storage_manager']::public.roles_type[]
    )
  );

-- Delete: only within own org; super_admin anywhere
create policy "Org managers can delete storage_items in their orgs"
  on public.storage_items
  for delete
  to authenticated
  using (
    app.me_has_any_role(
      org_id,
      array['tenant_admin','storage_manager']::public.roles_type[]
    )
  );

-- --------------------------------------------------------------------------
-- storage_item_images (joins via item_id -> storage_items(org_id))
-- --------------------------------------------------------------------------
alter table public.storage_item_images enable row level security;
alter table public.storage_item_images force row level security;

-- Read: everyone (anon + authenticated)
create policy "All users can read storage_item_images"
  on public.storage_item_images
  for select
  using (true);

-- Create: tenant_admin or storage_manager can create for any item (no org restriction)
create policy "Org managers can create storage_item_images"
  on public.storage_item_images
  for insert
  to authenticated
  with check (
    app.me_has_role_anywhere('tenant_admin'::public.roles_type)
    or app.me_has_role_anywhere('storage_manager'::public.roles_type)
  );

-- Update: within own item org; super_admin anywhere
create policy "Org managers can update storage_item_images in their orgs"
  on public.storage_item_images
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.storage_items si
      where si.id = storage_item_images.item_id
        and app.me_has_any_role(
          si.org_id,
          array['tenant_admin','storage_manager']::public.roles_type[]
        )
    )
  )
  with check (
    exists (
      select 1
      from public.storage_items si
      where si.id = storage_item_images.item_id
        and app.me_has_any_role(
          si.org_id,
          array['tenant_admin','storage_manager']::public.roles_type[]
        )
    )
  );

-- Delete: within own item org; super_admin anywhere
create policy "Org managers can delete storage_item_images in their orgs"
  on public.storage_item_images
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.storage_items si
      where si.id = storage_item_images.item_id
        and app.me_has_any_role(
          si.org_id,
          array['tenant_admin','storage_manager']::public.roles_type[]
        )
    )
  );

-- --------------------------------------------------------------------------
-- storage_images (joins via location_id -> organization_locations(organization_id))
-- --------------------------------------------------------------------------
alter table public.storage_images enable row level security;
alter table public.storage_images force row level security;

-- Read: everyone (anon + authenticated)
create policy "All users can read storage_images"
  on public.storage_images
  for select
  using (true);

-- Create: tenant_admin or storage_manager can create for any location (no org restriction)
create policy "Org managers can create storage_images"
  on public.storage_images
  for insert
  to authenticated
  with check (
    app.me_has_role_anywhere('tenant_admin'::public.roles_type)
    or app.me_has_role_anywhere('storage_manager'::public.roles_type)
  );

-- Update: within own org via mapped location; super_admin anywhere
create policy "Org managers can update storage_images in their orgs"
  on public.storage_images
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.organization_locations ol
      where ol.storage_location_id = storage_images.location_id
        and app.me_has_any_role(
          ol.organization_id, 
          array['tenant_admin','storage_manager']::public.roles_type[]
        )
    )
  )
  with check (
    exists (
      select 1
      from public.organization_locations ol
      where ol.storage_location_id = storage_images.location_id
        and app.me_has_any_role(
          ol.organization_id, 
          array['tenant_admin','storage_manager']::public.roles_type[]
        )
    )
  );

-- Delete: within own org via mapped location; super_admin anywhere
create policy "Org managers can delete storage_images in their orgs"
  on public.storage_images
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.organization_locations ol
      where ol.storage_location_id = storage_images.location_id
        and app.me_has_any_role(
          ol.organization_id, 
          array['tenant_admin','storage_manager']::public.roles_type[]
        )
    )
  );

-- --------------------------------------------------------------------------
-- storage_locations (org link via organization_locations)
-- --------------------------------------------------------------------------
alter table public.storage_locations enable row level security;
alter table public.storage_locations force row level security;

-- Read: everyone (anon + authenticated)
create policy "All users can read storage_locations"
  on public.storage_locations
  for select
  using (true);

-- Create: tenant_admin or storage_manager in any org; super_admin anywhere
-- (Org is linked post-create via organization_locations.)
create policy "Org managers can create storage_locations"
  on public.storage_locations
  for insert
  to authenticated
  with check (
    app.me_has_role_anywhere('tenant_admin'::public.roles_type)
    or app.me_has_role_anywhere('storage_manager'::public.roles_type)
  );

-- Update: only if this location is linked to an org the user manages; super_admin anywhere
create policy "Org managers can update storage_locations in their orgs"
  on public.storage_locations
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.organization_locations ol
      where ol.storage_location_id = storage_locations.id
        and app.me_has_any_role(
          ol.organization_id, 
          array['tenant_admin','storage_manager']::public.roles_type[]
        )
    )
  )
  with check (
    exists (
      select 1
      from public.organization_locations ol
      where ol.storage_location_id = storage_locations.id
        and app.me_has_any_role(
          ol.organization_id, 
          array['tenant_admin','storage_manager']::public.roles_type[]
        )
    )
  );

-- Delete: only if linked to an org the user manages; super_admin anywhere
create policy "Org managers can delete storage_locations in their orgs"
  on public.storage_locations
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.organization_locations ol
      where ol.storage_location_id = storage_locations.id
        and app.me_has_any_role(
          ol.organization_id, 
          array['tenant_admin','storage_manager']::public.roles_type[]
        )
    )
  );

-- --------------------------------------------------------------------------
-- storage_item_tags (joins via item_id -> storage_items(org_id))
-- --------------------------------------------------------------------------
alter table public.storage_item_tags enable row level security;
alter table public.storage_item_tags force row level security;

-- Read: everyone (anon + authenticated)
create policy "All users can read storage_item_tags"
  on public.storage_item_tags
  for select
  using (true);

-- Create: tenant_admin or storage_manager can create for any item (no org restriction)
create policy "Org managers can create storage_item_tags"
  on public.storage_item_tags
  for insert
  to authenticated
  with check (
    app.me_has_role_anywhere('tenant_admin'::public.roles_type)
    or app.me_has_role_anywhere('storage_manager'::public.roles_type)
  );

-- Update: within own item org; super_admin anywhere
create policy "Org managers can update storage_item_tags in their orgs"
  on public.storage_item_tags
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.storage_items si
      where si.id = storage_item_tags.item_id
        and app.me_has_any_role(
          si.org_id,
          array['tenant_admin','storage_manager']::public.roles_type[]
        )
    )
  )
  with check (
    exists (
      select 1
      from public.storage_items si
      where si.id = storage_item_tags.item_id
        and app.me_has_any_role(
          si.org_id,
          array['tenant_admin','storage_manager']::public.roles_type[]
        )
    )
  );

-- Delete: within own item org; super_admin anywhere
create policy "Org managers can delete storage_item_tags in their orgs"
  on public.storage_item_tags
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.storage_items si
      where si.id = storage_item_tags.item_id
        and app.me_has_any_role(
          si.org_id,
          array['tenant_admin','storage_manager']::public.roles_type[]
        )
    )
  );
