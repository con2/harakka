-- Roles table RLS: readable by everyone, no writes
-- Context: roles are static (e.g., tenant_admin, storage_manager),
-- so only SELECT should be allowed for client roles.

-- Ensure RLS is enabled
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies (idempotent)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.roles;

-- Read for everyone (anon + authenticated)
CREATE POLICY "Enable read access for all users"
  ON public.roles
  FOR SELECT
  USING (true);

-- Lock down writes at the privilege level for client roles
REVOKE ALL ON TABLE public.roles FROM anon, authenticated;
GRANT SELECT ON TABLE public.roles TO anon, authenticated;

-- Note: service_role bypasses RLS and retains full access for maintenance.
