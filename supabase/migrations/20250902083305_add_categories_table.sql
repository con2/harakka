CREATE TABLE categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id uuid REFERENCES categories (id),
  name VARCHAR(50) NOT NULL
);

-- Insert 'Safety' and its subcategories
WITH safety_category AS (
  INSERT INTO categories (name)
  VALUES ('Safety')
  RETURNING id
)
INSERT INTO categories (parent_id, name)
VALUES
  ((SELECT id FROM safety_category), 'First Aid'),
  ((SELECT id FROM safety_category), 'Traffic Management'),
  ((SELECT id FROM safety_category), 'Fire Safety'),
  ((SELECT id FROM safety_category), 'Security Stewards');

-- Insert 'Technology' and its subcategories
WITH technology_category AS (
  INSERT INTO categories (name)
  VALUES ('Technology')
  RETURNING id
)
INSERT INTO categories (parent_id, name)
VALUES
  ((SELECT id FROM technology_category), 'Computers'),
  ((SELECT id FROM technology_category), 'A/V'),
  ((SELECT id FROM technology_category), 'Recording'),
  ((SELECT id FROM technology_category), 'Lights'),
  ((SELECT id FROM technology_category), 'Radios'),
  ((SELECT id FROM technology_category), 'Internet');

-- Insert other top-level categories
INSERT INTO categories (name)
VALUES
  ('Containers'),
  ('Tools');


ALTER TABLE storage_items
ADD COLUMN category_id uuid REFERENCES categories(id);

drop view if exists view_manage_storage_items;

create view public.view_manage_storage_items as
select
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
from
  storage_items s
  join storage_locations l on s.location_id = l.id
  left join storage_item_tags t on s.id = t.item_id
  left join tags g on t.tag_id = g.id
group by
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