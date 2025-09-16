-- ===================================
-- TEST USERS FOR RLS POLICY TESTING
-- ===================================
-- Live DB seed data for test users
-- ===================================
-- User: user@test.com
-- id = '6e2686aa-7164-4a10-8852-177c56dd3d5f'
-- org id = '2a42d333-a550-493f-876e-a2cea3c80d26'
-- ===================================
-- Requester: requester@test.com
-- id = '0efaafbf-29c4-48cd-8dc9-954dd924f553'
-- org id = '5b96fb05-1a69-4d8b-832a-504eebf13960'
-- ===================================
-- Storage Manager: storage_manager@test.com
-- id = '1e647a27-717f-4aee-a2da-f2c1737349c1'
-- org id = '5b96fb05-1a69-4d8b-832a-504eebf13960'
-- ===================================
-- Super Admin: super_admin@test.com
-- id = 'b8339c44-8410-49e0-8bb6-b74876120185'
-- org id = '0360be4f-2ea1-4b89-960d-cff888fb7475'
-- ===================================
--  tenant_admin@test.com
-- id = 'b08ed477-8100-4ee8-8ff8-84e1bcba1550'
-- org id = '5b96fb05-1a69-4d8b-832a-504eebf13960'
-- ===================================

-- Im using this for my testing of policies and it should be included in the PR for now.
-- These users can be used to test RLS policies by impersonating them in Supabase UI
-- Each user has a predictable email pattern: {role}@test.com
-- Password for all test users: TestPassword123!

-- Enable pgcrypto extension for password encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create test users in auth.users (required for user_profiles foreign key)
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    aud,
    role
) VALUES 
    -- Super Admin Test User
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'superadmin@test.com', crypt('TestPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
    
    -- Tenant Admin Test User  
    ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'tenantadmin@test.com', crypt('TestPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
    
    -- Storage Manager Test User
    ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'storagemanager@test.com', crypt('TestPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
    
    -- Requester Test User
    ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'requester@test.com', crypt('TestPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
    
    -- Regular User Test User
    ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'user@test.com', crypt('TestPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Create corresponding user profiles
INSERT INTO user_profiles (
    id,
    email,
    full_name,
    created_at
) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'superadmin@test.com', 'Super Admin Test User',  NOW()),
    ('22222222-2222-2222-2222-222222222222', 'tenantadmin@test.com', 'Tenant Admin Test User', NOW()),
    ('33333333-3333-3333-3333-333333333333', 'storagemanager@test.com', 'Storage Manager Test User', NOW()),
    ('44444444-4444-4444-4444-444444444444', 'requester@test.com', 'Requester Test User', NOW()),
    ('55555555-5555-5555-5555-555555555555', 'user@test.com', 'Regular User Test User', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create a test organization for role assignments
INSERT INTO organizations (
    id,
    name,
    slug,
    description,
    created_at,
    updated_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Test Organization',
    'test-org',
    'Organization for testing RLS policies',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert roles with specific IDs to ensure they exist for test users
-- These will be created before seed data runs, so seed data insertions will fail gracefully
INSERT INTO roles (id, role) VALUES 
    ('1663d9f0-7b1e-417d-9349-4f2e19b6d1e8', 'user'),
    ('86234569-43e9-4a18-83cf-f8584d84a752', 'super_admin'),
    ('1acce8e8-9e8e-482f-9149-24b65971f20c', 'superVera'),
    ('35feea56-b0a6-4011-b09f-85cb6f6727f3', 'storage_manager'),
    ('98ac5906-8cf7-4c2d-b587-be350930f518', 'requester'),
    ('700b7f8d-be79-474e-b554-6886a3605277', 'tenant_admin')
ON CONFLICT (role) DO NOTHING;

-- Assign organization roles to test users using the role IDs defined above
INSERT INTO user_organization_roles (
    user_id,
    organization_id,
    role_id,
    is_active,
    created_at,
    updated_at
) VALUES
    -- Test Tenant Admin
    ('22222222-2222-2222-2222-222222222222'::uuid, 
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 
     '700b7f8d-be79-474e-b554-6886a3605277'::uuid, -- tenant_admin from seed
     true, NOW(), NOW()),
    
    -- Test Storage Manager
    ('33333333-3333-3333-3333-333333333333'::uuid, 
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 
     '35feea56-b0a6-4011-b09f-85cb6f6727f3'::uuid, -- storage_manager from seed
     true, NOW(), NOW()),
    
    -- Test Requester
    ('44444444-4444-4444-4444-444444444444'::uuid, 
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 
     '98ac5906-8cf7-4c2d-b587-be350930f518'::uuid, -- requester role
     true, NOW(), NOW()),
    
    -- Test User
    ('55555555-5555-5555-5555-555555555555'::uuid, 
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 
     '1663d9f0-7b1e-417d-9349-4f2e19b6d1e8'::uuid, -- user role
     true, NOW(), NOW());

-- Add super admin role assignment
INSERT INTO user_organization_roles (
    user_id,
    organization_id, 
    role_id,
    is_active,
    created_at,
    updated_at
) VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    '86234569-43e9-4a18-83cf-f8584d84a752'::uuid, -- super_admin role
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Summary for verification
DO $$ 
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'TEST USERS CREATED FOR RLS TESTING';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Email: superadmin@test.com     | Role: Super Admin (admin)';
    RAISE NOTICE 'Email: tenantadmin@test.com    | Role: Tenant Admin';
    RAISE NOTICE 'Email: storagemanager@test.com | Role: Storage Manager';
    RAISE NOTICE 'Email: requester@test.com      | Role: Requester';
    RAISE NOTICE 'Email: user@test.com           | Role: Regular User';
    RAISE NOTICE '';
    RAISE NOTICE 'Password for all: TestPassword123!';
    RAISE NOTICE 'Organization: Test Organization';
    RAISE NOTICE '';
    RAISE NOTICE 'TO TEST:';
    RAISE NOTICE '1. Go to Supabase UI > Authentication > Users';
    RAISE NOTICE '2. Click on any test user';
    RAISE NOTICE '3. Click "Impersonate user" button';
    RAISE NOTICE '4. Test RLS policies in the SQL editor or table editor';
    RAISE NOTICE '5. Remember to stop impersonating when done';
    RAISE NOTICE '=====================================';
END $$;
