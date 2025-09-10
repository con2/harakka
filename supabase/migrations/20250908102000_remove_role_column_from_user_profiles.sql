-- ===================================
-- Remove role column from user_profiles table
-- ===================================

-- Drop the role column from user_profiles
ALTER TABLE user_profiles DROP COLUMN IF EXISTS role;

-- Add a comment to clarify the role system
COMMENT ON TABLE user_profiles IS 'User profile information. Roles are managed through the roles and user_organization_roles tables, not here.';
