-- Fix categories migration - schema only, no seed data
-- This replaces 20250902083305_add_categories_table.sql but with only schema changes

CREATE TABLE IF NOT EXISTS categories (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id uuid REFERENCES categories (id) ON DELETE SET NULL,
    translations jsonb NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Add category_id column to storage_items if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='storage_items' 
        AND column_name='category_id'
    ) THEN
        ALTER TABLE storage_items
        ADD COLUMN category_id uuid REFERENCES categories(id);
    END IF;
END $$;

-- Recreate the view with category_id
DROP VIEW IF EXISTS view_manage_storage_items;

CREATE VIEW public.view_manage_storage_items AS
SELECT
  (s.translations -> 'fi'::text) ->> 'item_name'::text as fi_item_name,
  (s.translations -> 'fi'::text) ->> 'item_type'::text as fi_item_type,
  (s.translations -> 'en'::text) ->> 'item_name'::text as en_item_name,
  (s.translations -> 'en'::text) ->> 'item_type'::text as en_item_type,
  s.translations,
  s.id,
  s.quantity,
  s.created_at,
  s.is_active,
  s.location_id,
  l.name as location_name,
  array_agg(distinct t.tag_id) as tag_ids,
  array_agg(distinct g.translations) as tag_translations,
  s.available_quantity,
  s.is_deleted,
  s.org_id as organization_id,
  s.category_id
FROM
  storage_items s
  JOIN storage_locations l on s.location_id = l.id
  LEFT JOIN storage_item_tags t on s.id = t.item_id
  LEFT JOIN tags g on t.tag_id = g.id
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
  s.org_id,
  s.category_id;
