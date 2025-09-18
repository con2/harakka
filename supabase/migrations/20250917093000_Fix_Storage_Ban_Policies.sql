
-- ---------------------------------------------------------------------------
-- STORAGE TABLES: relax ban policies for SELECT, keep bans on mutations
-- ---------------------------------------------------------------------------

-- storage_items -------------------------------------------------------------
drop policy if exists "Ban Enforcement App Storage Items" on public.storage_items;
drop policy if exists "Ban Enforcement Org Storage Items" on public.storage_items;
drop policy if exists "Ban Enforcement App Storage Items (mutations)" on public.storage_items;
drop policy if exists "Ban Enforcement Org Storage Items (mutations)" on public.storage_items;
drop policy if exists "Ban Enforcement App Storage Items (insert)" on public.storage_items;
drop policy if exists "Ban Enforcement App Storage Items (update)" on public.storage_items;
drop policy if exists "Ban Enforcement App Storage Items (delete)" on public.storage_items;
drop policy if exists "Ban Enforcement Org Storage Items (insert)" on public.storage_items;
drop policy if exists "Ban Enforcement Org Storage Items (update)" on public.storage_items;
drop policy if exists "Ban Enforcement Org Storage Items (delete)" on public.storage_items;

-- Recreate ban policies only for INSERT/UPDATE/DELETE (not SELECT)
-- App-level ban: restrict only mutations
create policy "Ban Enforcement App Storage Items (insert)" on public.storage_items
  as restrictive
  for insert to authenticated
  with check (app.me_is_not_banned_for_app());

create policy "Ban Enforcement App Storage Items (update)" on public.storage_items
  as restrictive
  for update to authenticated
  using (app.me_is_not_banned_for_app())
  with check (app.me_is_not_banned_for_app());

create policy "Ban Enforcement App Storage Items (delete)" on public.storage_items
  as restrictive
  for delete to authenticated
  using (app.me_is_not_banned_for_app());

-- Org-level ban: restrict only mutations
create policy "Ban Enforcement Org Storage Items (insert)" on public.storage_items
  as restrictive
  for insert to authenticated
  with check (app.me_is_not_banned_for_org(org_id));

create policy "Ban Enforcement Org Storage Items (update)" on public.storage_items
  as restrictive
  for update to authenticated
  using (app.me_is_not_banned_for_org(org_id))
  with check (app.me_is_not_banned_for_org(org_id));

create policy "Ban Enforcement Org Storage Items (delete)" on public.storage_items
  as restrictive
  for delete to authenticated
  using (app.me_is_not_banned_for_org(org_id));

-- storage_item_images -------------------------------------------------------
drop policy if exists "Ban Enforcement Org Storage Item Images" on public.storage_item_images;
drop policy if exists "Ban Enforcement Org Storage Item Images (mutations)" on public.storage_item_images;
drop policy if exists "Ban Enforcement Org Storage Item Images (insert)" on public.storage_item_images;
drop policy if exists "Ban Enforcement Org Storage Item Images (update)" on public.storage_item_images;
drop policy if exists "Ban Enforcement Org Storage Item Images (delete)" on public.storage_item_images;

create policy "Ban Enforcement Org Storage Item Images (insert)" on public.storage_item_images
  as restrictive
  for insert to authenticated
  with check (
    exists (
      select 1 from public.storage_items si
      where si.id = storage_item_images.item_id
        and app.me_is_not_banned_for_org(si.org_id)
    )
  );

create policy "Ban Enforcement Org Storage Item Images (update)" on public.storage_item_images
  as restrictive
  for update to authenticated
  using (
    exists (
      select 1 from public.storage_items si
      where si.id = storage_item_images.item_id
        and app.me_is_not_banned_for_org(si.org_id)
    )
  )
  with check (
    exists (
      select 1 from public.storage_items si
      where si.id = storage_item_images.item_id
        and app.me_is_not_banned_for_org(si.org_id)
    )
  );

create policy "Ban Enforcement Org Storage Item Images (delete)" on public.storage_item_images
  as restrictive
  for delete to authenticated
  using (
    exists (
      select 1 from public.storage_items si
      where si.id = storage_item_images.item_id
        and app.me_is_not_banned_for_org(si.org_id)
    )
  );

-- storage_item_tags ---------------------------------------------------------
drop policy if exists "Ban Enforcement Org Storage Item Tags" on public.storage_item_tags;
drop policy if exists "Ban Enforcement Org Storage Item Tags (mutations)" on public.storage_item_tags;
drop policy if exists "Ban Enforcement Org Storage Item Tags (insert)" on public.storage_item_tags;
drop policy if exists "Ban Enforcement Org Storage Item Tags (update)" on public.storage_item_tags;
drop policy if exists "Ban Enforcement Org Storage Item Tags (delete)" on public.storage_item_tags;

