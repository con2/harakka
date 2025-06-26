-- Enhanced Multi-Tenancy Setup Migration
-- This migration properly handles existing tables and sets up comprehensive multi-tenancy
-- Date: 2025-06-26

-- ============================================
-- 1. DROP EXISTING CONSTRAINTS AND POLICIES
-- ============================================

-- Drop existing policies on user_tenant_roles
DROP POLICY IF EXISTS "Users can read their roles" ON "public"."user_tenant_roles";

-- Drop existing table to recreate with proper structure
DROP TABLE IF EXISTS "public"."user_tenant_roles" CASCADE;

-- ============================================
-- 2. CREATE ENHANCED ROLE ENUM
-- ============================================

-- Drop old enum if exists and create new one
DROP TYPE IF EXISTS "public"."tenant_role" CASCADE;
DROP TYPE IF EXISTS "public"."role_type_test" CASCADE;

CREATE TYPE "public"."tenant_role" AS ENUM (
    'admin',
    'manager', 
    'user',
    'viewer',
    'editor'
);

-- ============================================
-- 3. CREATE ENHANCED USER_TENANT_ROLES TABLE
-- ============================================

-- Create comprehensive user-tenant-roles table supporting multiple roles per user per tenant
CREATE TABLE "public"."user_tenant_roles" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "tenant_id" uuid NOT NULL REFERENCES "public"."tenants"(id) ON DELETE CASCADE,
    "role" "public"."tenant_role" NOT NULL,
    "granted_by" uuid REFERENCES auth.users(id), -- Who granted this role
    "granted_at" timestamp with time zone DEFAULT now(),
    "is_active" boolean DEFAULT true,
    "metadata" jsonb DEFAULT '{}',
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "user_tenant_roles_pkey" PRIMARY KEY ("id"),
    -- Allow same user to have multiple roles in same tenant
    CONSTRAINT "user_tenant_roles_unique" UNIQUE ("user_id", "tenant_id", "role")
);

-- ============================================
-- 4. CREATE MULTI_TENANT_ITEMS TABLE
-- ============================================

-- Drop existing if exists
DROP TABLE IF EXISTS "public"."multi_tenant_items" CASCADE;

-- Items table that respects tenant boundaries and role-based access
CREATE TABLE "public"."multi_tenant_items" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    "tenant_id" uuid NOT NULL REFERENCES "public"."tenants"(id) ON DELETE CASCADE,
    "name" text NOT NULL,
    "description" text,
    "category" text DEFAULT 'general',
    "status" text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    "visibility" text DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'restricted')),
    "owner_id" uuid NOT NULL REFERENCES auth.users(id),
    "price" numeric DEFAULT 0,
    "metadata" jsonb DEFAULT '{}',
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "multi_tenant_items_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes for efficient role and tenant queries
CREATE INDEX "user_tenant_roles_user_id_idx" ON "public"."user_tenant_roles" ("user_id");
CREATE INDEX "user_tenant_roles_tenant_id_idx" ON "public"."user_tenant_roles" ("tenant_id");
CREATE INDEX "user_tenant_roles_role_idx" ON "public"."user_tenant_roles" ("role");
CREATE INDEX "user_tenant_roles_active_idx" ON "public"."user_tenant_roles" ("is_active") WHERE is_active = true;

-- Indexes for items table
CREATE INDEX "multi_tenant_items_tenant_id_idx" ON "public"."multi_tenant_items" ("tenant_id");
CREATE INDEX "multi_tenant_items_owner_id_idx" ON "public"."multi_tenant_items" ("owner_id");
CREATE INDEX "multi_tenant_items_status_idx" ON "public"."multi_tenant_items" ("status");

-- ============================================
-- 6. CREATE HELPER FUNCTIONS
-- ============================================

-- Function to get all roles for a user within a specific tenant
CREATE OR REPLACE FUNCTION "public"."get_user_tenant_roles"(p_user_id uuid, p_tenant_id uuid)
RETURNS TABLE(role_name tenant_role, granted_at timestamp with time zone)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT role, granted_at
    FROM user_tenant_roles
    WHERE user_id = p_user_id 
    AND tenant_id = p_tenant_id 
    AND is_active = true;
$$;

-- Function to check if user has specific role in tenant
CREATE OR REPLACE FUNCTION "public"."user_has_tenant_role"(p_user_id uuid, p_tenant_id uuid, p_role tenant_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM user_tenant_roles 
        WHERE user_id = p_user_id 
        AND tenant_id = p_tenant_id 
        AND role = p_role 
        AND is_active = true
    );
$$;

-- Function to check if user has any admin-level role in tenant
CREATE OR REPLACE FUNCTION "public"."user_is_tenant_admin"(p_user_id uuid, p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM user_tenant_roles 
        WHERE user_id = p_user_id 
        AND tenant_id = p_tenant_id 
        AND role IN ('admin', 'manager')
        AND is_active = true
    );
$$;

-- Function to get user's highest role in tenant (based on hierarchy)
CREATE OR REPLACE FUNCTION "public"."get_user_highest_tenant_role"(p_user_id uuid, p_tenant_id uuid)
RETURNS tenant_role
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT role
    FROM user_tenant_roles
    WHERE user_id = p_user_id 
    AND tenant_id = p_tenant_id 
    AND is_active = true
    ORDER BY 
        CASE role
            WHEN 'admin' THEN 1
            WHEN 'manager' THEN 2
            WHEN 'editor' THEN 3
            WHEN 'user' THEN 4
            WHEN 'viewer' THEN 5
            ELSE 6
        END
    LIMIT 1;
$$;

