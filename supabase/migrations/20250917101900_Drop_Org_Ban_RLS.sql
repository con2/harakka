-- Drop all ban related policies on organizations table

Drop POLICY IF EXISTS "Ban Enforcement Org Organizations (select)" ON public.organizations;
DROP POLICY IF EXISTS "Anonymous users cannot access organizations" ON public.organizations;
DROP POLICY IF EXISTS "Ban Enforcement Org Organizations (mutations)" ON public.organizations;
DROP POLICY IF EXISTS "Ban Enforcement Org Organizations (insert)" ON public.organizations;
DROP POLICY IF EXISTS "Ban Enforcement Org Organizations (update)" ON public.organizations;
DROP POLICY IF EXISTS "Ban Enforcement Org Organizations (delete)" ON public.organizations;
