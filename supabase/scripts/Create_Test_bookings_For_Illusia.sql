-- ============================================================================
-- Create Test Bookings for Illusia (RLS testing)
-- How to use: paste into Supabase SQL editor and run.
-- Notes:
--   - Creates one booking per provided test user and one booking_item each,
--     using storage items with the highest available quantities.
--   - booking_items.provider_organization_id is set from each item’s org_id.
--   - Adjust item choices if your test users have roles in different orgs.
--   - Safe to re-run after uncommenting the cleanup block below.
-- ============================================================================

-- Optional cleanup (uncomment to wipe previous test data by booking_number)
-- BEGIN;
--   DELETE FROM public.booking_items
--   WHERE booking_id IN (
--     SELECT id FROM public.bookings
--     WHERE booking_number IN (
--       'TEST-BK-REG-001',
--       'TEST-BK-SM-001',
--       'TEST-BK-SA-001',
--       'TEST-BK-TA-001',
--       'TEST-BK-REQ-001'
--     )
--   );
--   DELETE FROM public.bookings
--   WHERE booking_number IN (
--     'TEST-BK-REG-001',
--     'TEST-BK-SM-001',
--     'TEST-BK-SA-001',
--     'TEST-BK-TA-001',
--     'TEST-BK-REQ-001'
--   );
-- COMMIT;

-- --------------------------------------------------------------------------
-- Regular User Test User (no special org role expected)
-- Booking item uses: Bridge consoles (available_quantity ~ 10)
--   item_id:      e22019a0-a28f-4081-8af7-2d816101f43c
--   location_id:  f47ac10b-58cc-4372-a567-0e02b2c3d479
--   provider_org: 0817d279-a230-49a3-a6c2-a8198151c504
-- --------------------------------------------------------------------------
WITH b AS (
  INSERT INTO public.bookings (booking_number, user_id, status, notes)
  VALUES (
    'TEST-BK-REG-001',
    '6e2686aa-7164-4a10-8852-177c56dd3d5f',
    'pending'::public.booking_status,
    'Test booking for Regular User'
  )
  ON CONFLICT (booking_number) DO UPDATE SET notes = EXCLUDED.notes
  RETURNING id
)
INSERT INTO public.booking_items (
  booking_id, item_id, quantity, start_date, end_date, total_days, status,
  location_id, provider_organization_id
)
SELECT
  b.id,
  'e22019a0-a28f-4081-8af7-2d816101f43c'::uuid, -- Bridge consoles
  2,
  TIMESTAMPTZ '2025-10-01 09:00+00',
  TIMESTAMPTZ '2025-10-05 09:00+00',
  (DATE '2025-10-05' - DATE '2025-10-01'),
  'pending'::public.booking_status,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '0817d279-a230-49a3-a6c2-a8198151c504'::uuid
FROM b;

-- --------------------------------------------------------------------------
-- Storage Manager Test User
-- Booking item uses: Fire extinguishers (available_quantity ~ 16)
--   item_id:      b7fbc4b8-f9e5-43ae-9965-1c70a4189301
--   location_id:  f47ac10b-58cc-4372-a567-0e02b2c3d479
--   provider_org: e264fde4-5624-4fe1-a683-88070f4d78e8
-- --------------------------------------------------------------------------
WITH b AS (
  INSERT INTO public.bookings (booking_number, user_id, status, notes)
  VALUES (
    'TEST-2',
    '1e647a27-717f-4aee-a2da-f2c1737349c1',
    'pending'::public.booking_status,
    'Test booking for Storage Manager'
  )
  ON CONFLICT (booking_number) DO UPDATE SET notes = EXCLUDED.notes
  RETURNING id
)
INSERT INTO public.booking_items (
  booking_id, item_id, quantity, start_date, end_date, total_days, status,
  location_id, provider_organization_id
)
SELECT
  b.id,
  'b7fbc4b8-f9e5-43ae-9965-1c70a4189301'::uuid, -- Fire extinguishers
  3,
  TIMESTAMPTZ '2025-10-03 09:00+00',
  TIMESTAMPTZ '2025-10-06 09:00+00',
  (DATE '2025-10-06' - DATE '2025-10-03'),
  'pending'::public.booking_status,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'e264fde4-5624-4fe1-a683-88070f4d78e8'::uuid
FROM b;

-- --------------------------------------------------------------------------
-- Super Admin Test User (expected to be restricted by booking_items policies)
-- Booking item uses: Viper helmet (available_quantity ~ 10)
--   item_id:      e609e371-1d7a-4b8d-a2a8-b4a9f391e994
--   location_id:  244514fd-4cab-46ac-a2aa-9e0f9fca6e50
--   provider_org: b371f776-e480-4b4e-9147-7116f9fa3918
-- --------------------------------------------------------------------------
WITH b AS (
  INSERT INTO public.bookings (booking_number, user_id, status, notes)
  VALUES (
    'TEST-BK-SA-001',
    'b8339c44-8410-49e0-8bb6-b74876120185',
    'pending'::public.booking_status,
    'Test booking for Super Admin (should be blocked on booking_items)'
  )
  ON CONFLICT (booking_number) DO UPDATE SET notes = EXCLUDED.notes
  RETURNING id
)
INSERT INTO public.booking_items (
  booking_id, item_id, quantity, start_date, end_date, total_days, status,
  location_id, provider_organization_id
)
SELECT
  b.id,
  'e609e371-1d7a-4b8d-a2a8-b4a9f391e994'::uuid, -- Viper helmet
  5,
  TIMESTAMPTZ '2025-10-10 10:00+00',
  TIMESTAMPTZ '2025-10-15 10:00+00',
  (DATE '2025-10-15' - DATE '2025-10-10'),
  'pending'::public.booking_status,
  '244514fd-4cab-46ac-a2aa-9e0f9fca6e50'::uuid,
  'b371f776-e480-4b4e-9147-7116f9fa3918'::uuid
