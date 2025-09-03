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