-- allows only one active role per user & organization
CREATE UNIQUE INDEX unique_active_role_per_user_org
ON user_organization_roles (user_id, organization_id)
WHERE is_active = true;
-- Re-adding the unique index after data cleanup