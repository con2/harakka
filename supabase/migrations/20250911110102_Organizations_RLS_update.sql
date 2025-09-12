-- ==========================================================================
-- ALTER ORGANIZATIONS RLS POLICIES
-- ==========================================================================
-- This migration alters the Row Level Security (RLS) policies for the 
-- `public.organizations` table to allow anonymous users to access organizations.
-- ==========================================================================

-- --------------------------------------------------------------------------
-- STEP 1: Alter SELECT Policy to Allow Anonymous Access
-- --------------------------------------------------------------------------

-- Allow anonymous users to access organizations
create policy "Anonymous users can view organizations"
  on public.organizations
  for select
  to anon
  using (true);