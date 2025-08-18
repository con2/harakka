-- Remove price column from storage_items table
-- First drop the dependent view
DROP VIEW IF EXISTS view_manage_storage_items;

-- Drop the price column
ALTER TABLE storage_items DROP COLUMN IF EXISTS price;

-- Recreate the view without the price column
CREATE OR REPLACE VIEW view_manage_storage_items AS
SELECT 
    si.id,
    si.average_rating,
    si.compartment_id,
    si.created_at,
    si.is_active,
    si.is_deleted,
    si.items_number_currently_in_storage,
    si.items_number_total,
    si.location_id,
    si.org_id,
    si.translations,
    sl.name as location_name,
    sl.address as location_address,
    o.name as organization_name
FROM storage_items si
LEFT JOIN storage_locations sl ON si.location_id = sl.id
LEFT JOIN organizations o ON si.org_id = o.id;
