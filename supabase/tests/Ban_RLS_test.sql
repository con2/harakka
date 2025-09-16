BEGIN;

-- ==========================================================================
-- BAN ENFORCEMENT RLS POLICIES - COMPREHENSIVE PGTAP TEST SUITE
-- ==========================================================================
-- Purpose: Test restrictive ban enforcement policies from 20250915114214_Ban_Policies.sql
-- Coverage:
--   • Catalog-level assertions (policies and functions exist)
--   • App-level ban enforcement (restrictive policies)
--   • Org-level ban enforcement (restrictive policies)
--   • Mixed booking provider org logic (deny if banned from ANY provider org)
-- ==========================================================================

SELECT no_plan();

-- --------------------------------------------------------------------------
-- SECTION 1: FIXTURE SETUP (executed as postgres)
-- --------------------------------------------------------------------------

-- Create test users in auth.users and user_profiles
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

-- Use actual seeded role IDs (no need to insert - they already exist)
-- user: 1663d9f0-7b1e-417d-9349-4f2e19b6d1e8
-- tenant_admin: 700b7f8d-be79-474e-b554-6886a3605277

-- Use actual seeded organization IDs (Test Organization and Illusia)
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

-- Create tags for item tag testing
INSERT INTO public.tags (id, created_at, translations)
VALUES 
  ('70000000-0000-0000-0000-000000000001'::uuid, now(), '{"en": {"tag_name": "Test Tag"}}');

-- Create storage item images (linked to items via org context)
INSERT INTO public.storage_item_images (id, item_id, image_url, storage_path, image_type, display_order, is_active, created_at)
VALUES 
  ('80000000-0000-0000-0000-000000000001'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 'http://test.com/itemA.jpg', '/test/itemA.jpg', 'main', 1, true, now()),
  ('80000000-0000-0000-0000-000000000002'::uuid, '60000000-0000-0000-0000-000000000002'::uuid, 'http://test.com/itemB.jpg', '/test/itemB.jpg', 'main', 1, true, now());

-- Create storage item tags (linked to items via org context)
INSERT INTO public.storage_item_tags (id, item_id, tag_id, created_at)
VALUES 
  ('90000000-0000-0000-0000-000000000001'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, '70000000-0000-0000-0000-000000000001'::uuid, now()),
  ('90000000-0000-0000-0000-000000000002'::uuid, '60000000-0000-0000-0000-000000000002'::uuid, '70000000-0000-0000-0000-000000000001'::uuid, now());

-- Create storage images (linked to locations via organization_locations join)
INSERT INTO public.storage_images (id, location_id, image_url, image_type, display_order, is_active, created_at)
VALUES 
  ('a0000000-0000-0000-0000-000000000001'::uuid, '30000000-0000-0000-0000-000000000001'::uuid, 'http://test.com/locA.jpg', 'main', 1, true, now()),
  ('a0000000-0000-0000-0000-000000000002'::uuid, '30000000-0000-0000-0000-000000000002'::uuid, 'http://test.com/locB.jpg', 'main', 1, true, now());

-- Create bookings
INSERT INTO public.bookings (id, booking_number, user_id, status, created_at)
VALUES 
  ('b0000000-0000-0000-0000-000000000001'::uuid, 'BOOK-A-001', '00000000-0000-0000-0000-000000000001'::uuid, 'pending', now()),
  ('b0000000-0000-0000-0000-000000000002'::uuid, 'BOOK-MIXED-002', '00000000-0000-0000-0000-000000000001'::uuid, 'pending', now());

