-- Test Branch Migration: Supabase Changes
-- This migration contains experimental changes for testing
-- Date: 2025-06-26

-- ============================================
-- 1. ADD NEW TEST TABLE
-- ============================================

-- Create a test table for new features
CREATE TABLE IF NOT EXISTS "public"."test_features" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    "feature_name" varchar(255) NOT NULL,
    "description" text,
    "is_enabled" boolean DEFAULT false,
    "test_data" jsonb,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "test_features_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- 2. ADD NEW COLUMNS TO EXISTING TABLES
-- ============================================

-- Add test columns to storage_items for analytics
ALTER TABLE "public"."storage_items" 
ADD COLUMN IF NOT EXISTS "test_priority_score" numeric DEFAULT 0;

ALTER TABLE "public"."storage_items" 
ADD COLUMN IF NOT EXISTS "test_metadata" jsonb DEFAULT '{}';

-- ============================================
-- 3. CREATE TEST INDEXES
-- ============================================

-- Index for better performance on test features
CREATE INDEX IF NOT EXISTS "test_features_feature_name_idx" 
ON "public"."test_features" ("feature_name");

-- Index for test metadata search
CREATE INDEX IF NOT EXISTS "storage_items_test_metadata_idx" 
ON "public"."storage_items" USING gin ("test_metadata");

-- ============================================
-- 4. CREATE TEST FUNCTIONS
-- ============================================

-- Function to calculate test metrics
CREATE OR REPLACE FUNCTION "public"."calculate_test_metrics"(item_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    -- Calculate test metrics for storage items
    SELECT jsonb_build_object(
        'total_bookings', COUNT(oi.id),
        'avg_rating', COALESCE(AVG(r.rating), 0),
        'last_booking', MAX(oi.created_at),
        'test_score', RANDOM() * 100  -- Random test score
    ) INTO result
    FROM storage_items si
    LEFT JOIN order_items oi ON si.id = oi.item_id
    LEFT JOIN reviews r ON si.id = r.item_id
    WHERE si.id = item_id;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- ============================================
-- 5. CREATE TEST TRIGGER
-- ============================================

-- Trigger function to update test metadata
CREATE OR REPLACE FUNCTION "public"."update_test_metadata"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update test metadata when storage item is modified
    IF TG_OP = 'UPDATE' THEN
        NEW.test_metadata = NEW.test_metadata || jsonb_build_object(
            'last_modified', now(),
            'test_flag', true,
            'version', COALESCE((OLD.test_metadata->>'version')::int, 0) + 1
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS "test_metadata_trigger" ON "public"."storage_items";
CREATE TRIGGER "test_metadata_trigger"
    BEFORE UPDATE ON "public"."storage_items"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_test_metadata"();

-- ============================================
-- 6. INSERT TEST DATA
-- ============================================

-- Insert some test feature flags
INSERT INTO "public"."test_features" ("feature_name", "description", "is_enabled", "test_data")
VALUES 
    ('advanced_search', 'Advanced search functionality with filters', true, '{"version": "1.0", "beta": true}'),
    ('ai_recommendations', 'AI-powered storage recommendations', false, '{"model": "gpt-4", "confidence": 0.85}'),
    ('dynamic_pricing', 'Dynamic pricing based on demand', false, '{"algorithm": "surge", "max_multiplier": 2.0}'),
    ('mobile_app_sync', 'Real-time sync with mobile app', true, '{"protocol": "websocket", "version": "2.1"}')
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. CREATE TEST VIEW
-- ============================================

-- View for test analytics
CREATE OR REPLACE VIEW "public"."test_analytics_view" AS
SELECT 
    sl.id as location_id,
    sl.name as location_name,
    COUNT(si.id) as total_items,
    COUNT(CASE WHEN si.test_priority_score > 50 THEN 1 END) as high_priority_items,
    AVG(si.test_priority_score) as avg_priority_score,
    COUNT(tf.id) as enabled_features
FROM storage_locations sl
LEFT JOIN storage_items si ON sl.id = si.location_id
CROSS JOIN test_features tf
WHERE tf.is_enabled = true
GROUP BY sl.id, sl.name;

-- ============================================
-- 8. ADD ROW LEVEL SECURITY FOR TEST TABLE
-- ============================================

-- Enable RLS on test table
ALTER TABLE "public"."test_features" ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read test features
CREATE POLICY "Allow authenticated users to read test features"
ON "public"."test_features"
FOR SELECT
TO authenticated
USING (true);

-- Policy for admins to manage test features
CREATE POLICY "Allow admins to manage test features"
ON "public"."test_features"
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.id = auth.uid()
        AND up.role IN ('admin', 'superVera')
    )
);

-- ============================================
-- ROLLBACK INSTRUCTIONS
-- ============================================

-- To rollback these changes, create a new migration with:
/*
-- Remove test table
DROP TABLE IF EXISTS "public"."test_features" CASCADE;

-- Remove test columns
ALTER TABLE "public"."storage_items" DROP COLUMN IF EXISTS "test_priority_score";
ALTER TABLE "public"."storage_items" DROP COLUMN IF EXISTS "test_metadata";

-- Remove test functions
DROP FUNCTION IF EXISTS "public"."calculate_test_metrics"(uuid);
DROP FUNCTION IF EXISTS "public"."update_test_metadata"();

-- Remove test view
DROP VIEW IF EXISTS "public"."test_analytics_view";
*/