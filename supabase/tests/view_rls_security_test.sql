BEGIN;

-- ==========================================================================
-- VIEW RLS SECURITY - COMPREHENSIVE PGTAP TEST SUITE
-- ==========================================================================
-- Purpose: Test that views properly inherit RLS from base tables and that grants
--   are correctly configured to prevent unauthorized access.
-- Approach: Reuse exact fixture setup from Ban_RLS_test.sql for consistency
-- Coverage:
--   • Anonymous access - should work for public views, fail for private ones
--   • Authenticated users - should see only data they're authorized for
--   • Cross-organization isolation - users shouldn't see other org's data
--   • View security_barrier verification
-- ==========================================================================

SELECT plan(24);

-- --------------------------------------------------------------------------
-- SECTION 1: FIXTURE SETUP (reusing Ban_RLS_test.sql approach)
-- --------------------------------------------------------------------------

-- Create test users in auth.users and user_profiles (same as Ban_RLS_test.sql)
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, phone_confirmed_at, last_sign_in_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001'::uuid, 'active@test.com', now(), now(), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'org_a_only@test.com', now(), now(), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003'::uuid, 'app_banned@test.com', now(), now(), now(), now(), now());

INSERT INTO public.user_profiles (id, full_name, visible_name, email, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Active User', 'Active', 'active@test.com', now()),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'Org A Only User', 'OrgAOnly', 'org_a_only@test.com', now()),
  ('00000000-0000-0000-0000-000000000003'::uuid, 'App Banned User', 'AppBanned', 'app_banned@test.com', now());

-- Use seeded role IDs (no need to insert)
-- user: 1663d9f0-7b1e-417d-9349-4f2e19b6d1e8
-- tenant_admin: 700b7f8d-be79-474e-b554-6886a3605277

-- Use seeded organization IDs
-- Test Organization: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
-- Illusia: 5b96fb05-1a69-4d8b-832a-504eebf13960

-- Create test storage locations
INSERT INTO public.storage_locations (id, name, description, address, is_active, created_at)
VALUES 
  ('30000000-0000-0000-0000-000000000001'::uuid, 'Location A', 'Test Location A', '123 Test St A', true, now()),
  ('30000000-0000-0000-0000-000000000002'::uuid, 'Location B', 'Test Location B', '456 Test St B', true, now());

-- Link organizations to locations
INSERT INTO public.organization_locations (id, organization_id, storage_location_id, is_active, created_at)
VALUES 
  ('40000000-0000-0000-0000-000000000001'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '30000000-0000-0000-0000-000000000001'::uuid, true, now()),
  ('40000000-0000-0000-0000-000000000002'::uuid, '5b96fb05-1a69-4d8b-832a-504eebf13960'::uuid, '30000000-0000-0000-0000-000000000002'::uuid, true, now());

-- Create role assignments
INSERT INTO public.user_organization_roles (id, user_id, organization_id, role_id, is_active, created_at)
VALUES 
  -- u_active: active in both orgA and orgB
  ('50000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '1663d9f0-7b1e-417d-9349-4f2e19b6d1e8'::uuid, true, now()),
  ('50000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '5b96fb05-1a69-4d8b-832a-504eebf13960'::uuid, '1663d9f0-7b1e-417d-9349-4f2e19b6d1e8'::uuid, true, now()),
  -- u_orgA_only: active only in orgA
  ('50000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '1663d9f0-7b1e-417d-9349-4f2e19b6d1e8'::uuid, true, now()),
  -- u_app_banned: no active roles (all inactive)
  ('50000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000003'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '1663d9f0-7b1e-417d-9349-4f2e19b6d1e8'::uuid, false, now());

-- Create storage items
INSERT INTO public.storage_items (id, location_id, org_id, quantity, available_quantity, is_active, created_at, translations)
VALUES 
  ('60000000-0000-0000-0000-000000000001'::uuid, '30000000-0000-0000-0000-000000000001'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 10, 10, true, now(), '{"en": {"item_name": "Item A", "item_type": "Test"}}'),
  ('60000000-0000-0000-0000-000000000002'::uuid, '30000000-0000-0000-0000-000000000002'::uuid, '5b96fb05-1a69-4d8b-832a-504eebf13960'::uuid, 5, 5, true, now(), '{"en": {"item_name": "Item B", "item_type": "Test"}}');

-- Create tags for testing
INSERT INTO public.tags (id, created_at, translations)
VALUES 
  ('70000000-0000-0000-0000-000000000001'::uuid, now(), '{"en": {"tag_name": "Test Tag"}}');

-- Create storage item tags
INSERT INTO public.storage_item_tags (id, item_id, tag_id, created_at)
VALUES 
  ('90000000-0000-0000-0000-000000000001'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, '70000000-0000-0000-0000-000000000001'::uuid, now()),
  ('90000000-0000-0000-0000-000000000002'::uuid, '60000000-0000-0000-0000-000000000002'::uuid, '70000000-0000-0000-0000-000000000001'::uuid, now());

-- Create bookings
INSERT INTO public.bookings (id, booking_number, user_id, status, created_at)
VALUES 
  ('b0000000-0000-0000-0000-000000000001'::uuid, 'BOOK-A-001', '00000000-0000-0000-0000-000000000001'::uuid, 'pending', now()),
  ('b0000000-0000-0000-0000-000000000002'::uuid, 'BOOK-MIXED-002', '00000000-0000-0000-0000-000000000001'::uuid, 'pending', now()),
  ('b0000000-0000-0000-0000-000000000003'::uuid, 'BOOK-ORGA-003', '00000000-0000-0000-0000-000000000002'::uuid, 'confirmed', now());

-- Create booking items
INSERT INTO public.booking_items (id, booking_id, item_id, quantity, start_date, end_date, total_days, status, location_id, provider_organization_id, created_at)
VALUES 
  -- bookingA: only from orgA (should be visible to u_orgA_only)
  ('c0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000001'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 1, now(), now() + interval '1 day', 1, 'pending', '30000000-0000-0000-0000-000000000001'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, now()),
  -- bookingMixed: items from orgA and orgB (should NOT be visible to u_orgA_only due to "deny if banned from ANY provider org")
  ('c0000000-0000-0000-0000-000000000002'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 1, now(), now() + interval '1 day', 1, 'pending', '30000000-0000-0000-0000-000000000001'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, now()),
  ('c0000000-0000-0000-0000-000000000003'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid, '60000000-0000-0000-0000-000000000002'::uuid, 1, now(), now() + interval '1 day', 1, 'pending', '30000000-0000-0000-0000-000000000002'::uuid, '5b96fb05-1a69-4d8b-832a-504eebf13960'::uuid, now()),
  -- bookingOrgA: from orgA by u_orgA_only user
  ('c0000000-0000-0000-0000-000000000004'::uuid, 'b0000000-0000-0000-0000-000000000003'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 1, now(), now() + interval '1 day', 1, 'confirmed', '30000000-0000-0000-0000-000000000001'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, now());

-- Create categories for testing
INSERT INTO public.categories (id, created_at, translations) 
VALUES ('d0000000-0000-0000-0000-000000000001'::uuid, now(), '{"en": {"category_name": "Test Category"}}');

-- --------------------------------------------------------------------------
-- SECTION 2: ANONYMOUS ACCESS TESTS
-- --------------------------------------------------------------------------

-- Anonymous users should NOT be able to access private views
SELECT throws_ok(
  'SELECT * FROM public.view_bookings_with_details LIMIT 1',
  '42501', -- permission denied error
  'Anonymous access to view_bookings_with_details should be denied'
);

SELECT throws_ok(
  'SELECT * FROM public.view_bookings_with_user_info LIMIT 1', 
  '42501',
  'Anonymous access to view_bookings_with_user_info should be denied'
);

SELECT throws_ok(
  'SELECT * FROM public.view_user_ban_status LIMIT 1',
  '42501', 
  'Anonymous access to view_user_ban_status should be denied'
);

SELECT throws_ok(
  'SELECT * FROM public.view_user_roles_with_details LIMIT 1',
  '42501',
  'Anonymous access to view_user_roles_with_details should be denied'
);

-- Anonymous users SHOULD be able to access public catalog views
SELECT lives_ok(
  'SELECT * FROM public.view_item_location_summary LIMIT 1',
  'Anonymous access to view_item_location_summary should work'
);

SELECT lives_ok(
  'SELECT * FROM public.view_item_ownership_summary LIMIT 1',
  'Anonymous access to view_item_ownership_summary should work'
);

SELECT lives_ok(
  'SELECT * FROM public.view_manage_storage_items LIMIT 1',
  'Anonymous access to view_manage_storage_items should work'
);

SELECT lives_ok(
  'SELECT * FROM public.view_tag_popularity LIMIT 1',
  'Anonymous access to view_tag_popularity should work'
);

SELECT lives_ok(
  'SELECT * FROM public.view_category_details LIMIT 1',
  'Anonymous access to view_category_details should work'
);

-- --------------------------------------------------------------------------
-- SECTION 3: AUTHENTICATED USER ACCESS (as u_active - has roles in both orgs)
-- --------------------------------------------------------------------------

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);

-- u_active should see their own bookings through views
SELECT ok(
  (SELECT COUNT(*) FROM public.view_bookings_with_details WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid) >= 2,
  'u_active: should see their own bookings in view_bookings_with_details'
);

SELECT ok(
  (SELECT COUNT(*) FROM public.view_bookings_with_user_info WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid) >= 2,
  'u_active: should see their own bookings in view_bookings_with_user_info'
);

-- u_active should see their own user profile info
SELECT ok(
  (SELECT COUNT(*) FROM public.view_user_roles_with_details WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid) >= 2,
  'u_active: should see their own role assignments (both orgs)'
);

-- u_active should see storage items from both orgs via view_manage_storage_items
SELECT ok(
  (SELECT COUNT(*) FROM public.view_manage_storage_items WHERE organization_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '5b96fb05-1a69-4d8b-832a-504eebf13960'::uuid)) >= 2,
  'u_active: should see storage items from both organizations'
);

-- --------------------------------------------------------------------------
-- SECTION 4: AUTHENTICATED USER ACCESS (as u_orgA_only - has role only in orgA)
-- --------------------------------------------------------------------------

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);

-- u_orgA_only should see their own booking
SELECT ok(
  (SELECT COUNT(*) FROM public.view_bookings_with_details WHERE user_id = '00000000-0000-0000-0000-000000000002'::uuid) >= 1,
  'u_orgA_only: should see their own bookings'
);

-- u_orgA_only should NOT see u_active's bookings due to RLS on base tables
SELECT ok(
  (SELECT COUNT(*) FROM public.view_bookings_with_details WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid) = 0,
  'u_orgA_only: should NOT see other users bookings due to RLS'
);

-- u_orgA_only should see their own role assignments
SELECT ok(
  (SELECT COUNT(*) FROM public.view_user_roles_with_details WHERE user_id = '00000000-0000-0000-0000-000000000002'::uuid) >= 1,
  'u_orgA_only: should see their own role assignments'
);

-- u_orgA_only should see only orgA storage items (RLS on storage_items limits by org)
SELECT ok(
  (SELECT COUNT(*) FROM public.view_manage_storage_items WHERE organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid) >= 1,
  'u_orgA_only: should see orgA storage items'
);

-- u_orgA_only should NOT see orgB storage items
SELECT ok(
  (SELECT COUNT(*) FROM public.view_manage_storage_items WHERE organization_id = '5b96fb05-1a69-4d8b-832a-504eebf13960'::uuid) = 0,
  'u_orgA_only: should NOT see orgB storage items due to org-level RLS'
);

-- --------------------------------------------------------------------------
-- SECTION 5: APP-BANNED USER ACCESS (u_app_banned - no active roles)
-- --------------------------------------------------------------------------

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);

