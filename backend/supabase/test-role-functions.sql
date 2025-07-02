-- ============================================================================
-- STEP 1: CREATE THE HELPER FUNCTIONS
-- ============================================================================

-- Function to check if current user has a specific role globally
CREATE OR REPLACE FUNCTION auth.has_global_role(role_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.profile_id = auth.uid()::text 
    AND ur.role::text = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user has a specific role in an organization
CREATE OR REPLACE FUNCTION auth.has_organization_role(org_id uuid, role_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_organization_roles uor
    JOIN roles r ON r.id = uor.role_id
    WHERE uor.user_id = auth.uid()::text
    AND uor.organization_id = org_id::text
    AND r.role = role_name::roles_type
    AND uor.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user has any role in an organization
CREATE OR REPLACE FUNCTION auth.has_any_organization_role(org_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_organization_roles uor
    WHERE uor.user_id = auth.uid()::text
    AND uor.organization_id = org_id::text
    AND uor.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's organizations where they have a specific role or higher
CREATE OR REPLACE FUNCTION auth.get_user_organizations_with_role(min_role text)
RETURNS uuid[] AS $$
DECLARE
  role_hierarchy text[] := ARRAY['user', 'requester', 'storage_manager', 'main_admin', 'super_admin'];
  min_role_level int;
  user_orgs uuid[];
BEGIN
  -- Get the minimum role level
  SELECT array_position(role_hierarchy, min_role) INTO min_role_level;
  
  SELECT ARRAY_AGG(DISTINCT uor.organization_id::uuid)
  INTO user_orgs
  FROM user_organization_roles uor
  JOIN roles r ON r.id = uor.role_id
  WHERE uor.user_id = auth.uid()::text
  AND uor.is_active = true
  AND array_position(role_hierarchy, r.role::text) >= min_role_level;
  
  RETURN COALESCE(user_orgs, ARRAY[]::uuid[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 2: TEST DATA SETUP (Use existing data or create test data)
-- ============================================================================

-- First, let's check what roles exist in the roles table
SELECT 'Current roles:' as info;
SELECT id, role FROM roles ORDER BY role;

-- Check what organizations exist
SELECT 'Current organizations:' as info;
SELECT id, name, slug FROM organizations LIMIT 5;

-- Check what user roles exist
SELECT 'Current user roles:' as info;
SELECT ur.profile_id, ur.role FROM user_roles ur LIMIT 5;

-- Check what organization roles exist
SELECT 'Current organization roles:' as info;
SELECT uor.user_id, uor.organization_id, r.role, uor.is_active
FROM user_organization_roles uor
JOIN roles r ON r.id = uor.role_id
LIMIT 5;

-- ============================================================================
-- STEP 3: TEST THE FUNCTIONS (Run this as a user with known roles)
-- ============================================================================

-- Test global role checking
SELECT 'Testing global role functions:' as test_section;

-- Test if current user has super_admin role
SELECT 
  auth.uid() as current_user,
  auth.has_global_role('super_admin') as is_super_admin,
  auth.has_global_role('superVera') as is_super_vera;

-- Test organization role checking (replace with actual org IDs from your database)
SELECT 'Testing organization role functions:' as test_section;

-- Get a sample organization ID for testing
DO $$
DECLARE
  test_org_id uuid;
BEGIN
  SELECT id INTO test_org_id FROM organizations LIMIT 1;
  
  RAISE NOTICE 'Testing with organization ID: %', test_org_id;
  
  -- Test organization role functions
  PERFORM auth.has_organization_role(test_org_id, 'main_admin');
  PERFORM auth.has_organization_role(test_org_id, 'storage_manager');
  PERFORM auth.has_any_organization_role(test_org_id);
END $$;

-- ============================================================================
-- STEP 4: CREATE TEST DATA IF NEEDED
-- ============================================================================

-- If you need to create test data, uncomment and modify these:

/*
-- Create test roles if they don't exist
INSERT INTO roles (role) VALUES 
  ('super_admin'::roles_type),
  ('main_admin'::roles_type),
  ('storage_manager'::roles_type),
  ('requester'::roles_type),
  ('user'::roles_type)
ON CONFLICT (role) DO NOTHING;

-- Create a test organization
INSERT INTO organizations (name, slug, description) VALUES 
  ('Test Organization', 'test-org', 'Test organization for role testing')
ON CONFLICT (slug) DO NOTHING;

-- Create test user global role (replace 'your-user-id' with actual user ID)
INSERT INTO user_roles (profile_id, role) VALUES 
  ('your-user-id', 'super_admin'::role_type)
ON CONFLICT (profile_id) DO UPDATE SET role = EXCLUDED.role;

-- Create test organization role (replace IDs with actual values)
INSERT INTO user_organization_roles (user_id, organization_id, role_id, is_active) VALUES 
  ('your-user-id', 
   (SELECT id FROM organizations WHERE slug = 'test-org'), 
   (SELECT id FROM roles WHERE role = 'main_admin'), 
   true)
ON CONFLICT (user_id, organization_id, role_id) DO UPDATE SET is_active = EXCLUDED.is_active;
*/

-- ============================================================================
-- STEP 5: VERIFY ROLE FUNCTIONS WORK
-- ============================================================================

-- Test with actual data
SELECT 'Final verification:' as test_section;

-- Show current user's global roles
SELECT 
  'Global roles for current user:' as info,
  ur.role
FROM user_roles ur 
WHERE ur.profile_id = auth.uid()::text;

-- Show current user's organization roles
SELECT 
  'Organization roles for current user:' as info,
  o.name as organization_name,
  r.role as user_role,
  uor.is_active
FROM user_organization_roles uor
JOIN organizations o ON o.id = uor.organization_id::uuid
JOIN roles r ON r.id = uor.role_id
WHERE uor.user_id = auth.uid()::text
ORDER BY o.name, r.role;

-- Test the functions with actual data
SELECT 
  'Function test results:' as info,
  auth.has_global_role('super_admin') as has_super_admin,
  auth.has_global_role('superVera') as has_super_vera,
  array_length(auth.get_user_organizations_with_role('storage_manager'), 1) as storage_manager_orgs_count;
