DROP POLICY IF EXISTS "Ban Enforcement App User Addresses" ON public.user_addresses;

ALTER POLICY "Users can read their own addresses" ON public.user_addresses TO authenticated
USING (
    auth.uid () = user_id -- Removed NOT is_super_admin() condition
);

ALTER POLICY "Users can insert their own addresses" ON public.user_addresses TO authenticated
WITH CHECK (
    auth.uid () = user_id -- Removed NOT is_super_admin() condition
);


ALTER POLICY "Users can update their own addresses" ON public.user_addresses TO authenticated
USING (
    auth.uid () = user_id -- Removed NOT is_super_admin() condition
);

ALTER POLICY "Users can delete their own addresses" ON public.user_addresses TO authenticated
USING (
    auth.uid () = user_id -- Removed NOT is_super_admin() condition
);

DROP POLICY IF EXISTS "Tenant admins and storage managers can delete org user addresse" ON public.user_addresses;
DROP POLICY IF EXISTS "Tenant admins and storage managers can insert org user addresse" ON public.user_addresses;
DROP POLICY IF EXISTS "Tenant admins and storage managers can read org user addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Tenant admins and storage managers can update org user addresse" ON public.user_addresses;

-- ===================================
-- Tenant admins and storage managers can READ any user addresses
-- ===================================
CREATE POLICY "Tenant admins and storage managers can read any user addresses"
ON public.user_addresses
FOR SELECT
TO authenticated
USING (
  app.is_any_tenant_admin() OR app.is_any_storage_manager()
);

-- ===================================
-- Tenant admins and storage managers can INSERT any user addresses
-- ===================================
CREATE POLICY "Tenant admins and storage managers can insert any user addresses"
ON public.user_addresses
FOR INSERT
TO authenticated
WITH CHECK (
  app.is_any_tenant_admin() OR app.is_any_storage_manager()
);

-- ===================================
-- Tenant admins and storage managers can UPDATE any user addresses
-- ===================================
CREATE POLICY "Tenant admins and storage managers can update any user addresses"
ON public.user_addresses
FOR UPDATE
TO authenticated
USING (
  app.is_any_tenant_admin() OR app.is_any_storage_manager()
)
WITH CHECK (
  app.is_any_tenant_admin() OR app.is_any_storage_manager()
);

-- ===================================
-- Tenant admins and storage managers can DELETE any user addresses
-- ===================================
CREATE POLICY "Tenant admins and storage managers can delete any user addresses"
ON public.user_addresses
FOR DELETE
TO authenticated
USING (
  app.is_any_tenant_admin() OR app.is_any_storage_manager()
);