-- Create booking items
INSERT INTO public.booking_items (id, booking_id, item_id, quantity, start_date, end_date, total_days, status, location_id, provider_organization_id, created_at)
VALUES 
  -- bookingA: only from orgA (should be visible to u_orgA_only)
  ('c0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000001'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 1, now(), now() + interval '1 day', 1, 'pending', '30000000-0000-0000-0000-000000000001'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, now()),
  -- bookingMixed: items from orgA and orgB (should NOT be visible to u_orgA_only due to "deny if banned from ANY provider org")
  ('c0000000-0000-0000-0000-000000000002'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 1, now(), now() + interval '1 day', 1, 'pending', '30000000-0000-0000-0000-000000000001'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, now()),
  ('c0000000-0000-0000-0000-000000000003'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid, '60000000-0000-0000-0000-000000000002'::uuid, 1, now(), now() + interval '1 day', 1, 'pending', '30000000-0000-0000-0000-000000000002'::uuid, '5b96fb05-1a69-4d8b-832a-504eebf13960'::uuid, now());

-- Create global resources for app-level policy testing
INSERT INTO public.categories (id, created_at, translations) 
VALUES ('d0000000-0000-0000-0000-000000000001'::uuid, now(), '{"en": {"category_name": "Test Category"}}');

INSERT INTO public.user_addresses (id, user_id, address_type, street_address, city, postal_code, country, is_default, created_at)
VALUES 
  ('e0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'both', '123 Active St', 'Test City', '12345', 'Test Country', true, now()),
  ('e0000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, 'both', '456 OrgA St', 'Test City', '12345', 'Test Country', true, now()),
  ('e0000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000003'::uuid, 'both', '789 Banned St', 'Test City', '12345', 'Test Country', true, now());

-- Create ban history for testing role-specific ban enforcement
INSERT INTO public.user_ban_history (id, user_id, organization_id, role_assignment_id, ban_type, action, banned_by, created_at, notes)
VALUES 
  ('f0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, '5b96fb05-1a69-4d8b-832a-504eebf13960'::uuid, '50000000-0000-0000-0000-000000000003'::uuid, 'banForRole', 'banned', '00000000-0000-0000-0000-000000000001'::uuid, now(), 'Test ban for role-specific ban enforcement testing');

-- --------------------------------------------------------------------------
-- SECTION 2: CATALOG-LEVEL ASSERTIONS (Policy and Function Existence)
-- --------------------------------------------------------------------------

-- Test app-level restrictive policies exist
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'storage_items'
      AND policyname = 'Ban Enforcement App Storage Items'
      AND permissive = 'RESTRICTIVE'
  ),
  'Restrictive app policy exists on storage_items'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'Ban Enforcement App Bookings'
      AND permissive = 'RESTRICTIVE'
  ),
  'Restrictive app policy exists on bookings'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'organizations'
      AND policyname = 'Ban Enforcement App Organizations'
      AND permissive = 'RESTRICTIVE'
  ),
  'Restrictive app policy exists on organizations'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_organization_roles'
      AND policyname = 'Ban Enforcement App User Organization Roles'
      AND permissive = 'RESTRICTIVE'
  ),
  'Restrictive app policy exists on user_organization_roles'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'categories'
      AND policyname = 'Ban Enforcement App Categories'
      AND permissive = 'RESTRICTIVE'
  ),
  'Restrictive app policy exists on categories'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tags'
      AND policyname = 'Ban Enforcement App Tags'
      AND permissive = 'RESTRICTIVE'
  ),
  'Restrictive app policy exists on tags'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_addresses'
      AND policyname = 'Ban Enforcement App User Addresses'
      AND permissive = 'RESTRICTIVE'
  ),
  'Restrictive app policy exists on user_addresses'
);

