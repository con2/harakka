-- Example: Add a new feature table for storage analytics
-- This demonstrates how to use migrations for branch-like development

-- Add a new table for tracking storage analytics
CREATE TABLE IF NOT EXISTS "public"."storage_analytics" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    "location_id" uuid NOT NULL,
    "date" date NOT NULL,
    "total_bookings" integer DEFAULT 0,
    "total_revenue" numeric DEFAULT 0,
    "occupancy_rate" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "storage_analytics_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "storage_analytics_location_id_fkey" FOREIGN KEY ("location_id") 
        REFERENCES "public"."storage_locations"("id") ON DELETE CASCADE
);

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS "storage_analytics_location_date_idx" 
ON "public"."storage_analytics" ("location_id", "date");

-- Add a trigger for automatic analytics calculation
CREATE OR REPLACE FUNCTION calculate_daily_analytics()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- This would calculate daily analytics
    -- Implementation would go here
    RETURN NEW;
END;
$$;

-- Example of how to rollback this migration if needed
-- To rollback, create another migration with:
-- DROP TABLE IF EXISTS "public"."storage_analytics";
-- DROP FUNCTION IF EXISTS calculate_daily_analytics();