FROM b;

-- --------------------------------------------------------------------------
-- Tenant Admin Test User
-- Booking item uses: Fighter consoles (available_quantity ~ 20)
--   item_id:      90c2b991-0b0b-4f56-8d42-f250ebabbb10
--   location_id:  f47ac10b-58cc-4372-a567-0e02b2c3d479
--   provider_org: 0360be4f-2ea1-4b89-960d-cff888fb7475
-- --------------------------------------------------------------------------
WITH b AS (
  INSERT INTO public.bookings (booking_number, user_id, status, notes)
  VALUES (
    'TEST-BK-TA-001',
    'b08ed477-8100-4ee8-8ff8-84e1bcba1550',
    'pending'::public.booking_status,
    'Test booking for Tenant Admin'
  )
  ON CONFLICT (booking_number) DO UPDATE SET notes = EXCLUDED.notes
  RETURNING id
)
INSERT INTO public.booking_items (
  booking_id, item_id, quantity, start_date, end_date, total_days, status,
  location_id, provider_organization_id
)
SELECT
  b.id,
  '90c2b991-0b0b-4f56-8d42-f250ebabbb10'::uuid, -- Fighter consoles
  2,
  TIMESTAMPTZ '2025-10-12 09:00+00',
  TIMESTAMPTZ '2025-10-16 09:00+00',
  (DATE '2025-10-16' - DATE '2025-10-12'),
  'pending'::public.booking_status,
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  '0360be4f-2ea1-4b89-960d-cff888fb7475'::uuid
FROM b;

-- --------------------------------------------------------------------------
-- Requester Test User
-- Booking item uses: Test23434 (available_quantity ~ 10)
--   item_id:      e6ec82ea-d6f7-4247-aeb0-f73d67c670bd
--   location_id:  244514fd-4cab-46ac-a2aa-9e0f9fca6e50
--   provider_org: 51f5fd2f-9b13-47dd-b51f-539c7ef4f345
-- --------------------------------------------------------------------------
WITH b AS (
  INSERT INTO public.bookings (booking_number, user_id, status, notes)
  VALUES (
    'TEST-BK-REQ-001',
    '0b24acf7-1c93-490b-8e49-8596caeb06a7',
    'pending'::public.booking_status,
    'Test booking for Requester'
  )
  ON CONFLICT (booking_number) DO UPDATE SET notes = EXCLUDED.notes
  RETURNING id
)
INSERT INTO public.booking_items (
  booking_id, item_id, quantity, start_date, end_date, total_days, status,
  location_id, provider_organization_id
)
SELECT
  b.id,
  'e6ec82ea-d6f7-4247-aeb0-f73d67c670bd'::uuid, -- Test23434
  2,
  TIMESTAMPTZ '2025-10-18 09:00+00',
  TIMESTAMPTZ '2025-10-21 09:00+00',
  (DATE '2025-10-21' - DATE '2025-10-18'),
  'pending'::public.booking_status,
  '244514fd-4cab-46ac-a2aa-9e0f9fca6e50'::uuid,
  '51f5fd2f-9b13-47dd-b51f-539c7ef4f345'::uuid
FROM b;

-- ============================================================================
-- Optional: Assign org roles for test users (uncomment if needed)
--   These help exercise SELECT policies on booking_items which are org-scoped.
--   Requires that public.roles table contains the roles and that IDs exist.
--   Replace role IDs lookup as necessary for your schema.
-- ============================================================================
-- WITH role_ids AS (
--   SELECT 
--     (SELECT id FROM public.roles WHERE role = 'tenant_admin')  AS r_tenant_admin,
--     (SELECT id FROM public.roles WHERE role = 'storage_manager') AS r_storage_manager,
--     (SELECT id FROM public.roles WHERE role = 'requester') AS r_requester
-- )
-- INSERT INTO public.user_organization_roles (user_id, organization_id, role_id, is_active)
-- SELECT * FROM (
--   VALUES
--     -- Storage Manager user for e264fde4-... (fire extinguishers org)
--     ('1e647a27-717f-4aee-a2da-f2c1737349c1'::uuid, 'e264fde4-5624-4fe1-a683-88070f4d78e8'::uuid, (SELECT r_storage_manager FROM role_ids), true),
--     -- Tenant Admin user for 0360be4f-... (fighter consoles org)
--     ('b08ed477-8100-4ee8-8ff8-84e1bcba1550'::uuid, '0360be4f-2ea1-4b89-960d-cff888fb7475'::uuid, (SELECT r_tenant_admin FROM role_ids), true),
--     -- Requester user for 51f5fd2f-... (Test23434 org)
--     ('0b24acf7-1c93-490b-8e49-8596caeb06a7'::uuid, '51f5fd2f-9b13-47dd-b51f-539c7ef4f345'::uuid, (SELECT r_requester FROM role_ids), true)
-- ) v(user_id, organization_id, role_id, is_active);

