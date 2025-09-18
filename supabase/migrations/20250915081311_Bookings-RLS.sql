-- ==========================================================================
-- BOOKINGS + BOOKING_ITEMS - ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================================
-- Based on the policy chart:
--   • Super Admin and Guests (anon) have NO access to any booking data.
--   • Tenant Admin, Storage Manager, Requester, User (approved) can
--     - bookings: READ/CREATE/UPDATE/DELETE, but only their own data.
--       Own data means either:
--         • they are the booking owner (bookings.user_id = auth.uid()), or
--         • they hold an allowed role in a provider org linked via booking_items
--           (tenant_admin, storage_manager, requester).
--     - booking_items: Tenant Admin can INSERT/UPDATE/DELETE within their org;
--       everyone above may READ items limited to own data:
--         • items for bookings they own OR
--         • items where they have the allowed role in provider_organization_id.
--
-- Helper functions used (see earlier migrations):
--   • app.me_is_super_admin()
--   • app.me_has_role(p_org_id uuid, p_role public.roles_type)
--   • app.me_has_any_role(p_org_id uuid, p_roles public.roles_type[])
-- ==========================================================================

-- --------------------------------------------------------------------------
-- BOOKINGS
-- --------------------------------------------------------------------------
alter table public.bookings enable row level security;
alter table public.bookings force row level security;

-- Block anonymous access entirely
create policy "Anonymous users cannot access bookings"
  on public.bookings
  for all
  to anon
  using (false);

-- READ: booking owner only; super_admin excluded
-- Note: Access to org bookings is handled via booking_items policies
create policy "Members can read own bookings"
  on public.bookings
  for select
  to authenticated
  using (
    not app.me_is_super_admin()
    and user_id = auth.uid()
  );

-- CREATE: only as the booking owner; super_admin excluded
create policy "Users can create their own bookings"
  on public.bookings
  for insert
  to authenticated
  with check (
    not app.me_is_super_admin()
    and user_id = auth.uid()
  );

-- UPDATE: booking owner OR members of provider org (tenant_admin, storage_manager, requester); super_admin excluded
-- This aligns with backend endpoints that permit requester, storage_manager, and tenant_admin
-- to update bookings associated with their organization via booking_items.
create policy "Members can update own or org bookings"
  on public.bookings
  for update
  to authenticated
  using (
    not app.me_is_super_admin()
    and (
      -- Owner of the booking
      user_id = auth.uid()
      -- OR has an allowed role in any provider org linked via booking_items
      or exists (
        select 1
        from public.booking_items bi
        where bi.booking_id = bookings.id
          and app.me_has_any_role(
            bi.provider_organization_id,
            array['tenant_admin','storage_manager','requester']::public.roles_type[]
          )
      )
    )
  )
  with check (
    not app.me_is_super_admin()
    and (
      user_id = auth.uid()
      or exists (
        select 1
        from public.booking_items bi
        where bi.booking_id = bookings.id
          and app.me_has_any_role(
            bi.provider_organization_id,
            array['tenant_admin','storage_manager','requester']::public.roles_type[]
          )
      )
    )
  );

-- DELETE: only booking owner; super_admin excluded
-- Note: Cascading deletes will handle booking_items
create policy "Users can delete their own bookings"
  on public.bookings
  for delete
  to authenticated
  using (
    not app.me_is_super_admin()
    and user_id = auth.uid()
  );

-- --------------------------------------------------------------------------
-- BOOKING_ITEMS
-- --------------------------------------------------------------------------
alter table public.booking_items enable row level security;
alter table public.booking_items force row level security;

-- Block anonymous access entirely
create policy "Anonymous users cannot access booking_items"
  on public.booking_items
  for all
  to anon
  using (false);

-- READ: items for own bookings OR items from provider orgs where member has allowed roles; super_admin excluded
create policy "Members can read booking_items for own bookings or provider orgs"
  on public.booking_items
  for select
  to authenticated
  using (
    not app.me_is_super_admin()
    and (
      exists (
        select 1
        from public.bookings b
        where b.id = booking_items.booking_id
          and b.user_id = auth.uid()
      )
      or app.me_has_any_role(
        booking_items.provider_organization_id,
        array['tenant_admin','storage_manager','requester']::public.roles_type[]
      )
    )
  );

-- INSERT: tenant_admin for provider org OR booking owner; super_admin excluded
create policy "Members can insert booking_items for own bookings or admins/requesters in orgs"
  on public.booking_items
  for insert
  to authenticated
  with check (
    not app.me_is_super_admin()
    and (
      exists (
        select 1
        from public.bookings b
        where b.id = booking_items.booking_id
          and b.user_id = auth.uid()
      )
      or app.me_has_any_role(
        provider_organization_id,
        array['tenant_admin','storage_manager','requester']::public.roles_type[]
      )
    )
  );

-- UPDATE: tenant_admin for provider org OR booking owner; super_admin excluded
create policy "Members can update booking_items for own bookings or admins/requesters in orgs"
  on public.booking_items
  for update
  to authenticated
  using (
    not app.me_is_super_admin()
    and (
      exists (
        select 1
        from public.bookings b
        where b.id = booking_items.booking_id
          and b.user_id = auth.uid()
      )
      or app.me_has_any_role(
        provider_organization_id,
        array['tenant_admin','storage_manager','requester']::public.roles_type[]
      )
      
    )
  )
  with check (
    not app.me_is_super_admin()
    and (
      exists (
        select 1
        from public.bookings b
        where b.id = booking_items.booking_id
          and b.user_id = auth.uid()
      )
      or app.me_has_any_role(
        provider_organization_id,
        array['tenant_admin','storage_manager','requester']::public.roles_type[]
      )
    )
  );

-- DELETE: tenant_admin for provider org OR booking owner; super_admin excluded
create policy "Members can delete booking_items for own bookings or admins/requesters in orgs"
  on public.booking_items
  for delete
  to authenticated
  using (
    not app.me_is_super_admin()
    and (
      exists (
        select 1
        from public.bookings b
        where b.id = booking_items.booking_id
          and b.user_id = auth.uid()
      )
      or app.me_has_any_role(
        provider_organization_id,
        array['tenant_admin','storage_manager','requester']::public.roles_type[]
      )
    )
  );
