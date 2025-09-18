-- ============================================================================
-- Categories RLS: allow storage roles anywhere, do not exclude super_admin
-- Also remove ban policy on categories for now (per recent direction).
-- ============================================================================

ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories FORCE ROW LEVEL SECURITY;

-- Drop ban policy
DROP POLICY IF EXISTS "Ban Enforcement App Categories" ON public.categories;

-- Drop existing mutation policies to avoid duplicates
DROP POLICY IF EXISTS "Storage roles can create categories" ON public.categories;
DROP POLICY IF EXISTS "Storage roles can update categories" ON public.categories;
DROP POLICY IF EXISTS "Storage roles can delete categories" ON public.categories;
DROP POLICY IF EXISTS "categories_insert_by_storage_roles" ON public.categories;
DROP POLICY IF EXISTS "categories_update_by_storage_roles" ON public.categories;
DROP POLICY IF EXISTS "categories_delete_by_storage_roles" ON public.categories;

-- INSERT: tenant_admin or storage_manager (any org). Super admin allowed implicitly.
CREATE POLICY "Storage roles can create categories" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (
    app.is_any_tenant_admin() OR app.is_any_storage_manager()
  );

-- UPDATE: tenant_admin or storage_manager (any org). Super admin allowed implicitly.
CREATE POLICY "Storage roles can update categories" ON public.categories
  FOR UPDATE TO authenticated
  USING (
    app.is_any_tenant_admin() OR app.is_any_storage_manager()
  )
  WITH CHECK (
    app.is_any_tenant_admin() OR app.is_any_storage_manager()
  );

-- DELETE: tenant_admin or storage_manager (any org). Super admin allowed implicitly.
CREATE POLICY "Storage roles can delete categories" ON public.categories
  FOR DELETE TO authenticated
  USING (
    app.is_any_tenant_admin() OR app.is_any_storage_manager()
  );

-- Note: Existing SELECT policies (public/authenticated) are left unchanged.