create policy "Ban Enforcement Org Storage Item Tags (insert)" on public.storage_item_tags
  as restrictive
  for insert to authenticated
  with check (
    exists (
      select 1 from public.storage_items si
      where si.id = storage_item_tags.item_id
        and app.me_is_not_banned_for_org(si.org_id)
    )
  );

create policy "Ban Enforcement Org Storage Item Tags (update)" on public.storage_item_tags
  as restrictive
  for update to authenticated
  using (
    exists (
      select 1 from public.storage_items si
      where si.id = storage_item_tags.item_id
        and app.me_is_not_banned_for_org(si.org_id)
    )
  )
  with check (
    exists (
      select 1 from public.storage_items si
      where si.id = storage_item_tags.item_id
        and app.me_is_not_banned_for_org(si.org_id)
    )
  );

create policy "Ban Enforcement Org Storage Item Tags (delete)" on public.storage_item_tags
  as restrictive
  for delete to authenticated
  using (
    exists (
      select 1 from public.storage_items si
      where si.id = storage_item_tags.item_id
        and app.me_is_not_banned_for_org(si.org_id)
    )
  );

-- storage_images ------------------------------------------------------------
drop policy if exists "Ban Enforcement Org Storage Images" on public.storage_images;
drop policy if exists "Ban Enforcement Org Storage Images (mutations)" on public.storage_images;
drop policy if exists "Ban Enforcement Org Storage Images (insert)" on public.storage_images;
drop policy if exists "Ban Enforcement Org Storage Images (update)" on public.storage_images;
drop policy if exists "Ban Enforcement Org Storage Images (delete)" on public.storage_images;

create policy "Ban Enforcement Org Storage Images (insert)" on public.storage_images
  as restrictive
  for insert to authenticated
  with check (
    exists (
      select 1 from public.organization_locations ol
      where ol.storage_location_id = storage_images.location_id
        and app.me_is_not_banned_for_org(ol.organization_id)
    )
  );

create policy "Ban Enforcement Org Storage Images (update)" on public.storage_images
  as restrictive
  for update to authenticated
  using (
    exists (
      select 1 from public.organization_locations ol
      where ol.storage_location_id = storage_images.location_id
        and app.me_is_not_banned_for_org(ol.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.organization_locations ol
      where ol.storage_location_id = storage_images.location_id
        and app.me_is_not_banned_for_org(ol.organization_id)
    )
  );

create policy "Ban Enforcement Org Storage Images (delete)" on public.storage_images
  as restrictive
  for delete to authenticated
  using (
    exists (
      select 1 from public.organization_locations ol
      where ol.storage_location_id = storage_images.location_id
        and app.me_is_not_banned_for_org(ol.organization_id)
    )
  );

-- storage_locations ---------------------------------------------------------
drop policy if exists "Ban Enforcement Org Storage Locations" on public.storage_locations;
drop policy if exists "Ban Enforcement Org Storage Locations (mutations)" on public.storage_locations;
drop policy if exists "Ban Enforcement Org Storage Locations (insert)" on public.storage_locations;
drop policy if exists "Ban Enforcement Org Storage Locations (update)" on public.storage_locations;
drop policy if exists "Ban Enforcement Org Storage Locations (delete)" on public.storage_locations;

create policy "Ban Enforcement Org Storage Locations (insert)" on public.storage_locations
  as restrictive
  for insert to authenticated
  with check (
    exists (
      select 1 from public.organization_locations ol
      where ol.storage_location_id = storage_locations.id
        and app.me_is_not_banned_for_org(ol.organization_id)
    )
  );

create policy "Ban Enforcement Org Storage Locations (update)" on public.storage_locations
  as restrictive
  for update to authenticated
  using (
    exists (
      select 1 from public.organization_locations ol
      where ol.storage_location_id = storage_locations.id
        and app.me_is_not_banned_for_org(ol.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.organization_locations ol
      where ol.storage_location_id = storage_locations.id
        and app.me_is_not_banned_for_org(ol.organization_id)
    )
  );

create policy "Ban Enforcement Org Storage Locations (delete)" on public.storage_locations
  as restrictive
  for delete to authenticated
  using (
    exists (
      select 1 from public.organization_locations ol
      where ol.storage_location_id = storage_locations.id
        and app.me_is_not_banned_for_org(ol.organization_id)
    )
  );

-- storage_compartments ------------------------------------------------------
-- Ensure RLS + permissive SELECT exists for compartments too
alter table if exists public.storage_compartments enable row level security;
alter table if exists public.storage_compartments force row level security;

drop policy if exists "All users can read storage_compartments" on public.storage_compartments;
create policy "All users can read storage_compartments" on public.storage_compartments
  for select using (true);
