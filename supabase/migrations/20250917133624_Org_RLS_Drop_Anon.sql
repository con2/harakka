DROP POLICY IF EXISTS "Anonymous users cannot access user organization roles" ON public.user_organization_roles;

CREATE POLICY "Annonymous users can access user organization roles"
  ON public.user_organization_roles
  FOR ALL 
  TO anon
  USING (true);