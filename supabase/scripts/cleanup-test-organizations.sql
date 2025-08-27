-- Test Organizations Cleanup Script
-- Compatible with Supabase SQL Editor
-- 
-- This script removes 20 test organizations and all their dependencies
-- Copy and paste this entire script into your Supabase SQL Editor

BEGIN;

-- Step 1: Delete user_organization_roles (main foreign key blocker)
-- This removes all role assignments for test organizations
DELETE FROM user_organization_roles 
WHERE organization_id IN (
    '205b5fff-983f-4dbd-bc79-b5a0ab85e6de', '41cdd476-06b4-44c9-b45c-49ac54f08b26',
    '1682f17d-aba2-4c02-b0eb-9352f92cc7d3', '1af28a8d-bf57-492e-afc4-142f13cd2292',
    '208ce117-cbf2-4aa3-8064-ea8202440328', '31c70ff1-2bcb-443d-9549-6505d5db6fba',
    '4f8f4245-051b-40d2-a9cd-3c44af6f6404', '8a162e4f-bb8a-4f9c-9da6-7e4c58597a99',
    '952469e0-5f97-4f9e-9932-5d34658bc30f', 'a82dddde-09b7-4488-abcb-7761c606641a',
    'a92d5eb4-40fd-4349-88cc-46d764ea2c17', 'b208739a-e48b-4ab8-871a-c092fc73e013',
    'b22e93b4-8f6f-4170-982a-709ce235e12d', 'b63bbdcc-8116-4c9b-b035-5fc31c68a665',
    'b76a00ca-c069-4a88-80ce-ad9fd46602ab', 'd862b8e3-28e8-4d1d-b143-5075b026135b',
    'dcc174ae-d24c-4dfe-8714-17b2f8933644', 'e0394359-42ca-4747-8ab4-f7b183861ab2',
    'e8154c33-2ba5-48db-a105-b3f95ad9bb6c', 'fecbb2f9-a28a-4230-87fd-6ba55be13b8e'
);

-- Step 2: Delete user_ban_history records
DELETE FROM user_ban_history 
WHERE organization_id IN (
    '205b5fff-983f-4dbd-bc79-b5a0ab85e6de', '41cdd476-06b4-44c9-b45c-49ac54f08b26',
    '1682f17d-aba2-4c02-b0eb-9352f92cc7d3', '1af28a8d-bf57-492e-afc4-142f13cd2292',
    '208ce117-cbf2-4aa3-8064-ea8202440328', '31c70ff1-2bcb-443d-9549-6505d5db6fba',
    '4f8f4245-051b-40d2-a9cd-3c44af6f6404', '8a162e4f-bb8a-4f9c-9da6-7e4c58597a99',
    '952469e0-5f97-4f9e-9932-5d34658bc30f', 'a82dddde-09b7-4488-abcb-7761c606641a',
    'a92d5eb4-40fd-4349-88cc-46d764ea2c17', 'b208739a-e48b-4ab8-871a-c092fc73e013',
    'b22e93b4-8f6f-4170-982a-709ce235e12d', 'b63bbdcc-8116-4c9b-b035-5fc31c68a665',
    'b76a00ca-c069-4a88-80ce-ad9fd46602ab', 'd862b8e3-28e8-4d1d-b143-5075b026135b',
    'dcc174ae-d24c-4dfe-8714-17b2f8933644', 'e0394359-42ca-4747-8ab4-f7b183861ab2',
    'e8154c33-2ba5-48db-a105-b3f95ad9bb6c', 'fecbb2f9-a28a-4230-87fd-6ba55be13b8e'
);

