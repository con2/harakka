-- ==============================================
-- RLS Policies for user_organization_roles table
-- ==============================================

-- Enable and enforce RLS
alter table public.user_organization_roles enable row level security;
alter table public.user_organization_roles force row level security;

-- =======================
-- SECURITY: Block anonymous access
-- =======================
create policy "deny_anonymous_access_uor" on public.user_organization_roles
  for all to anon
  using (false);

-- =======================
-- SELECT policies
-- =======================

-- Base: any authenticated user can read their own role rows
create policy "uor_select_own_rows" on public.user_organization_roles
  for select to authenticated
  using (user_id = auth.uid());

-- Tenant Admin: can read all role rows across all organizations
create policy "uor_tenant_admin_select_all_rows" on public.user_organization_roles
  for select to authenticated
  using (
    app.me_has_role_anywhere('tenant_admin'::public.roles_type)
  );

-- Super Admin: can read everything
create policy "uor_super_admin_select_all" on public.user_organization_roles
  for select to authenticated
  using (app.me_is_super_admin());

-- =======================
-- INSERT policies
-- =======================

-- Tenant Admin: can add role rows for their org, limited to non-application roles
-- Allowed roles here: tenant_admin, storage_manager, requester, user
create policy "uor_tenant_admin_insert_org_roles" on public.user_organization_roles
  for insert to authenticated
  with check (
    app.me_has_role(user_organization_roles.organization_id, 'tenant_admin'::public.roles_type)
    and exists (
      select 1
      from public.roles r
      where r.id = user_organization_roles.role_id
        and r.role in (
          'tenant_admin'::public.roles_type,
          'storage_manager'::public.roles_type,
          'requester'::public.roles_type,
          'user'::public.roles_type
        )
    )
  );

-- Super Admin: can insert any role row
create policy "uor_super_admin_insert_any" on public.user_organization_roles
  for insert to authenticated
  with check (app.me_is_super_admin());

-- =======================
-- UPDATE policies
-- =======================

-- Tenant Admin: can update rows within their org (including soft-deactivate via is_active)
-- Restrict updates to keep organization within their managed orgs and keep roles to allowed set
create policy "uor_tenant_admin_update_org_roles" on public.user_organization_roles
  for update to authenticated
  using (
    app.me_has_role(user_organization_roles.organization_id, 'tenant_admin'::public.roles_type)
  )
  with check (
    app.me_has_role(user_organization_roles.organization_id, 'tenant_admin'::public.roles_type)
    and exists (
      select 1
      from public.roles r
      where r.id = user_organization_roles.role_id
        and r.role in (
          'tenant_admin'::public.roles_type,
          'storage_manager'::public.roles_type,
          'requester'::public.roles_type,
          'user'::public.roles_type
        )
    )
  );

-- Super Admin: can update anything
create policy "uor_super_admin_update_any" on public.user_organization_roles
  for update to authenticated
  using (app.me_is_super_admin())
  with check (app.me_is_super_admin());

-- =======================
-- DELETE policies
-- =======================
-- None: Hard deletes are not allowed for any role at this time.
-- Use UPDATE to set is_active=false (soft delete) where permitted by UPDATE policies.

-- =======================
-- Notes
-- =======================
-- This policy set implements the following:
--  - Super Admins: full CRUD across all organizations.
--  - Tenant Admins: read/create/update membership within their organization and allowed roles; no hard deletes.
--  - Regular users (including storage managers, requesters, users): can read their own membership rows.
-- If you want all org members to read org membership, add a SELECT policy using app.me_is_org_member(organization_id).
