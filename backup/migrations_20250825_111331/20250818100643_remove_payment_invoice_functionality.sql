-- Remove payment and invoice functionality from the database

-- 1. Drop views that depend on payment columns first
DROP VIEW IF EXISTS view_bookings_with_user_info;

-- 2. Remove unit_price and subtotal columns from booking_items table
ALTER TABLE booking_items DROP COLUMN IF EXISTS unit_price;
ALTER TABLE booking_items DROP COLUMN IF EXISTS subtotal;

-- 3. Remove payment-related columns from bookings table
ALTER TABLE bookings DROP COLUMN IF EXISTS payment_details;
ALTER TABLE bookings DROP COLUMN IF EXISTS payment_status;

-- 4. Drop foreign key constraints for invoices and payments tables (if they exist)
-- Note: We need to drop foreign key constraints before dropping the tables

-- Drop foreign key constraints from invoices table
DO $$ 
BEGIN
    -- Drop invoices_order_id_fkey constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'invoices_order_id_fkey' 
        AND table_name = 'invoices'
    ) THEN
        ALTER TABLE invoices DROP CONSTRAINT invoices_order_id_fkey;
    END IF;
    
    -- Drop invoices_user_id_fkey constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'invoices_user_id_fkey' 
        AND table_name = 'invoices'
    ) THEN
        ALTER TABLE invoices DROP CONSTRAINT invoices_user_id_fkey;
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        -- Table doesn't exist, skip
        NULL;
END $$;

-- Drop foreign key constraints from payments table
DO $$ 
BEGIN
    -- Drop payments_booking_id_fkey constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'payments_booking_id_fkey' 
        AND table_name = 'payments'
    ) THEN
        ALTER TABLE payments DROP CONSTRAINT payments_booking_id_fkey;
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        -- Table doesn't exist, skip
        NULL;
END $$;

-- 5. Drop invoices table if it exists
DROP TABLE IF EXISTS invoices;

-- 6. Drop payments table if it exists
DROP TABLE IF EXISTS payments;

-- 7. Recreate view_bookings_with_user_info without payment_status
CREATE VIEW view_bookings_with_user_info AS
SELECT 
    b.*,
    up.full_name,
    up.email,
    TO_CHAR(b.created_at, 'DD.MM.YYYY') as created_at_text,
    COALESCE(b.final_amount::text, '0') as final_amount_text
FROM bookings b
LEFT JOIN user_profiles up ON b.user_id = up.id;

-- 8. Update view_manage_storage_items (remove price column that was already dropped)
DROP VIEW IF EXISTS view_manage_storage_items;
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
