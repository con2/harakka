-- ============================================================================
-- Tags RLS: update INSERT/UPDATE/DELETE to use any-role helpers
-- Goal: Removing the NOT super_admin exclusion to allow users with multiple roles
--      roles to do CRUD. Also removing ban policy for now.
-- ============================================================================
-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.tags ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.tags FORCE ROW LEVEL SECURITY;

-- Drop ban policy on tags (requested to remove ban policies for now)
DROP POLICY IF EXISTS "Ban Enforcement App Tags" ON public.tags;

-- Drop existing mutation policies (various names)
DROP POLICY IF EXISTS "Storage roles can create tags" ON public.tags;

DROP POLICY IF EXISTS "Storage roles can update tags" ON public.tags;

DROP POLICY IF EXISTS "Storage roles can delete tags" ON public.tags;

DROP POLICY IF EXISTS "tags_insert_by_storage_roles" ON public.tags;

DROP POLICY IF EXISTS "tags_update_by_storage_roles" ON public.tags;

DROP POLICY IF EXISTS "tags_delete_by_storage_roles" ON public.tags;

-- INSERT: tenant_admin or storage_manager anywhere (Not excluding super_admin)
CREATE POLICY "tags_insert_by_storage_roles" ON public.tags FOR INSERT TO authenticated
WITH
    CHECK (
        (
            app.is_any_tenant_admin ()
            OR app.is_any_storage_manager ()
        )
    );

-- UPDATE: tenant_admin or storage_manager anywhere (Not excluding super_admin)
CREATE POLICY "tags_update_by_storage_roles" ON public.tags FOR
UPDATE TO authenticated USING (
    (
        app.is_any_tenant_admin ()
        OR app.is_any_storage_manager ()
    )
)
WITH
    CHECK (
        (
            app.is_any_tenant_admin ()
            OR app.is_any_storage_manager ()
        )
    );

-- DELETE: tenant_admin or storage_manager anywhere (Not excluding super_admin)
CREATE POLICY "tags_delete_by_storage_roles" ON public.tags FOR DELETE TO authenticated USING (
    (
        app.is_any_tenant_admin ()
        OR app.is_any_storage_manager ()
    )
);

-- SELECT policies are left as-is ("All users can read tags" / "Authenticated can read tags").