-- RLS Policies for Multi-Tenant Storage Management System
-- Based on the role hierarchy: super_admin > main_admin > storage_manager > requester > user

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
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
-- ORGANIZATIONS TABLE POLICIES
-- ============================================================================

-- Enable RLS on organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Super admins can see and manage all organizations
CREATE POLICY "Super admins full access to organizations" ON organizations
  FOR ALL 
  USING (
    auth.has_global_role('super_admin') OR 
    auth.has_global_role('superVera')
  );

-- Main admins can see their own organizations and basic info of others
CREATE POLICY "Main admins can see their organizations" ON organizations
  FOR SELECT
  USING (
    auth.has_organization_role(id::uuid, 'main_admin') OR
    auth.has_any_organization_role(id::uuid)
  );

-- Main admins can update their own organizations
CREATE POLICY "Main admins can update their organizations" ON organizations
  FOR UPDATE
  USING (auth.has_organization_role(id::uuid, 'main_admin'));

-- Only super admins can create new organizations
CREATE POLICY "Only super admins can create organizations" ON organizations
  FOR INSERT
  WITH CHECK (
    auth.has_global_role('super_admin') OR 
    auth.has_global_role('superVera')
  );

-- ============================================================================
-- USER_ORGANIZATION_ROLES TABLE POLICIES
-- ============================================================================

-- Enable RLS on user_organization_roles
ALTER TABLE user_organization_roles ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all role assignments
CREATE POLICY "Super admins full access to role assignments" ON user_organization_roles
  FOR ALL
  USING (
    auth.has_global_role('super_admin') OR 
    auth.has_global_role('superVera')
  );

-- Main admins can see all role assignments in their organizations
CREATE POLICY "Main admins can see org role assignments" ON user_organization_roles
  FOR SELECT
  USING (auth.has_organization_role(organization_id::uuid, 'main_admin'));

-- Main admins can assign/modify roles in their organizations (except main_admin role)
CREATE POLICY "Main admins can manage non-main-admin roles" ON user_organization_roles
  FOR ALL
  USING (
    auth.has_organization_role(organization_id::uuid, 'main_admin') AND
    NOT EXISTS (
      SELECT 1 FROM roles r 
      WHERE r.id = role_id AND r.role = 'main_admin'
    )
  );

-- Users can see their own role assignments
CREATE POLICY "Users can see their own role assignments" ON user_organization_roles
  FOR SELECT
  USING (user_id = auth.uid()::text);

-- ============================================================================
-- STORAGE_ITEMS TABLE POLICIES
-- ============================================================================

-- Enable RLS on storage_items
ALTER TABLE storage_items ENABLE ROW LEVEL SECURITY;

-- Super admins can see all items
CREATE POLICY "Super admins can see all items" ON storage_items
  FOR SELECT
  USING (
    auth.has_global_role('super_admin') OR 
    auth.has_global_role('superVera')
  );

-- Users can see active items (for browsing/requesting)
CREATE POLICY "Users can see active items" ON storage_items
  FOR SELECT
  USING (is_active = true AND (is_deleted = false OR is_deleted IS NULL));

-- Storage managers and main admins can see all items they own
CREATE POLICY "Item owners can see their items" ON storage_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_items oi
      WHERE oi.storage_item_id = id
      AND (
        auth.has_organization_role(oi.organization_id::uuid, 'storage_manager') OR
        auth.has_organization_role(oi.organization_id::uuid, 'main_admin')
      )
    )
  );

-- Storage managers and main admins can create items for their organizations
CREATE POLICY "Storage managers can create items" ON storage_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_items oi
      WHERE oi.storage_item_id = id
      AND (
        auth.has_organization_role(oi.organization_id::uuid, 'storage_manager') OR
        auth.has_organization_role(oi.organization_id::uuid, 'main_admin')
      )
    )
  );

-- Storage managers and main admins can update their organization's items
CREATE POLICY "Storage managers can update their items" ON storage_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organization_items oi
      WHERE oi.storage_item_id = id
      AND (
        auth.has_organization_role(oi.organization_id::uuid, 'storage_manager') OR
        auth.has_organization_role(oi.organization_id::uuid, 'main_admin')
      )
    )
  );

-- ============================================================================
-- ORGANIZATION_ITEMS TABLE POLICIES  
-- ============================================================================

-- Enable RLS on organization_items
ALTER TABLE organization_items ENABLE ROW LEVEL SECURITY;

-- Super admins can see all organization-item relationships
CREATE POLICY "Super admins can see all org-item relationships" ON organization_items
  FOR SELECT
  USING (
    auth.has_global_role('super_admin') OR 
    auth.has_global_role('superVera')
  );

-- Anyone can see organization-item relationships for active items (needed for browsing)
CREATE POLICY "Users can see active item ownership" ON organization_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM storage_items si
      WHERE si.id = storage_item_id
      AND si.is_active = true
      AND (si.is_deleted = false OR si.is_deleted IS NULL)
    )
  );

-- Storage managers and main admins can manage their organization's item relationships
CREATE POLICY "Storage managers can manage their org-item relationships" ON organization_items
  FOR ALL
  USING (
    auth.has_organization_role(organization_id::uuid, 'storage_manager') OR
    auth.has_organization_role(organization_id::uuid, 'main_admin')
  );

