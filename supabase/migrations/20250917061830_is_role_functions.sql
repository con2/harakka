-- ==================================================
-- Helper role-check functions for RLS policies
-- ==================================================
-- Purpose: Centralize authorization checks based on the
--          multi-tenant role system (roles, user_organization_roles).
--
-- Notes:
--  - Tested all functions personally to ensure they work as intended.
--  - We DO NOT use the deprecated roles like `admin` / `main_admin`.
--  - Wrapper functions are provided for common checks used in policies.
--  - `SECURITY DEFINER` + controlled `search_path` are used so these
--    can be called from RLS policies by anon/authenticated users safely.
--  - All functions rely on `auth.uid()`; they return FALSE for anon.
--
-- Roles covered:
--   super_admin, tenant_admin, storage_manager, requester, user
-- ==================================================

-- Ensure the helper schema exists
create schema if not exists app;


-- ==================================================
-- Global predicate: is current user a super_admin anywhere?
-- ==================================================
-- Some checks (e.g. admin dashboards) should not be org-scoped.
-- ==================================================
create or replace function app.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_organization_roles uor
    join public.roles r on r.id = uor.role_id
    where uor.user_id = auth.uid()
      and uor.is_active = true
      and r.role = 'super_admin'::public.roles_type
  );
$$;

-- ==================================================
-- Global predicates: is current user <role> anywhere?
-- ==================================================
-- Symmetric helpers to avoid needing an org_id.

create or replace function app.is_any_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select app.is_super_admin();
$$;

create or replace function app.is_any_tenant_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_organization_roles uor
    join public.roles r on r.id = uor.role_id
    where uor.user_id = auth.uid()
      and uor.is_active = true
      and r.role = 'tenant_admin'::public.roles_type
  );
$$;

create or replace function app.is_any_storage_manager()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_organization_roles uor
    join public.roles r on r.id = uor.role_id
    where uor.user_id = auth.uid()
      and uor.is_active = true
      and r.role = 'storage_manager'::public.roles_type
  );
$$;

create or replace function app.is_any_requester()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_organization_roles uor
    join public.roles r on r.id = uor.role_id
    where uor.user_id = auth.uid()
      and uor.is_active = true
      and r.role = 'requester'::public.roles_type
  );
$$;

-- ==================================================
-- Org-scoped wrappers for common roles
-- ==================================================
create or replace function app.is_tenant_admin(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select app.me_has_role(p_org_id, 'tenant_admin'::public.roles_type);
$$;

create or replace function app.is_storage_manager(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select app.me_has_role(p_org_id, 'storage_manager'::public.roles_type);
$$;

create or replace function app.is_requester(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select app.me_has_role(p_org_id, 'requester'::public.roles_type);
$$;

-- ==================================================
-- User baseline: any authenticated user (logged-in)
-- ==================================================
-- This returns TRUE if auth.uid() is non-null. Useful for generic
-- readable tables where login is required but specific role is not.
-- ==================================================
create or replace function app.is_user()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select auth.uid() is not null;
$$;

-- ==================================================
-- Convenience: org OR super_admin (common pattern in policies)
-- ==================================================
create or replace function app.is_org_admin_or_super(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select app.is_super_admin() or app.is_tenant_admin(p_org_id);
$$;

-- ==================================================
-- Grants
-- ==================================================
-- Allow these to be called from RLS by any role used by the API.
revoke all on function app.me_has_role(uuid, public.roles_type) from public;
revoke all on function app.me_has_any_role(uuid, public.roles_type[]) from public;
revoke all on function app.is_super_admin() from public;
revoke all on function app.is_tenant_admin(uuid) from public;
revoke all on function app.is_storage_manager(uuid) from public;
revoke all on function app.is_requester(uuid) from public;
revoke all on function app.is_user() from public;
revoke all on function app.is_org_admin_or_super(uuid) from public;
revoke all on function app.is_any_super_admin() from public;
revoke all on function app.is_any_tenant_admin() from public;
revoke all on function app.is_any_storage_manager() from public;
revoke all on function app.is_any_requester() from public;

grant execute on function app.me_has_role(uuid, public.roles_type)        to anon, authenticated, service_role;
grant execute on function app.me_has_any_role(uuid, public.roles_type[]) to anon, authenticated, service_role;
grant execute on function app.is_super_admin()                           to anon, authenticated, service_role;
grant execute on function app.is_tenant_admin(uuid)                      to anon, authenticated, service_role;
grant execute on function app.is_storage_manager(uuid)                   to anon, authenticated, service_role;
grant execute on function app.is_requester(uuid)                         to anon, authenticated, service_role;
grant execute on function app.is_user()                                  to anon, authenticated, service_role;
grant execute on function app.is_org_admin_or_super(uuid)                to anon, authenticated, service_role;
grant execute on function app.is_any_super_admin()                       to anon, authenticated, service_role;
grant execute on function app.is_any_tenant_admin()                     to anon, authenticated, service_role;
grant execute on function app.is_any_storage_manager()                  to anon, authenticated, service_role;
grant execute on function app.is_any_requester()                        to anon, authenticated, service_role;
