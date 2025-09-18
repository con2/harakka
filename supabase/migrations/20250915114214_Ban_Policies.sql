-- ==========================================================================
-- BAN ENFORCEMENT POLICIES - ROW LEVEL SECURITY (RLS)
-- ==========================================================================
-- Purpose: Implement ban enforcement via RESTRICTIVE RLS policies.
-- Notes:
--   • Uses existing public.is_user_banned_* helper functions.
--   • Adds app-scoped helpers under schema app for clean policy use.
--   • Applies RESTRICTIVE policies so they combine with existing permissive ones.
--   • Avoids non-existent columns: uses storage_items.org_id and booking_items.provider_organization_id.
-- ==========================================================================

-- --------------------------------------------------------------------------
-- SECTION 1: BAN CHECKING HELPER FUNCTIONS (SECURITY DEFINER)
-- --------------------------------------------------------------------------
create or replace function app.me_is_not_banned_for_app()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not public.is_user_banned_for_app(auth.uid());
$$;

comment on function app.me_is_not_banned_for_app() is
'True if current user is NOT banned from the entire application.';

create or replace function app.me_is_not_banned_for_org(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not public.is_user_banned_for_org(auth.uid(), p_org_id);
$$;

comment on function app.me_is_not_banned_for_org(uuid) is
'True if current user is NOT banned from the given organization.';

create or replace function app.me_is_not_banned_for_role(p_org_id uuid, p_role_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not public.is_user_banned_for_role(auth.uid(), p_org_id, p_role_id);
$$;

comment on function app.me_is_not_banned_for_role(uuid, uuid) is
'True if current user is NOT banned for the given role in the organization.';

grant execute on function app.me_is_not_banned_for_app() to authenticated;
grant execute on function app.me_is_not_banned_for_org(uuid) to authenticated;
grant execute on function app.me_is_not_banned_for_role(uuid, uuid) to authenticated;

-- --------------------------------------------------------------------------
-- SECTION 2: APP-LEVEL BAN POLICIES (RESTRICTIVE)
-- --------------------------------------------------------------------------
create policy "Ban Enforcement App Storage Items" on public.storage_items
as restrictive
for all
to authenticated
using (app.me_is_not_banned_for_app());

create policy "Ban Enforcement App Bookings" on public.bookings
as restrictive
for all
to authenticated
using (app.me_is_not_banned_for_app());

create policy "Ban Enforcement App Organizations" on public.organizations
as restrictive
for all
to authenticated
using (app.me_is_not_banned_for_app());

create policy "Ban Enforcement App User Organization Roles" on public.user_organization_roles
as restrictive
for all
to authenticated
using (app.me_is_not_banned_for_app());

create policy "Ban Enforcement App Categories" on public.categories
as restrictive
for all
to authenticated
using (app.me_is_not_banned_for_app());

create policy "Ban Enforcement App Tags" on public.tags
as restrictive
for all
to authenticated
using (app.me_is_not_banned_for_app());

create policy "Ban Enforcement App User Addresses" on public.user_addresses
as restrictive
for all
to authenticated
using (app.me_is_not_banned_for_app());

-- --------------------------------------------------------------------------
-- SECTION 3: ORG-LEVEL BAN POLICIES (RESTRICTIVE)
-- --------------------------------------------------------------------------
-- Only for tables that can be tied to an organization in the current schema.

-- storage_items has column org_id
create policy "Ban Enforcement Org Storage Items" on public.storage_items
as restrictive
for all
to authenticated
using (
  app.me_is_not_banned_for_org(storage_items.org_id)
);

-- bookings have organization context via booking_items.provider_organization_id
create policy "Ban Enforcement Org Bookings" on public.bookings
as restrictive
for all
to authenticated
using (
  -- Deny access if banned from ANY provider org linked to the booking
  not exists (
    select 1
    from public.booking_items bi
    where bi.booking_id = bookings.id
      and not app.me_is_not_banned_for_org(bi.provider_organization_id)
  )
);

-- organizations: direct org id
-- Use separate restrictive policies so INSERT is not blocked
create policy "Ban Enforcement Org Organizations (select)" on public.organizations
as restrictive
for select
to authenticated
using (app.me_is_not_banned_for_org(organizations.id));

create policy "Ban Enforcement Org Organizations (update)" on public.organizations
as restrictive
for update
to authenticated
using (app.me_is_not_banned_for_org(organizations.id));

create policy "Ban Enforcement Org Organizations (delete)" on public.organizations
as restrictive
for delete
to authenticated
using (app.me_is_not_banned_for_org(organizations.id));

-- user_organization_roles: organization_id column
create policy "Ban Enforcement Org User Organization Roles" on public.user_organization_roles
as restrictive
for all
to authenticated
using (app.me_is_not_banned_for_org(user_organization_roles.organization_id));

-- Note: categories and tags are global (no organization_id) in current schema.
-- If org scoping is added later, add analogous restrictive org-ban policies.

-- --------------------------------------------------------------------------
-- Additional storage tables with org context via joins
-- --------------------------------------------------------------------------

-- storage_item_images -> item_id -> storage_items.org_id
create policy "Ban Enforcement Org Storage Item Images" on public.storage_item_images
as restrictive
for all
to authenticated
using (
  exists (
    select 1
    from public.storage_items si
    where si.id = storage_item_images.item_id
      and app.me_is_not_banned_for_org(si.org_id)
  )
);

-- storage_item_tags -> item_id -> storage_items.org_id
create policy "Ban Enforcement Org Storage Item Tags" on public.storage_item_tags
as restrictive
for all
to authenticated
using (
  exists (
    select 1
    from public.storage_items si
    where si.id = storage_item_tags.item_id
      and app.me_is_not_banned_for_org(si.org_id)
  )
);

-- storage_images -> location_id -> organization_locations.organization_id
create policy "Ban Enforcement Org Storage Images" on public.storage_images
as restrictive
for all
to authenticated
using (
  exists (
    select 1
    from public.organization_locations ol
    where ol.storage_location_id = storage_images.location_id
      and app.me_is_not_banned_for_org(ol.organization_id)
  )
);

-- storage_locations -> organization_locations.organization_id
create policy "Ban Enforcement Org Storage Locations" on public.storage_locations
as restrictive
for all
to authenticated
using (
  exists (
    select 1
    from public.organization_locations ol
    where ol.storage_location_id = storage_locations.id
      and app.me_is_not_banned_for_org(ol.organization_id)
  )
);

-- organization_locations: direct organization_id column
create policy "Ban Enforcement Org Organization Locations" on public.organization_locations
as restrictive
for all
to authenticated
using (
  app.me_is_not_banned_for_org(organization_locations.organization_id)
);