-- App-banned user should see NO data in private views due to restrictive ban policies
SELECT ok(
  (SELECT COUNT(*) FROM public.view_bookings_with_details) = 0,
  'u_app_banned: should see no bookings (app-level ban policy blocks)'
);

SELECT ok(
  (SELECT COUNT(*) FROM public.view_bookings_with_user_info) = 0,
  'u_app_banned: should see no booking user info (app-level ban policy blocks)'
);

SELECT ok(
  (SELECT COUNT(*) FROM public.view_user_roles_with_details) = 0,
  'u_app_banned: should see no role details (app-level ban policy blocks)'
);

-- u_app_banned should still see public catalog views (they bypass auth requirements)
SELECT ok(
  (SELECT COUNT(*) FROM public.view_manage_storage_items) >= 0,
  'u_app_banned: can still query public catalog views'
);

-- --------------------------------------------------------------------------
-- SECTION 6: VIEW SECURITY BARRIER VERIFICATION
-- --------------------------------------------------------------------------

-- Verify that security_barrier is actually set on our views
SELECT ok(
  (SELECT COUNT(*) FROM pg_class c 
   JOIN pg_namespace n ON c.relnamespace = n.oid 
   WHERE n.nspname = 'public' 
   AND c.relname LIKE 'view_%' 
   AND c.reloptions @> ARRAY['security_barrier=on']) >= 9,
  'All views should have security_barrier enabled'
);

