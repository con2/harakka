-- Migration to rename items_number_total to quantity in storage_items table
-- This migration handles all dependent views and functions

-- Step 1: Drop dependent views
DROP VIEW IF EXISTS public.view_item_location_summary CASCADE;
DROP VIEW IF EXISTS public.view_item_ownership_summary CASCADE;
DROP VIEW IF EXISTS public.view_manage_storage_items CASCADE;

-- Step 2: Drop or modify the function that uses the column
-- Drop the function (no trigger exists for this function)
DROP FUNCTION IF EXISTS public.update_storage_item_totals() CASCADE;

-- Step 3: Rename the column
ALTER TABLE public.storage_items 
RENAME COLUMN items_number_total TO quantity;

-- Step 4: Recreate the function with the new column name
CREATE OR REPLACE FUNCTION public.update_storage_item_totals()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.storage_items
    SET quantity = calculate_storage_item_total(NEW.storage_item_id)
    WHERE id = NEW.storage_item_id;
  END IF;

  -- Handle DELETE and UPDATE (when storage_item_id changes)
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.storage_item_id != NEW.storage_item_id) THEN
    UPDATE public.storage_items
    SET quantity = calculate_storage_item_total(OLD.storage_item_id)
    WHERE id = OLD.storage_item_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Step 5: Recreate view_item_location_summary with new column name
CREATE OR REPLACE VIEW public.view_item_location_summary AS
SELECT 
    si.id AS storage_item_id,
    ((si.translations -> 'en'::text) ->> 'item_name'::text) AS item_name,
    sl.name AS location_name,
    si.quantity AS total_at_location,
    1 AS organizations_count,
    'Total items'::text AS organization_breakdown
FROM storage_items si
CROSS JOIN storage_locations sl
WHERE si.quantity > 0::numeric
ORDER BY ((si.translations -> 'en'::text) ->> 'item_name'::text), sl.name;

-- Step 6: Recreate view_item_ownership_summary with new column name
CREATE OR REPLACE VIEW public.view_item_ownership_summary AS
SELECT 
    si.id AS storage_item_id,
    ((si.translations -> 'en'::text) ->> 'item_name'::text) AS item_name,
    sl.name AS location_name,
    'System'::text AS organization_name,
    si.quantity AS owned_quantity,
    si.quantity AS total_across_all_locations,
    si.quantity AS location_total
FROM storage_items si
CROSS JOIN storage_locations sl
WHERE si.quantity > 0::numeric
ORDER BY ((si.translations -> 'en'::text) ->> 'item_name'::text), sl.name;

-- Step 7: Recreate view_manage_storage_items with new column name
CREATE OR REPLACE VIEW public.view_manage_storage_items AS
SELECT 
    ((s.translations -> 'fi'::text) ->> 'item_name'::text) AS fi_item_name,
    ((s.translations -> 'fi'::text) ->> 'item_type'::text) AS fi_item_type,
    ((s.translations -> 'en'::text) ->> 'item_name'::text) AS en_item_name,
    ((s.translations -> 'en'::text) ->> 'item_type'::text) AS en_item_type,
    s.translations,
    s.id,
    s.quantity AS items_number_total,
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
GROUP BY 
    s.id,
    s.translations,
    s.quantity,
    s.created_at,
    s.is_active,
    s.location_id,
    l.name,
    s.items_number_currently_in_storage,
    s.is_deleted,
    s.org_id;

-- Step 8: Grant necessary permissions on the recreated views
GRANT ALL ON TABLE public.view_item_location_summary TO anon;
GRANT ALL ON TABLE public.view_item_location_summary TO authenticated;
GRANT ALL ON TABLE public.view_item_location_summary TO service_role;

GRANT ALL ON TABLE public.view_item_ownership_summary TO anon;
GRANT ALL ON TABLE public.view_item_ownership_summary TO authenticated;
GRANT ALL ON TABLE public.view_item_ownership_summary TO service_role;

GRANT ALL ON TABLE public.view_manage_storage_items TO anon;
GRANT ALL ON TABLE public.view_manage_storage_items TO authenticated;
GRANT ALL ON TABLE public.view_manage_storage_items TO service_role;
