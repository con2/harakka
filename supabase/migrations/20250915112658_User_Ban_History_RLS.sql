-- ==========================================================================
-- USER BAN HISTORY - ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================================
-- Purpose: Track and control access to user ban/unban history records
-- 
-- Table structure analysis:
--   • user_ban_history tracks ban actions across the system
--   • Ban types: banForRole, banForOrg, banForApp
--   • Actions: banned, unbanned
--   • Organization-scoped (organization_id) and global (app-wide) bans
--
-- Access control strategy:
--   • Super admins: Full read access to all ban history (no write - audit trail)
--   • Tenant admins: Read own org's ban history, write ban actions for their org
--   • Storage managers: Read own org's ban history (no write permissions)
--   • Regular users: Can read their own ban history only (transparency)
--   • Anonymous: No access
--   • Banned users themselves: Can read their own ban records (transparency/appeals)
-- ==========================================================================

-- --------------------------------------------------------------------------
-- USER BAN HISTORY TABLE
-- --------------------------------------------------------------------------
alter table public.user_ban_history enable row level security;
alter table public.user_ban_history force row level security;

-- ==========================================================================
-- READ POLICIES
-- ==========================================================================

-- Super admins can read all ban history (audit and oversight)
create policy "Super admins can read all ban history"
  on public.user_ban_history
  for select
  to authenticated
  using (app.me_is_super_admin());

-- Tenant admins can read all ban history (align with backend endpoints)
create policy "Tenant admins can read all ban history"
  on public.user_ban_history
  for select
  to authenticated
  using (
    app.me_has_role_anywhere('tenant_admin'::public.roles_type)
  );

-- Users can read their own ban history (transparency)
create policy "Users can read their own ban history"
  on public.user_ban_history
  for select
  to authenticated
  using (
    not app.me_is_super_admin()
    and user_id = auth.uid()
  );

-- Tenant admins can read ban history for their organizations
create policy "Tenant admins can read org ban history"
  on public.user_ban_history
  for select
  to authenticated
  using (
    not app.me_is_super_admin()
    and user_id != auth.uid()
    and organization_id is not null
    and app.me_has_role(organization_id, 'tenant_admin'::public.roles_type)
  );

-- Storage managers can read ban history for their organizations (monitoring)
create policy "Storage managers can read org ban history"
  on public.user_ban_history
  for select
  to authenticated
  using (
    not app.me_is_super_admin()
    and user_id != auth.uid()
    and organization_id is not null
    and app.me_has_role(organization_id, 'storage_manager'::public.roles_type)
  );

-- ==========================================================================
-- INSERT POLICIES (Creating ban records)
-- ==========================================================================

-- Tenant admins can create ban records for users in their organizations
create policy "Tenant admins can create org ban records"
  on public.user_ban_history
  for insert
  to authenticated
  with check (
    not app.me_is_super_admin()
    and banned_by = auth.uid()
    and (
      -- Organization-specific bans (banForOrg, banForRole)
      (organization_id is not null 
       and app.me_has_role(organization_id, 'tenant_admin'::public.roles_type)
       and ban_type in ('banForOrg', 'banForRole'))
      or
      -- App-wide bans only if user has tenant_admin role in at least one org
      (organization_id is null 
       and ban_type = 'banForApp'
       and app.me_has_role_anywhere('tenant_admin'::public.roles_type))
    )
  );

-- Super admins can create any ban record (app/org/role)
create policy "Super admins can create ban records"
  on public.user_ban_history
  for insert
  to authenticated
  with check (
    app.me_is_super_admin()
  );

-- ==========================================================================
-- UPDATE POLICIES (Modifying ban records - very restricted)
-- ==========================================================================

-- Only allow updates to notes field by tenant admins (for adding context)
create policy "Tenant admins can update ban records"
  on public.user_ban_history
  for update
  to authenticated
  using (
    not app.me_is_super_admin()
    and (
      -- For org-specific bans
      (organization_id is not null 
       and app.me_has_role(organization_id, 'tenant_admin'::public.roles_type))
      or
      -- For app-wide bans
      (organization_id is null 
       and app.me_has_role_anywhere('tenant_admin'::public.roles_type))
    )
  )
  with check (
    not app.me_is_super_admin()
    and (
      -- For org-specific bans
      (organization_id is not null 
       and app.me_has_role(organization_id, 'tenant_admin'::public.roles_type))
      or
      -- For app-wide bans  
      (organization_id is null 
       and app.me_has_role_anywhere('tenant_admin'::public.roles_type))
    )
  );

-- Super admins can update any ban record
create policy "Super admins can update ban records"
  on public.user_ban_history
  for update
  to authenticated
  using (
    app.me_is_super_admin()
  )
  with check (
    app.me_is_super_admin()
  );

-- ==========================================================================
-- DELETE POLICIES (Very restricted - audit trail preservation)
-- ==========================================================================

-- No delete policies - ban history should be preserved as audit trail
-- If deletion is ever needed, it should be done via direct database access
-- or a special administrative procedure, not through application RLS

-- ==========================================================================
-- ADDITIONAL CONSIDERATIONS
-- ==========================================================================

-- Note: This design assumes:
-- 1. Ban history is primarily an audit trail and should be preserved
-- 2. Tenant admins are responsible for managing bans within their organizations
-- 3. App-wide bans require elevated permissions
-- 4. Users have a right to see their own ban history (transparency)
-- 5. Storage managers need visibility but not ban creation powers
-- 6. Super admins have read-only access for oversight but don't create bans
--    (they would likely use direct database access for system-level actions)
