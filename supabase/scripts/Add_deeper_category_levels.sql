-- Add deeper category levels to demonstrate multi-level tree rendering
-- Technology -> Computers -> (Laptops, Desktops)
WITH parent AS (
  SELECT id FROM categories WHERE translations->>'en' = 'Computers' LIMIT 1
)
INSERT INTO categories (parent_id, translations)
SELECT id, '{"en":"Laptops","fi":"Kannettavat"}'::jsonb FROM parent
UNION ALL
SELECT id, '{"en":"Desktops","fi":"Pöytäkoneet"}'::jsonb FROM parent;

-- Add a third level: Technology -> Computers -> Laptops -> (Ultrabooks)
WITH parent AS (
  SELECT id FROM categories WHERE translations->>'en' = 'Laptops' LIMIT 1
)
INSERT INTO categories (parent_id, translations)
SELECT id, '{"en":"Ultrabooks","fi":"Ultrabookit"}'::jsonb FROM parent;

-- Safety -> First Aid -> (Bandages, Kits)
WITH parent AS (
  SELECT id FROM categories WHERE translations->>'en' = 'First Aid' LIMIT 1
)
INSERT INTO categories (parent_id, translations)
SELECT id, '{"en":"Bandages","fi":"Sidetarpeet"}'::jsonb FROM parent
UNION ALL
SELECT id, '{"en":"Kits","fi":"Ensiapupakkaukset"}'::jsonb FROM parent;

-- Seed items for deeper categories so UI filtering has real data
-- Targets categories created in above

-- Resolve a usable org and location
WITH
-- Ensure at least one location exists
loc_existing AS (
  SELECT id FROM public.storage_locations LIMIT 1
),
loc_create AS (
  INSERT INTO public.storage_locations (id, name, description, address, is_active, created_at)
  SELECT gen_random_uuid(), 'Seed Location', 'Autocreated for deep-category seed', 'N/A', true, now()
  WHERE NOT EXISTS (SELECT 1 FROM public.storage_locations)
  RETURNING id
),
loc_pick AS (
  SELECT id FROM loc_existing
  UNION ALL
  SELECT id FROM loc_create
  LIMIT 1
),
org_pick AS (
  SELECT COALESCE(
    (SELECT org_id FROM public.storage_items WHERE org_id IS NOT NULL LIMIT 1),
    (SELECT organization_id FROM public.organization_locations LIMIT 1)
  ) AS id
),
-- Category lookups
cat_ultrabooks AS (
  SELECT id FROM public.categories WHERE translations->>'en' = 'Ultrabooks' LIMIT 1
),
cat_laptops AS (
  SELECT id FROM public.categories WHERE translations->>'en' = 'Laptops' LIMIT 1
),
cat_desktops AS (
  SELECT id FROM public.categories WHERE translations->>'en' = 'Desktops' LIMIT 1
),
cat_bandages AS (
  SELECT id FROM public.categories WHERE translations->>'en' = 'Bandages' LIMIT 1
),
cat_kits AS (
  SELECT id FROM public.categories WHERE translations->>'en' = 'Kits' LIMIT 1
)
INSERT INTO public.storage_items (
  id,
  location_id,
  org_id,
  quantity,
  available_quantity,
  is_active,
  created_at,
  translations,
  category_id
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM loc_pick),
  (SELECT id FROM org_pick),
  10,
  10,
  true,
  now(),
  '{"en": {"item_name": "Ultrabook Pro 14", "item_type": "Laptop", "item_description": "Lightweight 14-inch ultrabook"}, "fi": {"item_name": "Ultrabook Pro 14", "item_type": "Kannettava", "item_description": "Kevyt 14-tuumainen ultrabook"}}'::jsonb,
  (SELECT id FROM cat_ultrabooks)
UNION ALL
SELECT
  gen_random_uuid(),
  (SELECT id FROM loc_pick),
  (SELECT id FROM org_pick),
  12,
  11,
  true,
  now(),
  '{"en": {"item_name": "Gaming Laptop Phoenix", "item_type": "Laptop", "item_description": "15-inch performance laptop"}, "fi": {"item_name": "Pelikannettava Phoenix", "item_type": "Kannettava", "item_description": "15-tuumainen tehokannettava"}}'::jsonb,
  (SELECT id FROM cat_laptops)
UNION ALL
SELECT
  gen_random_uuid(),
  (SELECT id FROM loc_pick),
  (SELECT id FROM org_pick),
  8,
  8,
  true,
  now(),
  '{"en": {"item_name": "Desktop Workstation Z", "item_type": "Desktop", "item_description": "High-power workstation"}, "fi": {"item_name": "Työasema Z", "item_type": "Pöytäkone", "item_description": "Korkean suorituskyvyn työasema"}}'::jsonb,
  (SELECT id FROM cat_desktops)
UNION ALL
SELECT
  gen_random_uuid(),
  (SELECT id FROM loc_pick),
  (SELECT id FROM org_pick),
  40,
  40,
  true,
  now(),
  '{"en": {"item_name": "Elastic Bandage Pack", "item_type": "First Aid", "item_description": "Assorted elastic bandages"}, "fi": {"item_name": "Sidetarvikepakkaus", "item_type": "Ensiapu", "item_description": "Sekalaisia joustositeitä"}}'::jsonb,
  (SELECT id FROM cat_bandages)
UNION ALL
SELECT
  gen_random_uuid(),
  (SELECT id FROM loc_pick),
  (SELECT id FROM org_pick),
  25,
  24,
  true,
  now(),
  '{"en": {"item_name": "First Aid Kit Deluxe", "item_type": "First Aid", "item_description": "Comprehensive first aid kit"}, "fi": {"item_name": "Ensiapulaukku Deluxe", "item_type": "Ensiapu", "item_description": "Kattava ensiapulaukku"}}'::jsonb,
  (SELECT id FROM cat_kits);
