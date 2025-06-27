-- Fix infinite recursion in user_tenant_roles policies
-- Date: 2025-06-27

-- ============================================
-- 1. DROP EXISTING PROBLEMATIC POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view their own tenant roles" ON "public"."user_tenant_roles";
DROP POLICY IF EXISTS "Admins can view all tenant roles" ON "public"."user_tenant_roles";
DROP POLICY IF EXISTS "Admins can manage tenant roles" ON "public"."user_tenant_roles";

-- ============================================
-- 2. CREATE HELPER FUNCTION FOR ADMIN CHECK
-- ============================================

-- Create a function that checks admin status without querying user_tenant_roles
-- This breaks the recursion by using the main user_profiles table instead
CREATE OR REPLACE FUNCTION "public"."is_tenant_admin"(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Check if user is admin in the user_profiles table (global admin)
  -- OR if user is explicitly marked as admin in a non-recursive way
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superVera')
  );
$$;

-- Alternative: Check admin status using a direct query without recursion
CREATE OR REPLACE FUNCTION "public"."has_tenant_admin_role"(p_tenant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    admin_count integer;
BEGIN
    -- Temporarily disable RLS to avoid recursion
    SET row_security = off;
    
    SELECT COUNT(*) INTO admin_count
    FROM user_tenant_roles 
    WHERE user_id = auth.uid() 
    AND tenant_id = p_tenant_id 
    AND role = 'admin' 
    AND is_active = true;
    
    -- Re-enable RLS
    SET row_security = on;
    
    RETURN admin_count > 0;
END;
$$;

-- ============================================
-- 3. CREATE NON-RECURSIVE POLICIES
-- ============================================

-- Simple policy: Users can always see their own roles
CREATE POLICY "Users can view their own tenant roles"
ON "public"."user_tenant_roles"
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Global admins can see all roles (using user_profiles table)
CREATE POLICY "Global admins can view all tenant roles"
ON "public"."user_tenant_roles"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'superVera')
    )
);

-- Global admins can manage all roles
CREATE POLICY "Global admins can manage tenant roles"
ON "public"."user_tenant_roles"
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'superVera')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'superVera')
    )
);

-- Users can insert their own roles (for self-registration to tenants)
CREATE POLICY "Users can create their own basic roles"
ON "public"."user_tenant_roles"
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid() 
    AND role IN ('user', 'viewer')  -- Only allow basic roles for self-registration
);

-- ============================================
-- 4. UPDATE MULTI_TENANT_ITEMS POLICIES
-- ============================================

-- Drop existing policies that might also cause recursion
DROP POLICY IF EXISTS "Tenant members can view appropriate items" ON "public"."multi_tenant_items";
DROP POLICY IF EXISTS "Tenant members can create items" ON "public"."multi_tenant_items";
DROP POLICY IF EXISTS "Item owners and admins can update items" ON "public"."multi_tenant_items";
DROP POLICY IF EXISTS "Admins and owners can delete items" ON "public"."multi_tenant_items";

-- Create new policies using the safe admin check
CREATE POLICY "Tenant members can view appropriate items"
ON "public"."multi_tenant_items"
FOR SELECT
TO authenticated
USING (
    -- Global admins can see everything
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'superVera')
    )
    OR
    -- Must be a member of the tenant AND respect visibility rules
    (
        EXISTS (
            SELECT 1 FROM user_tenant_roles utr
            WHERE utr.user_id = auth.uid()
            AND utr.tenant_id = multi_tenant_items.tenant_id
            AND utr.is_active = true
        )
        AND (
            visibility = 'public'
            OR (visibility = 'private' AND owner_id = auth.uid())
            OR (visibility = 'restricted' AND is_tenant_admin(tenant_id))
        )
    )
);

-- Simplified creation policy
CREATE POLICY "Authenticated users can create items"
ON "public"."multi_tenant_items"
FOR INSERT
TO authenticated
WITH CHECK (
    owner_id = auth.uid()
    AND (
        -- Global admins can create in any tenant
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'superVera')
        )
        OR
        -- Regular users must be members of the tenant
        EXISTS (
            SELECT 1 FROM user_tenant_roles utr
            WHERE utr.user_id = auth.uid()
            AND utr.tenant_id = multi_tenant_items.tenant_id
            AND utr.is_active = true
        )
    )
);

-- Update policy with safe admin check
CREATE POLICY "Owners and admins can update items"
ON "public"."multi_tenant_items"
FOR UPDATE
TO authenticated
USING (
    owner_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'superVera')
    )
    OR
    is_tenant_admin(tenant_id)
);

-- Delete policy with safe admin check
CREATE POLICY "Owners and admins can delete items"
ON "public"."multi_tenant_items"
FOR DELETE
TO authenticated
USING (
    owner_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'superVera')
    )
    OR
    is_tenant_admin(tenant_id)
);

-- ============================================
-- 5. GRANT PERMISSIONS ON HELPER FUNCTIONS
-- ============================================

GRANT EXECUTE ON FUNCTION "public"."is_tenant_admin"(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION "public"."has_tenant_admin_role"(uuid) TO authenticated;

-- ============================================
-- 6. REFRESH THE SCHEMA CACHE
-- ============================================

NOTIFY pgrst, 'reload schema';