-- Test org-level restrictive policies exist
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'storage_items'
      AND policyname = 'Ban Enforcement Org Storage Items'
      AND permissive = 'RESTRICTIVE'
  ),
  'Restrictive org policy exists on storage_items'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'Ban Enforcement Org Bookings'
      AND permissive = 'RESTRICTIVE'
  ),
  'Restrictive org policy exists on bookings'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'organizations'
      AND policyname = 'Ban Enforcement Org Organizations (select)'
      AND permissive = 'RESTRICTIVE'
  ),
  'Restrictive org policy exists on organizations (select)'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'organizations'
      AND policyname = 'Ban Enforcement Org Organizations (update)'
      AND permissive = 'RESTRICTIVE'
  ),
  'Restrictive org policy exists on organizations (update)'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'organizations'
      AND policyname = 'Ban Enforcement Org Organizations (delete)'
      AND permissive = 'RESTRICTIVE'
  ),
  'Restrictive org policy exists on organizations (delete)'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_organization_roles'
      AND policyname = 'Ban Enforcement Org User Organization Roles'
      AND permissive = 'RESTRICTIVE'
  ),
  'Restrictive org policy exists on user_organization_roles'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'storage_item_images'
      AND policyname = 'Ban Enforcement Org Storage Item Images'
      AND permissive = 'RESTRICTIVE'
  ),
  'Restrictive org policy exists on storage_item_images'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'storage_item_tags'
      AND policyname = 'Ban Enforcement Org Storage Item Tags'
      AND permissive = 'RESTRICTIVE'
  ),
  'Restrictive org policy exists on storage_item_tags'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'storage_images'
      AND policyname = 'Ban Enforcement Org Storage Images'
      AND permissive = 'RESTRICTIVE'
  ),
  'Restrictive org policy exists on storage_images'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'storage_locations'
      AND policyname = 'Ban Enforcement Org Storage Locations'
      AND permissive = 'RESTRICTIVE'
  ),
  'Restrictive org policy exists on storage_locations'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'organization_locations'
      AND policyname = 'Ban Enforcement Org Organization Locations'
      AND permissive = 'RESTRICTIVE'
  ),
  'Restrictive org policy exists on organization_locations'
);

-- Test helper functions exist and have correct attributes
SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'app'
      AND p.proname = 'me_is_not_banned_for_app'
      AND p.prosecdef = true     -- SECURITY DEFINER
      AND p.provolatile = 's'    -- STABLE
  ),
  'app.me_is_not_banned_for_app is SECURITY DEFINER and STABLE'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'app'
      AND p.proname = 'me_is_not_banned_for_org'
      AND p.prosecdef = true     -- SECURITY DEFINER
      AND p.provolatile = 's'    -- STABLE
  ),
  'app.me_is_not_banned_for_org is SECURITY DEFINER and STABLE'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'app'
      AND p.proname = 'me_is_not_banned_for_role'
      AND p.prosecdef = true     -- SECURITY DEFINER
      AND p.provolatile = 's'    -- STABLE
  ),
  'app.me_is_not_banned_for_role is SECURITY DEFINER and STABLE'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'is_user_banned_for_app'
      AND p.prosecdef = true     -- SECURITY DEFINER
  ),
  'public.is_user_banned_for_app is SECURITY DEFINER'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'is_user_banned_for_org'
      AND p.prosecdef = true     -- SECURITY DEFINER
  ),
  'public.is_user_banned_for_org is SECURITY DEFINER'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'is_user_banned_for_role'
      AND p.prosecdef = true     -- SECURITY DEFINER
  ),
  'public.is_user_banned_for_role is SECURITY DEFINER'
);

-- --------------------------------------------------------------------------
-- SECTION 3: FIXTURE SANITY CHECKS (executed as postgres)
-- --------------------------------------------------------------------------

