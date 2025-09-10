ALTER TABLE storage_items
ADD COLUMN category_id uuid REFERENCES categories(id);