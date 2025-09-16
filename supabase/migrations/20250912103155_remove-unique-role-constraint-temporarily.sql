-- Temporarily remove the unique index to allow data seeding
-- This will be re-added after data cleanup in a future migration

DROP INDEX IF EXISTS unique_active_role_per_user_org;
