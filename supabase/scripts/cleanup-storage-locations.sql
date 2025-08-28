-- Reusable Storage Locations Cleanup Script
-- Compatible with Supabase SQL Editor
--
-- INSTRUCTIONS: 
-- 1. Replace the IDs in the test_location_ids array below with your target IDs
-- 2. Copy and paste this entire script into your Supabase SQL Editor
-- 3. Run the script

BEGIN;

-- ============================================================================
-- CONFIGURATION: Add your storage location IDs here (ONLY PLACE TO EDIT)
-- ============================================================================
DO $$
DECLARE
    test_location_ids UUID[] := ARRAY[
        '176c8e1a-6375-4e61-9433-4d4302631402',  -- test abc
        '1f63fe51-7a6f-429a-a61b-18cc5a80c3e9',  -- Test 345  
        '7e742e46-679f-4108-9b4d-dd4f725753d8',  -- Test Location
        '98d91787-acee-435e-9b6e-83919f889dac',  -- erthrfjgk
        'c868a66d-5ea0-4666-84c1-9c752d08b1be'   -- Not a city
    ];
    deleted_count INTEGER;
BEGIN
    -- Step 1: Delete organization_locations (main foreign key blocker)
    DELETE FROM organization_locations WHERE storage_location_id = ANY(test_location_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % organization_locations records', deleted_count;
    
    -- Step 2: Delete storage_working_hours
    DELETE FROM storage_working_hours WHERE location_id = ANY(test_location_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % storage_working_hours records', deleted_count;
    
    -- Step 3: Delete storage_images
    DELETE FROM storage_images WHERE location_id = ANY(test_location_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % storage_images records', deleted_count;
    
    -- Step 4: Delete storage_analytics
    DELETE FROM storage_analytics WHERE location_id = ANY(test_location_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % storage_analytics records', deleted_count;
    
    -- Step 5: Handle storage_items (set location_id to NULL to preserve items)
    UPDATE storage_items SET location_id = NULL WHERE location_id = ANY(test_location_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Updated % storage_items (set location_id to NULL)', deleted_count;
    
    -- Alternative Step 5: Uncomment below to DELETE storage_items instead
    -- DELETE FROM storage_items WHERE location_id = ANY(test_location_ids);
    -- GET DIAGNOSTICS deleted_count = ROW_COUNT;
    -- RAISE NOTICE 'Deleted % storage_items records', deleted_count;
    
    -- Step 6: Finally, delete the storage locations
    DELETE FROM storage_locations WHERE id = ANY(test_location_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % storage_locations', deleted_count;
    
    -- Final verification
    SELECT COUNT(*) INTO deleted_count FROM storage_locations WHERE id = ANY(test_location_ids);
    IF deleted_count > 0 THEN
        RAISE EXCEPTION 'Cleanup failed: % storage locations still exist', deleted_count;
    END IF;
    
    RAISE NOTICE 'Successfully cleaned up % storage locations', array_length(test_location_ids, 1);
END $$;

COMMIT;

-- ============================================================================
-- ALTERNATIVE VERSION: Simple SQL (no PL/pgSQL) for Supabase SQL Editor
-- ============================================================================
-- If the above doesn't work in Supabase SQL Editor, use this version:
--
-- Step 1: Delete organization_locations
-- DELETE FROM organization_locations WHERE storage_location_id IN (
--     '176c8e1a-6375-4e61-9433-4d4302631402',
--     '1f63fe51-7a6f-429a-a61b-18cc5a80c3e9',
--     '7e742e46-679f-4108-9b4d-dd4f725753d8', 
--     '98d91787-acee-435e-9b6e-83919f889dac',
--     'c868a66d-5ea0-4666-84c1-9c752d08b1be'
-- );
--
-- Step 2: Delete storage_working_hours  
-- DELETE FROM storage_working_hours WHERE location_id IN (
--     '176c8e1a-6375-4e61-9433-4d4302631402',
--     '1f63fe51-7a6f-429a-a61b-18cc5a80c3e9',
--     '7e742e46-679f-4108-9b4d-dd4f725753d8',
--     '98d91787-acee-435e-9b6e-83919f889dac', 
--     'c868a66d-5ea0-4666-84c1-9c752d08b1be'
-- );
--
-- Step 3: Delete storage_images
-- DELETE FROM storage_images WHERE location_id IN (
--     '176c8e1a-6375-4e61-9433-4d4302631402',
--     '1f63fe51-7a6f-429a-a61b-18cc5a80c3e9',
--     '7e742e46-679f-4108-9b4d-dd4f725753d8',
--     '98d91787-acee-435e-9b6e-83919f889dac',
--     'c868a66d-5ea0-4666-84c1-9c752d08b1be'
-- );
--
-- Step 4: Delete storage_analytics
-- DELETE FROM storage_analytics WHERE location_id IN (
--     '176c8e1a-6375-4e61-9433-4d4302631402',
--     '1f63fe51-7a6f-429a-a61b-18cc5a80c3e9',
--     '7e742e46-679f-4108-9b4d-dd4f725753d8',
--     '98d91787-acee-435e-9b6e-83919f889dac',
--     'c868a66d-5ea0-4666-84c1-9c752d08b1be'
-- );
--
-- Step 5: Update storage_items (preserves items)
-- UPDATE storage_items SET location_id = NULL WHERE location_id IN (
--     '176c8e1a-6375-4e61-9433-4d4302631402',
--     '1f63fe51-7a6f-429a-a61b-18cc5a80c3e9',
--     '7e742e46-679f-4108-9b4d-dd4f725753d8',
--     '98d91787-acee-435e-9b6e-83919f889dac',
--     'c868a66d-5ea0-4666-84c1-9c752d08b1be'
-- );
--
-- Step 6: Delete storage_locations
-- DELETE FROM storage_locations WHERE id IN (
--     '176c8e1a-6375-4e61-9433-4d4302631402',
--     '1f63fe51-7a6f-429a-a61b-18cc5a80c3e9', 
--     '7e742e46-679f-4108-9b4d-dd4f725753d8',
--     '98d91787-acee-435e-9b6e-83919f889dac',
--     'c868a66d-5ea0-4666-84c1-9c752d08b1be'
-- );
