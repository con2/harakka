-- ===========================================================================
-- ORGANIZATION LOCATIONS - ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================================================
-- This migration creates RLS policies for the organization_locations table
-- which is used extensively in your endpoints but missing RLS policies
-- ===========================================================================

-- Enable RLS on organization_locations table
ALTER TABLE public.organization_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_locations FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- SELECT POLICIES
-- ---------------------------------------------------------------------------

-- Read: everyone (anon + authenticated)
CREATE POLICY "All users can read organization_locations"
  ON public.organization_locations
  FOR SELECT
  USING (true);

-- ---------------------------------------------------------------------------  
-- INSERT POLICIES
-- ---------------------------------------------------------------------------

-- Create: tenant_admin or storage_manager can create ANY new rows (no org restriction)
CREATE POLICY "Org managers can create organization_locations"
  ON public.organization_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    app.me_has_role_anywhere('tenant_admin'::public.roles_type)
    OR app.me_has_role_anywhere('storage_manager'::public.roles_type)
  );

-- ---------------------------------------------------------------------------
-- UPDATE POLICIES  
-- ---------------------------------------------------------------------------

-- Update: tenant_admin or storage_manager only within their own org (super_admin excluded)
CREATE POLICY "Org managers can update organization_locations in their orgs"
  ON public.organization_locations
  FOR UPDATE
  TO authenticated
  USING (
    app.me_has_org_access(
      organization_id, 
      array['tenant_admin','storage_manager']::public.roles_type[]
    )
  )
  WITH CHECK (
    app.me_has_org_access(
      organization_id, 
      array['tenant_admin','storage_manager']::public.roles_type[]
    )
  );

-- ---------------------------------------------------------------------------
-- DELETE POLICIES
-- ---------------------------------------------------------------------------

-- Delete: tenant_admin or storage_manager only within their own org (super_admin excluded)
CREATE POLICY "Org managers can delete organization_locations in their orgs"
  ON public.organization_locations
  FOR DELETE
  TO authenticated
  USING (
    app.me_has_org_access(
      organization_id, 
      array['tenant_admin','storage_manager']::public.roles_type[]
    )
  );
