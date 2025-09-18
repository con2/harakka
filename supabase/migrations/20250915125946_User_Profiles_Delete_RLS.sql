

-- ===================================
-- DELETE Policies for user_profiles table
-- ===================================

-- NOTE: RLS is already enabled and forced on user_profiles in prior migrations.
-- This migration adds DELETE policies.

-- ===================================
-- BASE POLICY: Users can delete their own profile
-- ===================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'users_delete_own_profile'
  ) THEN
    CREATE POLICY "users_delete_own_profile" ON user_profiles
      FOR DELETE TO authenticated
      USING (id = auth.uid());
  END IF;
END $$;

-- ===================================
-- ADDITIONAL PERMISSIONS: Super Admin can delete ANY user profile
-- ===================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'super_admin_delete_user_profiles'
  ) THEN
    CREATE POLICY "super_admin_delete_user_profiles" ON user_profiles
      FOR DELETE TO authenticated
      USING (app.me_is_super_admin());
  END IF;
END $$;

-- ===================================
-- Notes
-- ===================================
-- * If you later need org-scoped deletes (e.g., tenant_admin can delete users
--   within their org), create a separate policy mirroring your UPDATE logic.