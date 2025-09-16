-- ===========================================================================
-- USER ORGANIZATION ROLES - ROW LEVEL SECURITY (RLS) POLICIES  
-- ===========================================================================
-- Complete RLS setup with non-recursive helper functions for tenant admins 
-- and super admins to view role assignments
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- STEP 1: Create non-recursive helper functions (SECURITY DEFINER)
-- ---------------------------------------------------------------------------
-- These functions bypass RLS to avoid infinite recursion when checking roles
-- within the policies that protect the same table being queried.

/*
 * Helper function to check if a user has a specific role in an organization
 * Uses SECURITY DEFINER to bypass RLS and avoid recursion
 */
create or replace function app.user_has_role_in_org_bypass_rls(
  p_user_id uuid,
  p_org_id uuid,
  p_role_name public.roles_type
)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.user_organization_roles uor
    join public.roles r on r.id = uor.role_id
    where uor.user_id = p_user_id
      and uor.organization_id = p_org_id
      and uor.is_active = true
      and r.role = p_role_name
  );
$$;

comment on function app.user_has_role_in_org_bypass_rls(uuid, uuid, public.roles_type) is
'Internal helper to check user role in org, bypasses RLS to avoid recursion';

/*
 * Helper function to check if a user is a super admin
 * Uses SECURITY DEFINER to bypass RLS
 */
create or replace function app.user_is_super_admin_bypass_rls(p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.user_organization_roles uor
    join public.roles r on r.id = uor.role_id
    where uor.user_id = p_user_id
      and uor.is_active = true
      and r.role in ('super_admin'::public.roles_type, 'superVera'::public.roles_type)
  );
$$;

comment on function app.user_is_super_admin_bypass_rls(uuid) is
'Internal helper to check if user is super admin, bypasses RLS';

-- Grant execute permissions on helper functions
grant execute on function app.user_has_role_in_org_bypass_rls(uuid, uuid, public.roles_type) to authenticated;
grant execute on function app.user_is_super_admin_bypass_rls(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- STEP 2: Override the problematic existing helper functions
-- ---------------------------------------------------------------------------
-- Replace the recursive helpers with non-recursive versions

create or replace function app.me_has_role(
  p_org_id uuid,
  p_role public.roles_type
)
returns boolean
language sql
stable
set search_path = public
as $$
  select app.user_has_role_in_org_bypass_rls(auth.uid(), p_org_id, p_role);
$$;

create or replace function app.me_is_super_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select app.user_is_super_admin_bypass_rls(auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- STEP 3: Enable Row Level Security
-- ---------------------------------------------------------------------------

-- Enable RLS on the table
alter table public.user_organization_roles enable row level security;
alter table public.user_organization_roles force row level security;

-- ---------------------------------------------------------------------------
-- STEP 4: CREATE SELECT POLICIES
-- ---------------------------------------------------------------------------

-- ===========================================================================
-- SELECT POLICIES
-- ===========================================================================

/*
 * Block anonymous access entirely
 */
create policy "Anonymous users cannot access user organization roles"
  on public.user_organization_roles
  for all 
  to anon
  using (false);

/*
 * Users can view their own role assignments
 * This allows any authenticated user to see their own rows in user_organization_roles
 */
create policy "Users can view their own role assignments"
  on public.user_organization_roles
  for select 
  to authenticated
  using (user_id = auth.uid());

/*
 * Tenant admins can view all role assignments in their organizations
 * This allows tenant admins to see role assignments for users in organizations they manage
 */
create policy "Tenant admins can view roles in their organizations"
  on public.user_organization_roles
  for select 
  to authenticated
  using (
    app.me_has_role(organization_id, 'tenant_admin'::public.roles_type)
  );

/*
 * Super admins can view all role assignments globally
 * This allows super admins to see all role assignments across all organizations
 */
create policy "Super admins can view all role assignments"
  on public.user_organization_roles
  for select 
  to authenticated
  using (
    app.me_is_super_admin()
  );

-- ---------------------------------------------------------------------------
-- STEP 5: CREATE INSERT POLICIES
-- ---------------------------------------------------------------------------

-- ===========================================================================
-- INSERT POLICIES
-- ===========================================================================

/*
 * Tenant admins can create role assignments in their organizations only
 * This allows tenant admins to assign roles to users within their organizations
 */
create policy "Tenant admins can create roles in their organizations"
  on public.user_organization_roles
  for insert 
  to authenticated
  with check (
    app.me_has_role(organization_id, 'tenant_admin'::public.roles_type)
  );

/*
 * Super admins can create any role assignment
 * This allows super admins to assign any role in any organization
 */
create policy "Super admins can create any role assignment"
  on public.user_organization_roles
  for insert 
  to authenticated
  with check (
    app.me_is_super_admin()
  );

-- ---------------------------------------------------------------------------
-- STEP 6: CREATE UPDATE POLICIES
-- ---------------------------------------------------------------------------

-- ===========================================================================
-- UPDATE POLICIES
-- ===========================================================================

/*
 * Tenant admins can update role assignments in their organizations only
 * This allows tenant admins to modify role assignments within their organizations
 */
create policy "Tenant admins can update roles in their organizations"
  on public.user_organization_roles
  for update 
  to authenticated
  using (
    app.me_has_role(organization_id, 'tenant_admin'::public.roles_type)
  )
  with check (
    app.me_has_role(organization_id, 'tenant_admin'::public.roles_type)
  );

/*
 * Super admins can update any role assignment
 * This allows super admins to modify any role assignment in any organization
 */
create policy "Super admins can update any role assignment"
  on public.user_organization_roles
  for update 
  to authenticated
  using (
    app.me_is_super_admin()
  )
  with check (
    app.me_is_super_admin()
  );

-- ---------------------------------------------------------------------------
-- STEP 7: CREATE DELETE POLICIES
-- ---------------------------------------------------------------------------

-- ===========================================================================
-- DELETE POLICIES
-- ===========================================================================

/*
 * Users can delete their own role assignments except for 'user' role in Global organization
 * This prevents users from removing their basic 'user' role from the Global organization
 * while allowing them to remove user roles from other organizations and any other roles
 */
create policy "Users can delete their own roles except user role in Global org"
  on public.user_organization_roles
  for delete 
  to authenticated
  using (
    user_id = auth.uid() 
    and not (
      exists (
        select 1
        from public.roles r
        join public.organizations o on o.id = organization_id
        where r.id = role_id
          and r.role = 'user'::public.roles_type
          and o.name = 'Global'
      )
    )
  );

/*
 * Tenant admins can delete role assignments in their organizations
 * This allows tenant admins to remove role assignments within their organizations
 */
create policy "Tenant admins can delete roles in their organizations"
  on public.user_organization_roles
  for delete 
  to authenticated
  using (
    app.me_has_role(organization_id, 'tenant_admin'::public.roles_type)
  );

/*
 * Super admins can delete any role assignment
 * This allows super admins to remove any role assignment in any organization
 */
create policy "Super admins can delete any role assignment"
  on public.user_organization_roles
  for delete 
  to authenticated
  using (
    app.me_is_super_admin()
  );