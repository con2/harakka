-- ============================================================================
-- Migration: Fix infinite recursion in booking_items RLS
-- Purpose:
--   Avoid recursive RLS evaluation between booking_items <-> bookings by
--   ensuring helper functions used in booking_items policies bypass RLS.
--
-- Background:
--   booking_items policies call app.user_owns_booking(booking_id), which
--   selects from bookings. Since bookings has FORCE ROW LEVEL SECURITY and a
--   restrictive policy that references booking_items, this created a cycle.
--
-- Approach:
--   Recreate helper functions with SECURITY DEFINER and row_security = off so
--   their internal selects bypass RLS and do not re-enter policy evaluation.
-- ============================================================================

-- Ensure helper schema exists and owned by postgres
create schema if not exists app;
alter schema app owner to postgres;

-- ---------------------------------------------------------------------------
-- Helper: booking ownership check WITHOUT invoking bookings RLS
-- ---------------------------------------------------------------------------
create or replace function app.user_owns_booking(
  p_booking_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
  select exists (
    select 1
    from public.bookings b
    where b.id = p_booking_id
      and b.user_id = p_user_id
  );
$$;

comment on function app.user_owns_booking(uuid, uuid) is
'Booking ownership check that bypasses RLS to prevent recursion in booking_items policies.';

-- ---------------------------------------------------------------------------
-- Helper: booking contains any items from orgs the user is banned from
--          (bypass RLS to avoid recursion when used in bookings policies)
-- ---------------------------------------------------------------------------
create or replace function app.booking_has_banned_org_items(
  p_booking_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
set row_security = off
as $$
  select exists (
    select 1
    from public.booking_items bi
    where bi.booking_id = p_booking_id
      and not app.me_is_not_banned_for_org(bi.provider_organization_id)
  );
$$;

comment on function app.booking_has_banned_org_items(uuid, uuid) is
'Checks for banned org items in a booking while bypassing RLS to prevent recursion.';

-- Keep execute privileges available to API roles (idempotent)
grant execute on function app.user_owns_booking(uuid, uuid) to anon, authenticated, service_role;
grant execute on function app.booking_has_banned_org_items(uuid, uuid) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- BOOKING_ITEMS: Drop and recreate non-recursive policies using app.is_* helpers
-- ---------------------------------------------------------------------------

-- Ensure RLS is enabled and forced (idempotent)
alter table if exists public.booking_items enable row level security;
alter table if exists public.booking_items force row level security;

-- Drop any legacy/previous policies (idempotent)
drop policy if exists "Anonymous users cannot access booking_items" on public.booking_items;
drop policy if exists "Members can read booking_items for own bookings or provider orgs" on public.booking_items;
drop policy if exists "Members can insert booking_items for own bookings or admins/requesters in orgs" on public.booking_items;
drop policy if exists "Members can update booking_items for own bookings or admins/requesters in orgs" on public.booking_items;
drop policy if exists "Members can delete booking_items for own bookings or admins/requesters in orgs" on public.booking_items;

drop policy if exists "deny_anonymous_access_booking_items" on public.booking_items;
drop policy if exists "users_select_own_booking_items" on public.booking_items;
drop policy if exists "org_staff_select_org_booking_items" on public.booking_items;
drop policy if exists "users_insert_own_booking_items" on public.booking_items;
drop policy if exists "org_staff_insert_org_booking_items" on public.booking_items;
drop policy if exists "users_update_own_booking_items" on public.booking_items;
drop policy if exists "org_staff_update_org_booking_items" on public.booking_items;
drop policy if exists "users_delete_own_booking_items" on public.booking_items;
drop policy if exists "org_staff_delete_org_booking_items" on public.booking_items;

-- New baseline: block anonymous users
create policy "deny_anonymous_access_booking_items" on public.booking_items
  for all to anon
  using (false);

-- SELECT: org-scoped access using new helpers; exclude super_admin explicitly
create policy "org_roles_select_booking_items" on public.booking_items
  for select to authenticated
  using (
    not app.is_super_admin() and (
      app.is_tenant_admin(provider_organization_id)
      or app.is_storage_manager(provider_organization_id)
      or app.is_requester(provider_organization_id)
    )
  );

-- INSERT: org-scoped access
create policy "org_roles_insert_booking_items" on public.booking_items
  for insert to authenticated
  with check (
    not app.is_super_admin() and (
      app.is_tenant_admin(provider_organization_id)
      or app.is_storage_manager(provider_organization_id)
      or app.is_requester(provider_organization_id)
    )
  );

-- UPDATE: org-scoped access
create policy "org_roles_update_booking_items" on public.booking_items
  for update to authenticated
  using (
    not app.is_super_admin() and (
      app.is_tenant_admin(provider_organization_id)
      or app.is_storage_manager(provider_organization_id)
      or app.is_requester(provider_organization_id)
    )
  )
  with check (
    not app.is_super_admin() and (
      app.is_tenant_admin(provider_organization_id)
      or app.is_storage_manager(provider_organization_id)
      or app.is_requester(provider_organization_id)
    )
  );

-- DELETE: org-scoped access
create policy "org_roles_delete_booking_items" on public.booking_items
  for delete to authenticated
  using (
    not app.is_super_admin() and (
      app.is_tenant_admin(provider_organization_id)
      or app.is_storage_manager(provider_organization_id)
      or app.is_requester(provider_organization_id)
    )
  );

-- RESTRICTIVE: ban enforcement (no recursion; uses provider_organization_id only)
drop policy if exists "ban_enforcement_app_booking_items" on public.booking_items;
drop policy if exists "ban_enforcement_org_booking_items" on public.booking_items;

create policy "ban_enforcement_app_booking_items" on public.booking_items
  as restrictive
  for all to authenticated
  using (app.me_is_not_banned_for_app());

create policy "ban_enforcement_org_booking_items" on public.booking_items
  as restrictive
  for all to authenticated
  using (app.me_is_not_banned_for_org(provider_organization_id));
