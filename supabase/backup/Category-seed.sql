

-- Insert 'Safety' and its subcategories
WITH safety_category AS (
  INSERT INTO categories (translations)
  VALUES ('{"en": "Safety", "fi": "Turvallisuus"}')
  RETURNING id
)
INSERT INTO categories (parent_id, translations)
VALUES
  ((SELECT id FROM safety_category), '{"en": "First Aid", "fi": "Ensiapu"}'),
  ((SELECT id FROM safety_category), '{"en": "Traffic Management", "fi": "Liikenteenohjaus"}'),
  ((SELECT id FROM safety_category), '{"en": "Fire Safety", "fi": "Paloturvallisuus"}'),
  ((SELECT id FROM safety_category), '{"en": "Security Stewards", "fi": "Järjestyksenvalvojat"}');

-- Insert 'Technology' and its subcategories
WITH technology_category AS (
  INSERT INTO categories (translations)
  VALUES ('{"en": "Technology", "fi": "Teknologia"}')
  RETURNING id
)
INSERT INTO categories (parent_id, translations)
VALUES
  ((SELECT id FROM technology_category), '{"en": "Computers", "fi": "Tietokoneet"}'),
  ((SELECT id FROM technology_category), '{"en": "A/V", "fi": "Audio/Video"}'),
  ((SELECT id FROM technology_category), '{"en": "Recording", "fi": "Tallennus"}'),
  ((SELECT id FROM technology_category), '{"en": "Lights", "fi": "Valot"}'),
  ((SELECT id FROM technology_category), '{"en": "Radios", "fi": "Radiot"}'),
  ((SELECT id FROM technology_category), '{"en": "Internet", "fi": "Internet"}');

-- Insert other top-level categories
INSERT INTO categories (translations)
VALUES
  ('{"en": "Containers", "fi": "Säiliöt"}'),
  ('{"en": "Tools", "fi": "Työkalut"}');



-- Tools
UPDATE storage_items
SET category_id = (SELECT id FROM categories WHERE translations->>'en' = 'Tools')
WHERE id = '13e94e49-72a4-4521-b9c8-2ec57d44d159';

-- First Aid
UPDATE storage_items
SET category_id = (SELECT id FROM categories WHERE translations->>'en' = 'First Aid')
WHERE id = '22f82e0c-5f66-4678-b12d-324af534f785';

-- Fire Safety
UPDATE storage_items
SET category_id = (SELECT id FROM categories WHERE translations->>'en' = 'Fire Safety')
WHERE id = 'b7fbc4b8-f9e5-43ae-9965-1c70a4189301';

-- Containers
UPDATE storage_items
SET category_id = (SELECT id FROM categories WHERE translations->>'en' = 'Containers')
WHERE id = 'b2d72337-8594-45d5-9e0b-a764a6fac7f9';

-- Technology → Computers (for consoles)
UPDATE storage_items
SET category_id = (
  SELECT id FROM categories WHERE translations->>'en' = 'Computers'
)
WHERE id IN (
  '90c2b991-0b0b-4f56-8d42-f250ebabbb10',
  'e22019a0-a28f-4081-8af7-2d816101f43c'
);
