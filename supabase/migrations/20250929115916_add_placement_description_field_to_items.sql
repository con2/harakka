
ALTER TABLE storage_items 
ADD placement_description text;

UPDATE storage_items
SET placement_description = 'N/A'
WHERE placement_description IS NULL;

ALTER TABLE storage_items
ALTER COLUMN placement_description SET NOT NULL;