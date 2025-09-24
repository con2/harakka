-- Safely remove reviews table and related database objects
-- Order: trigger -> index -> table -> function

-- 1) Drop trigger if it exists (uses function calculate_average_rating)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'update_average_rating_trigger'
      AND n.nspname = 'public'
      AND c.relname = 'reviews'
  ) THEN
    EXECUTE 'DROP TRIGGER IF EXISTS update_average_rating_trigger ON public.reviews';
  END IF;
END $$;

-- 2) Drop dependent index if present
DROP INDEX IF EXISTS public.idx_reviews_item;

-- 3) Drop the reviews table itself (CASCADE to remove any left-over deps)
DROP TABLE IF EXISTS public.reviews CASCADE;

-- 4) Drop the trigger function if it exists
DROP FUNCTION IF EXISTS public.calculate_average_rating() CASCADE;