-- ============================================================================
-- ORDERS TABLE POLICIES
-- ============================================================================

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Super admins can see all orders
CREATE POLICY "Super admins can see all orders" ON orders
  FOR SELECT
  USING (
    auth.has_global_role('super_admin') OR 
    auth.has_global_role('superVera')
  );

-- Users can see their own orders
CREATE POLICY "Users can see their own orders" ON orders
  FOR SELECT
  USING (user_id = auth.uid()::text);

-- Storage managers can see orders containing their organization's items
CREATE POLICY "Storage managers can see orders with their items" ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN organization_items orgitem ON orgitem.storage_item_id = oi.item_id
      WHERE oi.order_id = id
      AND (
        auth.has_organization_role(orgitem.organization_id::uuid, 'storage_manager') OR
        auth.has_organization_role(orgitem.organization_id::uuid, 'main_admin')
      )
    )
  );

-- Users can create orders
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Users can update their own pending orders
CREATE POLICY "Users can update their pending orders" ON orders
  FOR UPDATE
  USING (user_id = auth.uid()::text AND status IN ('pending', 'draft'));

-- ============================================================================
-- ORDER_ITEMS TABLE POLICIES
-- ============================================================================

-- Enable RLS on order_items  
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Super admins can see all order items
CREATE POLICY "Super admins can see all order items" ON order_items
  FOR SELECT
  USING (
    auth.has_global_role('super_admin') OR 
    auth.has_global_role('superVera')
  );

-- Users can see order items in their own orders
CREATE POLICY "Users can see their own order items" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()::text
    )
  );

-- Storage managers can see and manage order items for their organization's items
CREATE POLICY "Storage managers can see their org order items" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_items oi
      WHERE oi.storage_item_id = item_id
      AND (
        auth.has_organization_role(oi.organization_id::uuid, 'storage_manager') OR
        auth.has_organization_role(oi.organization_id::uuid, 'main_admin')
      )
    )
  );

-- Storage managers can approve/reject order items for their organization's items
CREATE POLICY "Storage managers can update their org order items" ON order_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organization_items oi
      WHERE oi.storage_item_id = item_id
      AND (
        auth.has_organization_role(oi.organization_id::uuid, 'storage_manager') OR
        auth.has_organization_role(oi.organization_id::uuid, 'main_admin')
      )
    )
  );

-- Users can create order items for their own orders
CREATE POLICY "Users can create order items for their orders" ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()::text
    )
  );

-- ============================================================================
-- STORAGE_LOCATIONS TABLE POLICIES
-- ============================================================================

-- Enable RLS on storage_locations
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;

-- Everyone can see active storage locations (needed for browsing)
CREATE POLICY "Users can see active storage locations" ON storage_locations
  FOR SELECT
  USING (is_active = true OR is_active IS NULL);

-- Storage managers and main admins can manage locations they have access to
CREATE POLICY "Storage managers can manage accessible locations" ON storage_locations
  FOR ALL
  USING (
    auth.has_global_role('super_admin') OR 
    auth.has_global_role('superVera') OR
    EXISTS (
      SELECT 1 FROM organization_locations ol
      WHERE ol.storage_location_id = id
      AND (
        auth.has_organization_role(ol.organization_id::uuid, 'storage_manager') OR
        auth.has_organization_role(ol.organization_id::uuid, 'main_admin')
      )
    )
  );

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can see their own notifications
CREATE POLICY "Users can see their own notifications" ON notifications
  FOR SELECT
  USING (user_id = auth.uid()::text);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE
  USING (user_id = auth.uid()::text);

-- System can create notifications for users
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT
  WITH CHECK (true); -- This should be restricted to service role in practice

-- ============================================================================
-- USER_PROFILES TABLE POLICIES
-- ============================================================================

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can see their own profile
CREATE POLICY "Users can see their own profile" ON user_profiles
  FOR SELECT
  USING (id = auth.uid()::text);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE
  USING (id = auth.uid()::text);

-- Main admins and storage managers can see basic info of users in their organizations
CREATE POLICY "Org admins can see org member profiles" ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organization_roles uor
      WHERE uor.user_id = id
      AND (
        auth.has_organization_role(uor.organization_id::uuid, 'main_admin') OR
        auth.has_organization_role(uor.organization_id::uuid, 'storage_manager')
      )
    )
  );

-- Super admins can see all user profiles
CREATE POLICY "Super admins can see all profiles" ON user_profiles
  FOR SELECT
  USING (
    auth.has_global_role('super_admin') OR 
    auth.has_global_role('superVera')
  );

-- ============================================================================
-- ADDITIONAL CONSIDERATIONS
-- ============================================================================

-- Note: You may need additional policies for tables like:
-- - storage_item_images (follow storage_items ownership rules)
-- - storage_working_hours (follow storage_locations access rules)  
-- - reviews (users can create/update their own, see all for active items)
-- - saved_lists (users manage their own lists)
-- - audit_logs (super admins can see all, users can see their own actions)

-- Remember to test these policies thoroughly and adjust based on your specific use cases!
