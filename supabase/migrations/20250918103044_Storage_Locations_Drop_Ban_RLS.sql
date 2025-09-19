-- This migration drops the RLS policies related to ban enforcement on the storage_locations table.
DROP POLICY IF EXISTS "Ban Enforcement Org Storage Locations (delete)" ON public.storage_locations;
DROP POLICY IF EXISTS "Ban Enforcement Org Storage Locations (update)" ON public.storage_locations;
DROP POLICY IF EXISTS "Ban Enforcement Org Storage Locations (insert)" ON public.storage_locations;