-- ==========================================================================
-- ENABLE RLS ON APP-SCOPED TABLES FOR BAN ENFORCEMENT
-- ==========================================================================
-- Purpose: Enable RLS on tables that have restrictive ban policies but missing RLS
-- Tables: bookings, categories, tags, user_addresses
-- Note: I enabled these because I dont have the right migrations in my branch and
-- needed to test ban policies end-to-end.
-- To test run:
--          supabase test db
-- ==========================================================================

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings FORCE ROW LEVEL SECURITY;

-- Add permissive SELECT policy for authenticated users on bookings
CREATE POLICY "Authenticated can read bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (true);

-- Enable RLS on categories  
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;

-- Add permissive SELECT policy for authenticated users on categories
CREATE POLICY "Authenticated can read categories"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Enable RLS on tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags FORCE ROW LEVEL SECURITY;

-- Add permissive SELECT policy for authenticated users on tags
CREATE POLICY "Authenticated can read tags"
  ON public.tags
  FOR SELECT
  TO authenticated
  USING (true);

-- Enable RLS on user_addresses
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses FORCE ROW LEVEL SECURITY;

-- Add permissive SELECT policy for authenticated users on user_addresses
CREATE POLICY "Authenticated can read user_addresses"
  ON public.user_addresses
  FOR SELECT
  TO authenticated
  USING (true);
