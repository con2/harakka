ALTER TABLE tags
ADD COLUMN is_popular boolean DEFAULT FALSE;

-- Backfill existing rows with the default (safe even though DEFAULT does it for new inserts only)
UPDATE tags SET is_popular = FALSE WHERE is_popular IS NULL;

-- Enforce NOT NULL constraint
ALTER TABLE tags
ALTER COLUMN is_popular SET NOT NULL;