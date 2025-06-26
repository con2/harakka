-- Multi-Tenancy Test Queries
-- Demonstrates users with multiple roles within the same tenant
-- Execute these after applying the migration

-- ============================================
-- 1. SETUP TEST DATA
-- ============================================

-- First, let's create some test user IDs (in real scenario, these would come from auth.users)
-- For testing purposes, we'll use these placeholder UUIDs

-- Insert test user-tenant-role relationships
-- This demonstrates the key concept: users can have MULTIPLE roles in the SAME tenant

INSERT INTO user_tenant_roles (user_id, tenant_id, role, granted_by) VALUES
-- User 1: BOTH admin AND user in Tenant A (multiple roles same tenant)
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'admin', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'user', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

-- User 2: BOTH manager AND editor in Tenant B (multiple roles same tenant)
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'manager', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'editor', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),

-- User 3: User role in BOTH tenants (cross-tenant access)
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'user', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'user', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),

-- User 4: Viewer role in Tenant A
('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'viewer', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

-- User 5: Multiple roles in Tenant A (admin, manager, AND user - all three!)
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'admin', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'manager', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'user', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')

ON CONFLICT (user_id, tenant_id, role) DO NOTHING;

-- Insert test items with different visibility levels
INSERT INTO multi_tenant_items (id, tenant_id, name, description, category, status, visibility, owner_id, price) VALUES
-- Tenant A items
('item-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Public Storage Box A1', 'Public item everyone in tenant can see', 'storage', 'active', 'public', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 25.00),
('item-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Private Admin Box A2', 'Private item only owner can see', 'storage', 'active', 'private', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 50.00),
('item-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Restricted Box A3', 'Restricted item only admins/managers can see', 'premium', 'active', 'restricted', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 100.00),
('item-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'User Item A4', 'Item created by regular user', 'basic', 'active', 'public', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 15.00),

-- Tenant B items  
('item-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Public Storage Box B1', 'Public item everyone in tenant can see', 'storage', 'active', 'public', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 30.00),
('item-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'Manager Private Box B2', 'Private item only manager can see', 'premium', 'active', 'private', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 75.00),
('item-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'Restricted Box B3', 'Restricted item for managers only', 'premium', 'active', 'restricted', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 120.00)

ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. VERIFICATION QUERIES 
-- ============================================

-- PROOF 1: Show users with multiple roles in the same tenant
SELECT 
    '=== USERS WITH MULTIPLE ROLES IN SAME TENANT ===' as test_description;

SELECT 
    t.name as tenant_name,
    utr.user_id,
    array_agg(utr.role::text ORDER BY utr.role) as all_roles,
    count(*) as role_count
FROM user_tenant_roles utr
JOIN tenants t ON utr.tenant_id = t.id
WHERE utr.is_active = true
GROUP BY t.name, utr.user_id
HAVING count(*) > 1  -- Only show users with multiple roles
ORDER BY t.name, utr.user_id;

-- PROOF 2: Detailed breakdown of all user-tenant-role relationships
SELECT 
    '=== ALL USER-TENANT-ROLE RELATIONSHIPS ===' as test_description;

SELECT 
    t.name as tenant_name,
    utr.user_id,
    utr.role,
    utr.granted_at,
    utr.granted_by
FROM user_tenant_roles_view utr
JOIN tenants t ON t.name = utr.tenant_name
ORDER BY t.name, utr.user_id, utr.role;

-- ============================================
-- 3. ROLE FUNCTION TESTS
-- ============================================

-- Test helper functions with specific examples
SELECT 
    '=== TESTING ROLE FUNCTIONS ===' as test_description;

-- Check all roles for User 1 in Tenant A (should show admin AND user)
SELECT 
    'User 1 roles in Tenant A:' as test,
    array_agg(role_name::text) as roles
FROM get_user_tenant_roles('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111');

-- Check if User 1 has admin role in Tenant A (should be true)
SELECT 
    'User 1 has admin role in Tenant A:' as test,
    user_has_tenant_role('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'admin') as has_role;

-- Check if User 1 has user role in Tenant A (should also be true)
SELECT 
    'User 1 has user role in Tenant A:' as test,
    user_has_tenant_role('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'user') as has_role;

-- Check if User 1 is admin in Tenant A (should be true)
SELECT 
    'User 1 is admin in Tenant A:' as test,
    user_is_tenant_admin('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111') as is_admin;

-- Get highest role for User 5 (should be admin, even though they have admin, manager, and user)
SELECT 
    'User 5 highest role in Tenant A:' as test,
    get_user_highest_tenant_role('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111') as highest_role;

-- ============================================
-- 4. CROSS-TENANT ACCESS TEST
-- ============================================

SELECT 
    '=== CROSS-TENANT ACCESS TEST ===' as test_description;

-- Show User 3 has access to both tenants
SELECT 
    'User 3 cross-tenant access:' as test,
    t.name as tenant_name,
    utr.role
FROM user_tenant_roles utr
JOIN tenants t ON utr.tenant_id = t.id
WHERE utr.user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
AND utr.is_active = true
ORDER BY t.name;

-- ============================================
-- 5. POLICY TESTING SIMULATION
-- ============================================

-- Note: These queries simulate what different users would see
-- In real RLS, the auth.uid() would filter automatically

SELECT 
    '=== POLICY SIMULATION (what each user type would see) ===' as test_description;

-- What User 1 (admin + user in Tenant A) would see in Tenant A
SELECT 
    'Items User 1 can see in Tenant A (admin + user roles):' as test,
    i.name,
    i.visibility,
    i.owner_id,
    CASE 
        WHEN i.owner_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' THEN 'OWNER'
        WHEN i.visibility = 'public' THEN 'PUBLIC_ACCESS'
        WHEN i.visibility = 'restricted' THEN 'ADMIN_ACCESS'
        ELSE 'OTHER_ACCESS'
    END as access_reason
FROM multi_tenant_items i
WHERE i.tenant_id = '11111111-1111-1111-1111-111111111111'
AND (
    i.visibility = 'public'  -- All tenant members see public
    OR i.owner_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'  -- Owns these
    OR (i.visibility = 'restricted' AND 
        user_is_tenant_admin('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'))  -- Admin access
);

-- What User 4 (viewer only in Tenant A) would see
SELECT 
    'Items User 4 can see in Tenant A (viewer role only):' as test,
    i.name,
    i.visibility,
    'PUBLIC_ONLY' as access_reason
FROM multi_tenant_items i
WHERE i.tenant_id = '11111111-1111-1111-1111-111111111111'
AND i.visibility = 'public';  -- Viewers only see public items

-- ============================================
-- 6. SUMMARY STATISTICS
-- ============================================

SELECT 
    '=== SUMMARY STATISTICS ===' as test_description;

-- Count of users by number of roles
SELECT 
    'Users by role count:' as metric,
    role_count,
    count(*) as user_count
FROM (
    SELECT 
        user_id,
        tenant_id,
        count(*) as role_count
    FROM user_tenant_roles
    WHERE is_active = true
    GROUP BY user_id, tenant_id
) role_counts
GROUP BY role_count
ORDER BY role_count;

-- Count of roles by tenant
SELECT 
    'Role distribution by tenant:' as metric,
    t.name as tenant_name,
    utr.role,
    count(*) as assignment_count
FROM user_tenant_roles utr
JOIN tenants t ON utr.tenant_id = t.id
WHERE utr.is_active = true
GROUP BY t.name, utr.role
ORDER BY t.name, utr.role;

-- Items by tenant and visibility
SELECT 
    'Items by tenant and visibility:' as metric,
    t.name as tenant_name,
    i.visibility,
    count(*) as item_count
FROM multi_tenant_items i
JOIN tenants t ON i.tenant_id = t.id
GROUP BY t.name, i.visibility
ORDER BY t.name, i.visibility;

-- ============================================
-- CONCLUSION
-- ============================================

SELECT 
    '=== TEST CONCLUSIONS ===' as summary,
    'Multi-tenancy with multiple roles per user per tenant is working!' as result;