-- Verify fixtures are created correctly
SELECT results_eq(
  $$ SELECT count(*)::int FROM public.storage_items 
     WHERE id IN ('60000000-0000-0000-0000-000000000001'::uuid, '60000000-0000-0000-0000-000000000002'::uuid) $$,
  ARRAY[2],
  'Fixture sanity: 2 test storage_items exist (as postgres)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.bookings 
     WHERE id IN ('b0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid) $$,
  ARRAY[2],
  'Fixture sanity: 2 test bookings exist (as postgres)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.booking_items 
     WHERE id IN ('c0000000-0000-0000-0000-000000000001'::uuid, 'c0000000-0000-0000-0000-000000000002'::uuid, 'c0000000-0000-0000-0000-000000000003'::uuid) $$,
  ARRAY[3],
  'Fixture sanity: 3 test booking_items exist (as postgres)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.organizations WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '5b96fb05-1a69-4d8b-832a-504eebf13960'::uuid) $$,
  ARRAY[2],
  'Fixture sanity: 2 test organizations exist (as postgres)'
);

-- --------------------------------------------------------------------------
-- SECTION 4: APP-LEVEL BAN ENFORCEMENT TESTS
-- --------------------------------------------------------------------------

-- Test as u_active (has active roles, not banned at app level)
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);

-- Helper function should return TRUE (not banned)
SELECT ok(
  app.me_is_not_banned_for_app(),
  'u_active: app.me_is_not_banned_for_app() returns TRUE'
);

-- Should see all app-level resources
SELECT results_eq(
  $$ SELECT count(*)::int FROM public.storage_items 
     WHERE id IN ('60000000-0000-0000-0000-000000000001'::uuid, '60000000-0000-0000-0000-000000000002'::uuid) $$,
  ARRAY[2],
  'u_active: sees test storage_items (app policy allows)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.bookings 
     WHERE id IN ('b0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid) $$,
  ARRAY[2],
  'u_active: sees test bookings (app policy allows)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.organizations 
     WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '5b96fb05-1a69-4d8b-832a-504eebf13960'::uuid) $$,
  ARRAY[2],
  'u_active: sees test organizations (app policy allows)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.categories 
     WHERE id = 'd0000000-0000-0000-0000-000000000001'::uuid $$,
  ARRAY[1],
  'u_active: sees test categories (app policy allows)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.tags 
     WHERE id = '70000000-0000-0000-0000-000000000001'::uuid $$,
  ARRAY[1],
  'u_active: sees test tags (app policy allows)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.user_addresses 
     WHERE id IN ('e0000000-0000-0000-0000-000000000001'::uuid, 'e0000000-0000-0000-0000-000000000002'::uuid, 'e0000000-0000-0000-0000-000000000003'::uuid) $$,
  ARRAY[3],
  'u_active: sees test user_addresses (app policy allows)'
);

-- Test as u_orgA_only (has active role in orgA only, not app-banned)
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);

-- Helper function should return TRUE (not banned at app level)
SELECT ok(
  app.me_is_not_banned_for_app(),
  'u_orgA_only: app.me_is_not_banned_for_app() returns TRUE'
);

-- Should see all app-level resources (app policy allows)
SELECT results_eq(
  $$ SELECT count(*)::int FROM public.categories 
     WHERE id = 'd0000000-0000-0000-0000-000000000001'::uuid $$,
  ARRAY[1],
  'u_orgA_only: sees test categories (app policy allows)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.tags 
     WHERE id = '70000000-0000-0000-0000-000000000001'::uuid $$,
  ARRAY[1],
  'u_orgA_only: sees test tags (app policy allows)'
);

-- Test as u_app_banned (no active roles anywhere, app-banned)
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);

-- Helper function should return FALSE (banned at app level)
SELECT ok(
  NOT app.me_is_not_banned_for_app(),
  'u_app_banned: app.me_is_not_banned_for_app() returns FALSE'
);

-- Should see NO app-restricted resources
SELECT results_eq(
  $$ SELECT count(*)::int FROM public.storage_items $$,
  ARRAY[0],
  'u_app_banned: sees no storage_items (app policy blocks)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.bookings $$,
  ARRAY[0],
  'u_app_banned: sees no bookings (app policy blocks)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.organizations $$,
  ARRAY[0],
  'u_app_banned: sees no organizations (app policy blocks)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.user_organization_roles $$,
  ARRAY[0],
  'u_app_banned: sees no user_organization_roles (app policy blocks)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.categories $$,
  ARRAY[0],
  'u_app_banned: sees no categories (app policy blocks)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.tags $$,
  ARRAY[0],
  'u_app_banned: sees no tags (app policy blocks)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.user_addresses $$,
  ARRAY[0],
  'u_app_banned: sees no user_addresses (app policy blocks)'
);

