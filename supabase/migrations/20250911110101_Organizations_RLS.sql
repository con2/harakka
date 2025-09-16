-- ==========================================================================
-- ORGANIZATIONS - ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================================
-- RLS setup for the `public.organizations` table.
-- Goals based on policy chart:
--   1) All authenticated users (all roles) can SELECT organizations.
--   2) Block anonymous access.
--   3) Tenant admins can UPDATE only their own organization rows.
--   4) Super admins can perform full CRUD globally.
-- Assumes helper functions exist:
--   - app.me_has_role(p_org_id uuid, p_role public.roles_type)
--   - app.me_is_super_admin()
-- ==========================================================================

-- --------------------------------------------------------------------------
-- STEP 1: Enable Row Level Security
-- --------------------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.organizations force row level security;

-- --------------------------------------------------------------------------
-- STEP 2: SELECT Policies
-- --------------------------------------------------------------------------
/*
 * Block anonymous access entirely
 */
create policy "Anonymous users cannot access organizations"
  on public.organizations
  for all
  to anon
  using (false);

/*
 * Allow all authenticated users (all roles) to read organizations
 */
create policy "All authenticated users can view organizations"
  on public.organizations
  for select
  to authenticated
  using (true);

-- --------------------------------------------------------------------------
-- STEP 3: UPDATE Policies
-- --------------------------------------------------------------------------
/*
 * Tenant admins can update only organizations where they hold tenant_admin role
 */
create policy "Tenant admins can update their organizations"
  on public.organizations
  for update
  to authenticated
  using (
    app.me_has_role(id, 'tenant_admin'::public.roles_type)
  )
  with check (
    app.me_has_role(id, 'tenant_admin'::public.roles_type)
  );

/*
 * Super admins can update any organization
 */
create policy "Super admins can update any organization"
  on public.organizations
  for update
  to authenticated
  using (
    app.me_is_super_admin()
  )
  with check (
    app.me_is_super_admin()
  );

-- --------------------------------------------------------------------------
-- STEP 4: INSERT Policies
-- --------------------------------------------------------------------------
/*
 * Super admins can create organizations
 */
create policy "Super admins can create organizations"
  on public.organizations
  for insert
  to authenticated
  with check (
    app.me_is_super_admin()
  );

-- --------------------------------------------------------------------------
-- STEP 5: DELETE Policies
-- --------------------------------------------------------------------------
/*
 * Super admins can delete organizations
 */
create policy "Super admins can delete organizations"
  on public.organizations
  for delete
  to authenticated
  using (
    app.me_is_super_admin()
  );