-- Step 3: Delete organization_locations
DELETE FROM organization_locations 
WHERE organization_id IN (
    '205b5fff-983f-4dbd-bc79-b5a0ab85e6de', '41cdd476-06b4-44c9-b45c-49ac54f08b26',
    '1682f17d-aba2-4c02-b0eb-9352f92cc7d3', '1af28a8d-bf57-492e-afc4-142f13cd2292',
    '208ce117-cbf2-4aa3-8064-ea8202440328', '31c70ff1-2bcb-443d-9549-6505d5db6fba',
    '4f8f4245-051b-40d2-a9cd-3c44af6f6404', '8a162e4f-bb8a-4f9c-9da6-7e4c58597a99',
    '952469e0-5f97-4f9e-9932-5d34658bc30f', 'a82dddde-09b7-4488-abcb-7761c606641a',
    'a92d5eb4-40fd-4349-88cc-46d764ea2c17', 'b208739a-e48b-4ab8-871a-c092fc73e013',
    'b22e93b4-8f6f-4170-982a-709ce235e12d', 'b63bbdcc-8116-4c9b-b035-5fc31c68a665',
    'b76a00ca-c069-4a88-80ce-ad9fd46602ab', 'd862b8e3-28e8-4d1d-b143-5075b026135b',
    'dcc174ae-d24c-4dfe-8714-17b2f8933644', 'e0394359-42ca-4747-8ab4-f7b183861ab2',
    'e8154c33-2ba5-48db-a105-b3f95ad9bb6c', 'fecbb2f9-a28a-4230-87fd-6ba55be13b8e'
);

-- Step 4: Update booking_items to remove provider_organization_id references
UPDATE booking_items 
SET provider_organization_id = NULL 
WHERE provider_organization_id IN (
    '205b5fff-983f-4dbd-bc79-b5a0ab85e6de', '41cdd476-06b4-44c9-b45c-49ac54f08b26',
    '1682f17d-aba2-4c02-b0eb-9352f92cc7d3', '1af28a8d-bf57-492e-afc4-142f13cd2292',
    '208ce117-cbf2-4aa3-8064-ea8202440328', '31c70ff1-2bcb-443d-9549-6505d5db6fba',
    '4f8f4245-051b-40d2-a9cd-3c44af6f6404', '8a162e4f-bb8a-4f9c-9da6-7e4c58597a99',
    '952469e0-5f97-4f9e-9932-5d34658bc30f', 'a82dddde-09b7-4488-abcb-7761c606641a',
    'a92d5eb4-40fd-4349-88cc-46d764ea2c17', 'b208739a-e48b-4ab8-871a-c092fc73e013',
    'b22e93b4-8f6f-4170-982a-709ce235e12d', 'b63bbdcc-8116-4c9b-b035-5fc31c68a665',
    'b76a00ca-c069-4a88-80ce-ad9fd46602ab', 'd862b8e3-28e8-4d1d-b143-5075b026135b',
    'dcc174ae-d24c-4dfe-8714-17b2f8933644', 'e0394359-42ca-4747-8ab4-f7b183861ab2',
    'e8154c33-2ba5-48db-a105-b3f95ad9bb6c', 'fecbb2f9-a28a-4230-87fd-6ba55be13b8e'
);

-- Step 5: Delete promotions owned by test organizations
DELETE FROM promotions 
WHERE owner_organization_id IN (
    '205b5fff-983f-4dbd-bc79-b5a0ab85e6de', '41cdd476-06b4-44c9-b45c-49ac54f08b26',
    '1682f17d-aba2-4c02-b0eb-9352f92cc7d3', '1af28a8d-bf57-492e-afc4-142f13cd2292',
    '208ce117-cbf2-4aa3-8064-ea8202440328', '31c70ff1-2bcb-443d-9549-6505d5db6fba',
    '4f8f4245-051b-40d2-a9cd-3c44af6f6404', '8a162e4f-bb8a-4f9c-9da6-7e4c58597a99',
    '952469e0-5f97-4f9e-9932-5d34658bc30f', 'a82dddde-09b7-4488-abcb-7761c606641a',
    'a92d5eb4-40fd-4349-88cc-46d764ea2c17', 'b208739a-e48b-4ab8-871a-c092fc73e013',
    'b22e93b4-8f6f-4170-982a-709ce235e12d', 'b63bbdcc-8116-4c9b-b035-5fc31c68a665',
    'b76a00ca-c069-4a88-80ce-ad9fd46602ab', 'd862b8e3-28e8-4d1d-b143-5075b026135b',
    'dcc174ae-d24c-4dfe-8714-17b2f8933644', 'e0394359-42ca-4747-8ab4-f7b183861ab2',
    'e8154c33-2ba5-48db-a105-b3f95ad9bb6c', 'fecbb2f9-a28a-4230-87fd-6ba55be13b8e'
);