-- ============================================
-- 7. CREATE ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on both tables
ALTER TABLE "public"."user_tenant_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."multi_tenant_items" ENABLE ROW LEVEL SECURITY;

-- Policies for user_tenant_roles table
-- Users can see their own roles
CREATE POLICY "Users can view their own tenant roles"
ON "public"."user_tenant_roles"
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins and managers can see all roles within their tenant
CREATE POLICY "Admins can view all tenant roles"
ON "public"."user_tenant_roles"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_tenant_roles utr
        WHERE utr.user_id = auth.uid()
        AND utr.tenant_id = user_tenant_roles.tenant_id
        AND utr.role IN ('admin', 'manager')
        AND utr.is_active = true
    )
);

-- Only admins can insert/update roles
CREATE POLICY "Admins can manage tenant roles"
ON "public"."user_tenant_roles"
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_tenant_roles utr
        WHERE utr.user_id = auth.uid()
        AND utr.tenant_id = user_tenant_roles.tenant_id
        AND utr.role = 'admin'
        AND utr.is_active = true
    )
);

-- Policies for multi_tenant_items table
-- Users can see items in their tenant based on visibility and roles
CREATE POLICY "Tenant members can view appropriate items"
ON "public"."multi_tenant_items"
FOR SELECT
TO authenticated
USING (
    -- Must be a member of the tenant
    EXISTS (
        SELECT 1 FROM user_tenant_roles utr
        WHERE utr.user_id = auth.uid()
        AND utr.tenant_id = multi_tenant_items.tenant_id
        AND utr.is_active = true
    )
    AND (
        -- Public items are visible to all tenant members
        visibility = 'public'
        OR
        -- Private items are visible to owner
        (visibility = 'private' AND owner_id = auth.uid())
        OR
        -- Restricted items are visible to admins/managers
        (visibility = 'restricted' AND EXISTS (
            SELECT 1 FROM user_tenant_roles utr
            WHERE utr.user_id = auth.uid()
            AND utr.tenant_id = multi_tenant_items.tenant_id
            AND utr.role IN ('admin', 'manager')
            AND utr.is_active = true
        ))
    )
);

-- Users can create items in tenants where they have user+ role
CREATE POLICY "Tenant members can create items"
ON "public"."multi_tenant_items"
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_tenant_roles utr
        WHERE utr.user_id = auth.uid()
        AND utr.tenant_id = multi_tenant_items.tenant_id
        AND utr.role IN ('admin', 'manager', 'editor', 'user')
        AND utr.is_active = true
    )
    AND owner_id = auth.uid()
);

-- Users can update their own items, admins can update any
CREATE POLICY "Item owners and admins can update items"
ON "public"."multi_tenant_items"
FOR UPDATE
TO authenticated
USING (
    -- Owner can update their own items
    owner_id = auth.uid()
    OR
    -- Admins and managers can update any item in their tenant
    EXISTS (
        SELECT 1 FROM user_tenant_roles utr
        WHERE utr.user_id = auth.uid()
        AND utr.tenant_id = multi_tenant_items.tenant_id
        AND utr.role IN ('admin', 'manager')
        AND utr.is_active = true
    )
);

-- Only admins can delete items (or owners can delete their own)
CREATE POLICY "Admins and owners can delete items"
ON "public"."multi_tenant_items"
FOR DELETE
TO authenticated
USING (
    owner_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM user_tenant_roles utr
        WHERE utr.user_id = auth.uid()
        AND utr.tenant_id = multi_tenant_items.tenant_id
        AND utr.role = 'admin'
        AND utr.is_active = true
    )
);

-- ============================================
-- 8. CREATE TEST DATA
-- ============================================

-- Ensure test tenants exist
INSERT INTO "public"."tenants" ("id", "name") VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Tenant A - Tech Corp'),
    ('22222222-2222-2222-2222-222222222222', 'Tenant B - Retail Inc')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 9. CREATE TEST VIEWS FOR EASY QUERYING
-- ============================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS "public"."user_tenant_roles_view";
DROP VIEW IF EXISTS "public"."multi_tenant_items_view";

-- View to see user roles across tenants
CREATE VIEW "public"."user_tenant_roles_view" AS
SELECT 
    utr.id,
    t.name as tenant_name,
    utr.user_id,
    utr.role,
    utr.granted_at,
    utr.is_active,
    utr.metadata
FROM user_tenant_roles utr
JOIN tenants t ON utr.tenant_id = t.id
WHERE utr.is_active = true
ORDER BY t.name, utr.user_id, utr.role;

-- View to see items with tenant and owner info
CREATE VIEW "public"."multi_tenant_items_view" AS
SELECT 
    i.id,
    t.name as tenant_name,
    i.name as item_name,
    i.description,
    i.category,
    i.status,
    i.visibility,
    i.owner_id,
    i.price,
    i.created_at
FROM multi_tenant_items i
JOIN tenants t ON i.tenant_id = t.id
ORDER BY t.name, i.name;

-- ============================================
-- 10. CREATE AUDIT TRIGGERS
-- ============================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables
DROP TRIGGER IF EXISTS "update_user_tenant_roles_updated_at" ON "public"."user_tenant_roles";
CREATE TRIGGER "update_user_tenant_roles_updated_at"
    BEFORE UPDATE ON "public"."user_tenant_roles"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_updated_at_column"();

DROP TRIGGER IF EXISTS "update_multi_tenant_items_updated_at" ON "public"."multi_tenant_items";
CREATE TRIGGER "update_multi_tenant_items_updated_at"
    BEFORE UPDATE ON "public"."multi_tenant_items"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_updated_at_column"();
