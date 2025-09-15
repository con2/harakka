-- ==========================================================================
-- USER ADDRESSES - ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================================
-- Based on the multi-tenant policy requirements:
--   • Super admins: Read access to all rows
--   • Anonymous users: No access at all  
--   • All other roles: CRUD access only to their own rows
--   • Tenant admins & Storage managers: Can see their own data + their org's data
-- 
-- Table schema:
--   • user_addresses(id, user_id, address_type, street_address, city, postal_code, country, is_default, created_at, updated_at)
--   • user_id references auth.users(id)
--   • Organization association via user_organization_roles table
-- ==========================================================================

-- --------------------------------------------------------------------------
-- USER ADDRESSES TABLE
-- --------------------------------------------------------------------------
alter table public.user_addresses enable row level security;
alter table public.user_addresses force row level security;

-- ==========================================================================
-- READ POLICIES
-- ==========================================================================

-- Super admins can read all user addresses
create policy "Super admins can read all user addresses"
  on public.user_addresses
  for select
  to authenticated
  using (app.me_is_super_admin());

-- Users can read their own addresses
create policy "Users can read their own addresses"
  on public.user_addresses
  for select
  to authenticated
  using (
    not app.me_is_super_admin()
    and user_id = auth.uid()
  );

-- Tenant admins and storage managers can read addresses of users in their organizations
create policy "Tenant admins and storage managers can read org user addresses"
  on public.user_addresses
  for select
  to authenticated
  using (
    not app.me_is_super_admin()
    and user_id != auth.uid()
    and exists (
      select 1 
      from public.user_organization_roles my_roles
      join public.roles my_role_def on my_role_def.id = my_roles.role_id
      join public.user_organization_roles their_roles on their_roles.organization_id = my_roles.organization_id
      where my_roles.user_id = auth.uid()
        and my_roles.is_active = true
        and my_role_def.role in ('tenant_admin'::public.roles_type, 'storage_manager'::public.roles_type)
        and their_roles.user_id = user_addresses.user_id
        and their_roles.is_active = true
    )
  );

-- ==========================================================================
-- INSERT POLICIES
-- ==========================================================================

-- Users can insert their own addresses
create policy "Users can insert their own addresses"
  on public.user_addresses
  for insert
  to authenticated
  with check (
    not app.me_is_super_admin()
    and user_id = auth.uid()
  );

-- Tenant admins and storage managers can insert addresses for users in their organizations
create policy "Tenant admins and storage managers can insert org user addresses"
  on public.user_addresses
  for insert
  to authenticated
  with check (
    not app.me_is_super_admin()
    and user_id != auth.uid()
    and exists (
      select 1 
      from public.user_organization_roles my_roles
      join public.roles my_role_def on my_role_def.id = my_roles.role_id
      join public.user_organization_roles their_roles on their_roles.organization_id = my_roles.organization_id
      where my_roles.user_id = auth.uid()
        and my_roles.is_active = true
        and my_role_def.role in ('tenant_admin'::public.roles_type, 'storage_manager'::public.roles_type)
        and their_roles.user_id = user_addresses.user_id
        and their_roles.is_active = true
    )
  );

-- ==========================================================================
-- UPDATE POLICIES
-- ==========================================================================

-- Users can update their own addresses
create policy "Users can update their own addresses"
  on public.user_addresses
  for update
  to authenticated
  using (
    not app.me_is_super_admin()
    and user_id = auth.uid()
  )
  with check (
    not app.me_is_super_admin()
    and user_id = auth.uid()
  );

-- Tenant admins and storage managers can update addresses for users in their organizations
create policy "Tenant admins and storage managers can update org user addresses"
  on public.user_addresses
  for update
  to authenticated
  using (
    not app.me_is_super_admin()
    and user_id != auth.uid()
    and exists (
      select 1 
      from public.user_organization_roles my_roles
      join public.roles my_role_def on my_role_def.id = my_roles.role_id
      join public.user_organization_roles their_roles on their_roles.organization_id = my_roles.organization_id
      where my_roles.user_id = auth.uid()
        and my_roles.is_active = true
        and my_role_def.role in ('tenant_admin'::public.roles_type, 'storage_manager'::public.roles_type)
        and their_roles.user_id = user_addresses.user_id
        and their_roles.is_active = true
    )
  )
  with check (
    not app.me_is_super_admin()
    and exists (
      select 1 
      from public.user_organization_roles my_roles
      join public.roles my_role_def on my_role_def.id = my_roles.role_id
      join public.user_organization_roles their_roles on their_roles.organization_id = my_roles.organization_id
      where my_roles.user_id = auth.uid()
        and my_roles.is_active = true
        and my_role_def.role in ('tenant_admin'::public.roles_type, 'storage_manager'::public.roles_type)
        and their_roles.user_id = user_addresses.user_id
        and their_roles.is_active = true
    )
  );

-- ==========================================================================
-- DELETE POLICIES
-- ==========================================================================

-- Users can delete their own addresses
create policy "Users can delete their own addresses"
  on public.user_addresses
  for delete
  to authenticated
  using (
    not app.me_is_super_admin()
    and user_id = auth.uid()
  );

-- Tenant admins and storage managers can delete addresses for users in their organizations
create policy "Tenant admins and storage managers can delete org user addresses"
  on public.user_addresses
  for delete
  to authenticated
  using (
    not app.me_is_super_admin()
    and user_id != auth.uid()
    and exists (
      select 1 
      from public.user_organization_roles my_roles
      join public.roles my_role_def on my_role_def.id = my_roles.role_id
      join public.user_organization_roles their_roles on their_roles.organization_id = my_roles.organization_id
      where my_roles.user_id = auth.uid()
        and my_roles.is_active = true
        and my_role_def.role in ('tenant_admin'::public.roles_type, 'storage_manager'::public.roles_type)
        and their_roles.user_id = user_addresses.user_id
        and their_roles.is_active = true
    )
  );