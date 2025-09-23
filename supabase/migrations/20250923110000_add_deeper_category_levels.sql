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

