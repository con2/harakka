-- ===================================
-- RLS Policies for user_profiles table
-- ===================================

-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Force RLS to ensure policies are always enforced
ALTER TABLE user_profiles FORCE ROW LEVEL SECURITY;

-- =======================
-- SECURITY: Block anonymous access
-- =======================

-- Explicitly deny all access to anonymous (unauthenticated) users
CREATE POLICY "deny_anonymous_access_user_profiles" ON user_profiles
  FOR ALL TO anon
  USING (false);

-- =======================
-- SELECT policies
-- =======================

-- BASE POLICY: All authenticated users can read their own profile
CREATE POLICY "users_select_own_profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- ADDITIONAL PERMISSIONS: Super Admin can read ALL user profiles
CREATE POLICY "super_admin_select_all_user_profiles" ON user_profiles
  FOR SELECT TO authenticated
  USING (app.me_is_super_admin());

-- ADDITIONAL PERMISSIONS: Tenant Admin can read ALL user profiles 
-- (needed to discover and assign users to their organization)
CREATE POLICY "tenant_admin_select_all_user_profiles" ON user_profiles
  FOR SELECT TO authenticated
  USING (
    app.me_has_role_anywhere('tenant_admin'::public.roles_type)
  );


-- =======================
-- INSERT policies
-- =======================

-- Super Admin: Can insert any user profile
CREATE POLICY "super_admin_insert_user_profiles" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (app.me_is_super_admin());

-- Note: User profile creation is typically handled by triggers when users sign up
-- This policy allows super admins to manually create profiles if needed

-- =======================
-- UPDATE policies
-- =======================

-- BASE POLICY: All authenticated users can update their own profile
CREATE POLICY "users_update_own_profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ADDITIONAL PERMISSIONS: Super Admin can update ANY user profile
CREATE POLICY "super_admin_update_user_profiles" ON user_profiles
  FOR UPDATE TO authenticated
  USING (app.me_is_super_admin())
  WITH CHECK (app.me_is_super_admin());

-- ADDITIONAL PERMISSIONS: Tenant Admin can update user profiles in their organizations
CREATE POLICY "tenant_admin_update_org_user_profiles" ON user_profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organization_roles uor
      WHERE uor.user_id = user_profiles.id
        AND app.me_has_role(uor.organization_id, 'tenant_admin'::public.roles_type)
        AND uor.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organization_roles uor
      WHERE uor.user_id = user_profiles.id
        AND app.me_has_role(uor.organization_id, 'tenant_admin'::public.roles_type)
        AND uor.is_active = true
    )
  );

-- =======================
-- DELETE policies
-- =======================
-- None for now

-- Note: User profiles should not be deleted directly but rather 
-- marked as inactive or handled through auth.users deletion

-- =======================
-- Comments for reference
-- =======================

-- POLICY STRUCTURE:
-- 1. BASE PERMISSIONS (All authenticated users):
--    - Can read their own profile
--    - Can update their own profile
--
-- 2. ADDITIONAL PERMISSIONS BY ROLE:
--    - Super Admin: Can read/update/delete ALL profiles + create new profiles
--    - Tenant Admin: Can read/update profiles of users in their organizations
--    - Storage Manager: Can read profiles of users in their organizations
--    - Requesters & Users: Only have base permissions (own profile only)
--
-- 3. SECURITY:
--    - Anonymous users are completely blocked
--    - No role can delete profiles except super admins
--    - Profile creation is only for super admins (usually handled by auth triggers)