-- --------------------------------------------------------------------------
-- SECTION 5: ORG-LEVEL BAN ENFORCEMENT TESTS
-- --------------------------------------------------------------------------

-- Test as u_active (active in both orgs A and B)
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);

-- Should see all org-scoped resources
SELECT results_eq(
  $$ SELECT count(*)::int FROM public.storage_items $$,
  ARRAY[2],
  'u_active: sees both storage_items (not org-banned)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.storage_item_images $$,
  ARRAY[2],
  'u_active: sees both storage_item_images (not org-banned)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.storage_item_tags $$,
  ARRAY[2],
  'u_active: sees both storage_item_tags (not org-banned)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.storage_images $$,
  ARRAY[2],
  'u_active: sees both storage_images (not org-banned)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.storage_locations $$,
  ARRAY[2],
  'u_active: sees both storage_locations (not org-banned)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.organization_locations $$,
  ARRAY[2],
  'u_active: sees both organization_locations (not org-banned)'
);

-- Mixed booking test: u_active should see both bookings
SELECT results_eq(
  $$ SELECT count(*)::int FROM public.bookings 
     WHERE id IN ('b0000000-0000-0000-0000-000000000001'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid) $$,
  ARRAY[2],
  'u_active: sees both test bookings including mixed (not org-banned)'
);

-- Test as u_orgA_only (active in orgA only, banned from orgB)
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);

-- Helper function tests
SELECT ok(
  app.me_is_not_banned_for_org('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid),
  'u_orgA_only: not banned for orgA'
);

SELECT ok(
  NOT app.me_is_not_banned_for_org('5b96fb05-1a69-4d8b-832a-504eebf13960'::uuid),
  'u_orgA_only: IS banned for orgB'
);

-- Should see only orgA resources
SELECT results_eq(
  $$ SELECT count(*)::int FROM public.storage_items WHERE org_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid $$,
  ARRAY[1],
  'u_orgA_only: sees itemA (orgA item)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.storage_items WHERE org_id = '5b96fb05-1a69-4d8b-832a-504eebf13960'::uuid $$,
  ARRAY[0],
  'u_orgA_only: does NOT see itemB (orgB item, banned)'
);

-- Should see only orgA-linked storage item images
SELECT results_eq(
  $$ SELECT count(*)::int FROM public.storage_item_images sii
     JOIN public.storage_items si ON si.id = sii.item_id
     WHERE si.org_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid $$,
  ARRAY[1],
  'u_orgA_only: sees itemA images'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.storage_item_images sii
     JOIN public.storage_items si ON si.id = sii.item_id
     WHERE si.org_id = '5b96fb05-1a69-4d8b-832a-504eebf13960'::uuid $$,
  ARRAY[0],
  'u_orgA_only: does NOT see itemB images'
);

-- Should see only orgA-linked storage item tags
SELECT results_eq(
  $$ SELECT count(*)::int FROM public.storage_item_tags sit
     JOIN public.storage_items si ON si.id = sit.item_id
     WHERE si.org_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid $$,
  ARRAY[1],
  'u_orgA_only: sees itemA tags'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.storage_item_tags sit
     JOIN public.storage_items si ON si.id = sit.item_id
     WHERE si.org_id = '5b96fb05-1a69-4d8b-832a-504eebf13960'::uuid $$,
  ARRAY[0],
  'u_orgA_only: does NOT see itemB tags'
);

-- Should see only orgA-linked organization_locations
SELECT results_eq(
  $$ SELECT count(*)::int FROM public.organization_locations 
     WHERE organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid $$,
  ARRAY[1],
  'u_orgA_only: sees orgA organization_locations'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.organization_locations 
     WHERE organization_id = '5b96fb05-1a69-4d8b-832a-504eebf13960'::uuid $$,
  ARRAY[0],
  'u_orgA_only: does NOT see orgB organization_locations'
);

-- Should see only orgA-linked storage_images (via organization_locations join)
SELECT results_eq(
  $$ SELECT count(*)::int FROM public.storage_images si
     JOIN public.organization_locations ol ON ol.storage_location_id = si.location_id
     WHERE ol.organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid $$,
  ARRAY[1],
  'u_orgA_only: sees orgA storage_images'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.storage_images si
     JOIN public.organization_locations ol ON ol.storage_location_id = si.location_id
     WHERE ol.organization_id = '5b96fb05-1a69-4d8b-832a-504eebf13960'::uuid $$,
  ARRAY[0],
  'u_orgA_only: does NOT see orgB storage_images'
);

-- Should see only orgA-linked storage_locations (via organization_locations join)
SELECT results_eq(
  $$ SELECT count(*)::int FROM public.storage_locations sl
     JOIN public.organization_locations ol ON ol.storage_location_id = sl.id
     WHERE ol.organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid $$,
  ARRAY[1],
  'u_orgA_only: sees orgA storage_locations'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.storage_locations sl
     JOIN public.organization_locations ol ON ol.storage_location_id = sl.id
     WHERE ol.organization_id = '5b96fb05-1a69-4d8b-832a-504eebf13960'::uuid $$,
  ARRAY[0],
  'u_orgA_only: does NOT see orgB storage_locations'
);

-- --------------------------------------------------------------------------
-- SECTION 6: MIXED BOOKING PROVIDER ORG TESTS
-- --------------------------------------------------------------------------

-- Test as u_active (should see both bookings)
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.bookings WHERE id = 'b0000000-0000-0000-0000-000000000001'::uuid $$,
  ARRAY[1],
  'u_active: sees single-org booking (orgA only)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.bookings WHERE id = 'b0000000-0000-0000-0000-000000000002'::uuid $$,
  ARRAY[1],
  'u_active: sees mixed booking (orgA + orgB)'
);

