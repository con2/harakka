-- Force remove payment columns that weren't properly dropped in previous migrations
-- This is a focused migration to ensure columns are actually removed

-- 1. Drop any problematic views first
DROP VIEW IF EXISTS view_bookings_with_user_info CASCADE;
DROP VIEW IF EXISTS view_manage_storage_items CASCADE;

-- 2. Force drop payment columns from bookings table
DO $$
BEGIN
    -- Drop payment_status column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'payment_status'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Dropping payment_status column from bookings table';
        ALTER TABLE bookings DROP COLUMN payment_status CASCADE;
    ELSE
        RAISE NOTICE 'payment_status column does not exist in bookings table';
    END IF;
    
    -- Drop payment_details column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'payment_details'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Dropping payment_details column from bookings table';
        ALTER TABLE bookings DROP COLUMN payment_details CASCADE;
    ELSE
        RAISE NOTICE 'payment_details column does not exist in bookings table';
    END IF;
    
    -- Drop total_amount column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'total_amount'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Dropping total_amount column from bookings table';
        ALTER TABLE bookings DROP COLUMN total_amount CASCADE;
    ELSE
        RAISE NOTICE 'total_amount column does not exist in bookings table';
    END IF;
    
    -- Drop discount_amount column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'discount_amount'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Dropping discount_amount column from bookings table';
        ALTER TABLE bookings DROP COLUMN discount_amount CASCADE;
    ELSE
        RAISE NOTICE 'discount_amount column does not exist in bookings table';
    END IF;
    
    -- Drop discount_code column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'discount_code'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Dropping discount_code column from bookings table';
        ALTER TABLE bookings DROP COLUMN discount_code CASCADE;
    ELSE
        RAISE NOTICE 'discount_code column does not exist in bookings table';
    END IF;
    
    -- Drop final_amount column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'final_amount'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Dropping final_amount column from bookings table';
        ALTER TABLE bookings DROP COLUMN final_amount CASCADE;
    ELSE
        RAISE NOTICE 'final_amount column does not exist in bookings table';
    END IF;
END $$;

-- 3. Force drop payment columns from booking_items table
DO $$
BEGIN
    -- Drop unit_price column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'booking_items' 
        AND column_name = 'unit_price'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Dropping unit_price column from booking_items table';
        ALTER TABLE booking_items DROP COLUMN unit_price CASCADE;
    ELSE
        RAISE NOTICE 'unit_price column does not exist in booking_items table';
    END IF;
    
    -- Drop subtotal column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'booking_items' 
        AND column_name = 'subtotal'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Dropping subtotal column from booking_items table';
        ALTER TABLE booking_items DROP COLUMN subtotal CASCADE;
    ELSE
        RAISE NOTICE 'subtotal column does not exist in booking_items table';
    END IF;
END $$;

-- 4. Force drop price column from storage_items table
DO $$
BEGIN
    -- Drop price column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'storage_items' 
        AND column_name = 'price'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Dropping price column from storage_items table';
        ALTER TABLE storage_items DROP COLUMN price CASCADE;
    ELSE
        RAISE NOTICE 'price column does not exist in storage_items table';
    END IF;
END $$;

-- 5. Drop any remaining payment-related tables
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;

-- 6. Recreate views without payment references
CREATE VIEW view_bookings_with_user_info AS
SELECT 
    b.id,
    b.status,
    b.created_at,
    b.booking_number,
    (b.created_at)::text AS created_at_text,
    u.full_name,
    u.visible_name,
    u.email,
    u.id AS user_id
FROM bookings b
JOIN user_profiles u ON b.user_id = u.id;

CREATE VIEW view_manage_storage_items AS
SELECT 
    (s.translations -> 'fi'::text) ->> 'item_name'::text AS fi_item_name,
    (s.translations -> 'fi'::text) ->> 'item_type'::text AS fi_item_type,
    (s.translations -> 'en'::text) ->> 'item_name'::text AS en_item_name,
    (s.translations -> 'en'::text) ->> 'item_type'::text AS en_item_type,
    s.translations,
    s.id,
    s.items_number_total,
    s.created_at,
    s.is_active,
    s.location_id,
    l.name AS location_name,
    array_agg(DISTINCT t.tag_id) AS tag_ids,
    array_agg(DISTINCT g.translations) AS tag_translations,
    s.items_number_currently_in_storage,
    s.is_deleted,
    s.org_id AS organization_id
FROM storage_items s
JOIN storage_locations l ON s.location_id = l.id
LEFT JOIN storage_item_tags t ON s.id = t.item_id
LEFT JOIN tags g ON t.tag_id = g.id
GROUP BY s.id, s.translations, s.items_number_total, s.created_at, s.is_active, s.location_id, l.name, s.items_number_currently_in_storage, s.is_deleted, s.org_id;

-- 7. Log completion
DO $$
BEGIN
    RAISE NOTICE '=== COLUMN REMOVAL SUMMARY ===';
    RAISE NOTICE 'Successfully attempted to remove all payment-related columns';
    RAISE NOTICE 'From bookings: payment_status, payment_details, total_amount, discount_amount, discount_code, final_amount';
    RAISE NOTICE 'From booking_items: unit_price, subtotal';
    RAISE NOTICE 'From storage_items: price';
    RAISE NOTICE 'Views recreated without payment references';
    RAISE NOTICE '=== END SUMMARY ===';
END $$;