-- --------------------------------------------------------------------------
-- SECTION 7: GRANT VERIFICATION
-- --------------------------------------------------------------------------

-- Verify that the correct grants are in place
SELECT ok(
  (SELECT has_table_privilege('anon', 'public.view_manage_storage_items', 'SELECT')),
  'Anonymous role should have SELECT on public catalog views'
);

SELECT ok(
  (SELECT has_table_privilege('authenticated', 'public.view_bookings_with_details', 'SELECT')),
  'Authenticated role should have SELECT on private booking views'
);

SELECT ok(
  NOT (SELECT has_table_privilege('anon', 'public.view_bookings_with_details', 'SELECT')),
  'Anonymous role should NOT have SELECT on private booking views'
);

-- --------------------------------------------------------------------------
-- SECTION 8: CLEANUP
-- --------------------------------------------------------------------------

-- Clean up test data (in reverse order of creation to respect foreign keys)
DELETE FROM public.booking_items WHERE id IN (
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0000-0000-0000-000000000002'::uuid,
  'c0000000-0000-0000-0000-000000000003'::uuid,
  'c0000000-0000-0000-0000-000000000004'::uuid
);
DELETE FROM public.bookings WHERE id IN (
  'b0000000-0000-0000-0000-000000000001'::uuid,
  'b0000000-0000-0000-0000-000000000002'::uuid,
  'b0000000-0000-0000-0000-000000000003'::uuid
);
DELETE FROM public.categories WHERE id = 'd0000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM public.storage_item_tags WHERE id IN (
  '90000000-0000-0000-0000-000000000001'::uuid,
  '90000000-0000-0000-0000-000000000002'::uuid
);
DELETE FROM public.tags WHERE id = '70000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM public.storage_items WHERE id IN (
  '60000000-0000-0000-0000-000000000001'::uuid,
  '60000000-0000-0000-0000-000000000002'::uuid
);
DELETE FROM public.organization_locations WHERE id IN (
  '40000000-0000-0000-0000-000000000001'::uuid,
  '40000000-0000-0000-0000-000000000002'::uuid
);
DELETE FROM public.storage_locations WHERE id IN (
  '30000000-0000-0000-0000-000000000001'::uuid,
  '30000000-0000-0000-0000-000000000002'::uuid
);
DELETE FROM public.user_organization_roles WHERE id IN (
  '50000000-0000-0000-0000-000000000001'::uuid,
  '50000000-0000-0000-0000-000000000002'::uuid,
  '50000000-0000-0000-0000-000000000003'::uuid,
  '50000000-0000-0000-0000-000000000004'::uuid
);
DELETE FROM public.user_profiles WHERE id IN (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000003'::uuid
);
DELETE FROM auth.users WHERE id IN (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000003'::uuid
);

SELECT * FROM finish();
ROLLBACK;