-- Test as u_orgA_only (critical test: should NOT see mixed booking due to "deny if banned from ANY provider org")
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.bookings WHERE id = 'b0000000-0000-0000-0000-000000000001'::uuid $$,
  ARRAY[1],
  'u_orgA_only: sees single-org booking (orgA only)'
);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.bookings WHERE id = 'b0000000-0000-0000-0000-000000000002'::uuid $$,
  ARRAY[0],
  'u_orgA_only: does NOT see mixed booking (contains orgB item)'
);

-- Test as u_app_banned (should see no bookings)
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);

SELECT results_eq(
  $$ SELECT count(*)::int FROM public.bookings $$,
  ARRAY[0],
  'u_app_banned: sees no bookings (app policy blocks)'
);

-- --------------------------------------------------------------------------
-- SECTION 7: ADDITIONAL HELPER FUNCTION TESTS
-- --------------------------------------------------------------------------

-- Switch back to u_orgA_only for role-specific ban testing
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);

-- Test role-specific ban function (should work for role that user has)
SELECT ok(
  app.me_is_not_banned_for_role('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '1663d9f0-7b1e-417d-9349-4f2e19b6d1e8'::uuid),
  'u_orgA_only: not banned for role in orgA'
);

-- Test role-specific ban function (user without role assignment in org returns "not banned" for role-specific check - this is expected)  
SELECT ok(
  app.me_is_not_banned_for_role('5b96fb05-1a69-4d8b-832a-504eebf13960'::uuid, '1663d9f0-7b1e-417d-9349-4f2e19b6d1e8'::uuid),
  'u_orgA_only: role-specific ban check returns not-banned for org where user has no role (expected behavior)'
);

SELECT * FROM finish();
ROLLBACK;