-- Step 6: Finally, delete the test organizations
DELETE FROM organizations 
WHERE id IN (
    '205b5fff-983f-4dbd-bc79-b5a0ab85e6de', '41cdd476-06b4-44c9-b45c-49ac54f08b26',
    '1682f17d-aba2-4c02-b0eb-9352f92cc7d3', '1af28a8d-bf57-492e-afc4-142f13cd2292',
    '208ce117-cbf2-4aa3-8064-ea8202440328', '31c70ff1-2bcb-443d-9549-6505d5db6fba',
    '4f8f4245-051b-40d2-a9cd-3c44af6f6404', '8a162e4f-bb8a-4f9c-9da6-7e4c58597a99',
    '952469e0-5f97-4f9e-9932-5d34658bc30f', 'a82dddde-09b7-4488-abcb-7761c606641a',
    'a92d5eb4-40fd-4349-88cc-46d764ea2c17', 'b208739a-e48b-4ab8-871a-c092fc73e013',
    'b22e93b4-8f6f-4170-982a-709ce235e12d', 'b63bbdcc-8116-4c9b-b035-5fc31c68a665',
    'b76a00ca-c069-4a88-80ce-ad9fd46602ab', 'd862b8e3-28e8-4d1d-b143-5075b026135b',
    'dcc174ae-d24c-4dfe-8714-17b2f8933644', 'e0394359-42ca-4747-8ab4-f7b183861ab2',
    'e8154c33-2ba5-48db-a105-b3f95ad9bb6c', 'fecbb2f9-a28a-4230-87fd-6ba55be13b8e'
);

COMMIT;

-- Verification queries (run these after the cleanup to confirm everything worked):
--
-- Check that all test organizations are gone:
-- SELECT COUNT(*) FROM organizations WHERE id IN (
--     '205b5fff-983f-4dbd-bc79-b5a0ab85e6de', '41cdd476-06b4-44c9-b45c-49ac54f08b26',
--     '1682f17d-aba2-4c02-b0eb-9352f92cc7d3', '1af28a8d-bf57-492e-afc4-142f13cd2292',
--     '208ce117-cbf2-4aa3-8064-ea8202440328', '31c70ff1-2bcb-443d-9549-6505d5db6fba',
--     '4f8f4245-051b-40d2-a9cd-3c44af6f6404', '8a162e4f-bb8a-4f9c-9da6-7e4c58597a99',
--     '952469e0-5f97-4f9e-9932-5d34658bc30f', 'a82dddde-09b7-4488-abcb-7761c606641a',
--     'a92d5eb4-40fd-4349-88cc-46d764ea2c17', 'b208739a-e48b-4ab8-871a-c092fc73e013',
--     'b22e93b4-8f6f-4170-982a-709ce235e12d', 'b63bbdcc-8116-4c9b-b035-5fc31c68a665',
--     'b76a00ca-c069-4a88-80ce-ad9fd46602ab', 'd862b8e3-28e8-4d1d-b143-5075b026135b',
--     'dcc174ae-d24c-4dfe-8714-17b2f8933644', 'e0394359-42ca-4747-8ab4-f7b183861ab2',
--     'e8154c33-2ba5-48db-a105-b3f95ad9bb6c', 'fecbb2f9-a28a-4230-87fd-6ba55be13b8e'
-- );
-- Should return 0
--
-- Check for any remaining references:
-- SELECT 'user_organization_roles' as table_name, COUNT(*) as remaining_references
-- FROM user_organization_roles WHERE organization_id IN (
--     -- paste the same ID list here
-- )
-- UNION ALL
-- SELECT 'organization_locations', COUNT(*)
-- FROM organization_locations WHERE organization_id IN (
--     -- paste the same ID list here  
-- );
-- All counts should be 0

-- Storage cleanup note:
-- Organization '41cdd476-06b4-44c9-b45c-49ac54f08b26' has a logo file to clean up separately.
-- You can handle this through the Supabase dashboard Storage section or with a separate script.
