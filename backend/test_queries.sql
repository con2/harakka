-- Test Branch Queries
-- Use these queries to test the new features added in the test branch

-- ============================================
-- 1. TEST FEATURE FLAGS
-- ============================================

-- View all test features
SELECT * FROM test_features ORDER BY created_at;

-- Check enabled features
SELECT feature_name, description 
FROM test_features 
WHERE is_enabled = true;

-- Update a feature flag
UPDATE test_features 
SET is_enabled = true, 
    test_data = test_data || '{"last_enabled": "2025-06-26"}'
WHERE feature_name = 'ai_recommendations';

-- ============================================
-- 2. TEST STORAGE ITEMS WITH NEW COLUMNS
-- ============================================

-- View storage items with test columns
SELECT 
    id,
    translations->>'name' as item_name,
    test_priority_score,
    test_metadata,
    items_number_available,
    price
FROM storage_items 
WHERE test_priority_score IS NOT NULL
LIMIT 10;

-- Update test priority scores
UPDATE storage_items 
SET test_priority_score = RANDOM() * 100,
    test_metadata = jsonb_build_object(
        'test_updated', now(),
        'algorithm_version', '1.0',
        'confidence', RANDOM()
    )
WHERE id IN (
    SELECT id FROM storage_items LIMIT 5
);

-- ============================================
-- 3. TEST NEW FUNCTIONS
-- ============================================

-- Test the calculate_test_metrics function
SELECT 
    si.id,
    si.translations->>'name' as item_name,
    calculate_test_metrics(si.id) as metrics
FROM storage_items si
LIMIT 5;

-- ============================================
-- 4. TEST ANALYTICS VIEW
-- ============================================

-- View test analytics
SELECT * FROM test_analytics_view;

-- Get analytics for specific location
SELECT 
    location_name,
    total_items,
    high_priority_items,
    ROUND(avg_priority_score, 2) as avg_score,
    enabled_features
FROM test_analytics_view
WHERE location_name ILIKE '%storage%';

-- ============================================
-- 5. TEST TRIGGER FUNCTIONALITY
-- ============================================

-- Update a storage item to trigger the test metadata update
UPDATE storage_items 
SET price = price + 1
WHERE id = (SELECT id FROM storage_items LIMIT 1);

-- Check if test metadata was updated
SELECT 
    id,
    translations->>'name' as item_name,
    test_metadata
FROM storage_items 
WHERE test_metadata->>'test_flag' = 'true'
LIMIT 5;

-- ============================================
-- 6. TEST SEARCH FUNCTIONALITY
-- ============================================

-- Search test metadata using GIN index
SELECT 
    id,
    translations->>'name' as item_name,
    test_metadata
FROM storage_items 
WHERE test_metadata @> '{"test_flag": true}';

-- Search by test priority score
SELECT 
    id,
    translations->>'name' as item_name,
    test_priority_score,
    CASE 
        WHEN test_priority_score >= 80 THEN 'High'
        WHEN test_priority_score >= 50 THEN 'Medium'
        ELSE 'Low'
    END as priority_level
FROM storage_items 
WHERE test_priority_score > 70
ORDER BY test_priority_score DESC;

-- ============================================
-- 7. TEST PERFORMANCE QUERIES
-- ============================================

-- Test index performance on test_features
EXPLAIN ANALYZE 
SELECT * FROM test_features 
WHERE feature_name = 'advanced_search';

-- Test GIN index performance on test_metadata
EXPLAIN ANALYZE 
SELECT * FROM storage_items 
WHERE test_metadata @> '{"algorithm_version": "1.0"}';

-- ============================================
-- 8. TEST DATA INTEGRITY
-- ============================================

-- Verify foreign key constraints still work
SELECT 
    sl.name as location,
    COUNT(si.id) as items_count,
    COUNT(CASE WHEN si.test_priority_score > 50 THEN 1 END) as high_priority
FROM storage_locations sl
LEFT JOIN storage_items si ON sl.id = si.location_id
GROUP BY sl.id, sl.name
ORDER BY items_count DESC;

-- Check for any null test_metadata (should be empty due to DEFAULT)
SELECT COUNT(*) as null_metadata_count
FROM storage_items 
WHERE test_metadata IS NULL;

-- ============================================
-- 9. TEST ROW LEVEL SECURITY
-- ============================================

-- Test if policies work (run as different user roles)
-- This should work for authenticated users
SELECT feature_name, is_enabled 
FROM test_features 
WHERE is_enabled = true;

-- ============================================
-- 10. CLEANUP TEST DATA (if needed)
-- ============================================

-- Reset test priority scores
-- UPDATE storage_items SET test_priority_score = 0;

-- Clear test metadata
-- UPDATE storage_items SET test_metadata = '{}';

-- Disable all test features
-- UPDATE test_features SET is_enabled = false;
