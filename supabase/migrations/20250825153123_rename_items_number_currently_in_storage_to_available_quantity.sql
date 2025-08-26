-- Rename the column
ALTER TABLE storage_items
RENAME COLUMN items_number_currently_in_storage TO available_quantity;

-- Drop the old view if it exists
DROP VIEW IF EXISTS public.view_manage_storage_items;

-- Recreate the view with the updated column name
CREATE VIEW public.view_manage_storage_items AS
SELECT
  (s.translations -> 'fi'::text) ->> 'item_name'::text AS fi_item_name,
  (s.translations -> 'fi'::text) ->> 'item_type'::text AS fi_item_type,
  (s.translations -> 'en'::text) ->> 'item_name'::text AS en_item_name,
  (s.translations -> 'en'::text) ->> 'item_type'::text AS en_item_type,
  s.translations,
  s.id,
  s.quantity,
  s.created_at,
  s.is_active,
  s.location_id,
  l.name AS location_name,
  array_agg(DISTINCT t.tag_id) AS tag_ids,
  array_agg(DISTINCT g.translations) AS tag_translations,
  s.available_quantity,
  s.is_deleted,
  s.org_id AS organization_id
FROM
  storage_items s
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
  s.available_quantity,
  s.is_deleted,
  s.org_id;