-- ===========================================================================
-- MIGRATION: Clean Bookings RLS - No Super Admin Access
-- Purpose:
--   Remove ALL super admin access to bookings and booking_items.
--   Super admins only manage users and organizations, not bookings.
--   
--   Structure: Base permissions + additional permissions by role (excluding super_admin)
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- STEP 1: Add helper functions (must come before policies that use them)
-- ---------------------------------------------------------------------------

-- Helper: Check if user owns a booking (without triggering RLS on bookings)
CREATE OR REPLACE FUNCTION app.user_owns_booking(p_booking_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM bookings 
    WHERE id = p_booking_id 
      AND user_id = p_user_id
  );
$$;

COMMENT ON FUNCTION app.user_owns_booking(uuid, uuid) IS 
'SECURITY DEFINER function to check booking ownership without triggering RLS recursion. Used by booking_items policies.';

-- Helper: Check if booking has any items from banned orgs (without recursion concerns)
CREATE OR REPLACE FUNCTION app.booking_has_banned_org_items(p_booking_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean  
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM booking_items bi
    WHERE bi.booking_id = p_booking_id
      AND NOT app.me_is_not_banned_for_org(bi.provider_organization_id)
  );
$$;

COMMENT ON FUNCTION app.booking_has_banned_org_items(uuid, uuid) IS
'SECURITY DEFINER function to check if booking contains items from orgs the user is banned from. Used by bookings ban enforcement policy.';

-- ---------------------------------------------------------------------------
-- STEP 2: Clean slate - drop all existing booking policies
-- ---------------------------------------------------------------------------

-- Drop all existing booking policies
DROP POLICY IF EXISTS "Anonymous users cannot access bookings" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated can read bookings" ON public.bookings;
DROP POLICY IF EXISTS "Members can read own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Members can update own or org bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Org staff can read bookings with items from their orgs" ON public.bookings;
DROP POLICY IF EXISTS "Super admins can read all bookings" ON public.bookings;
DROP POLICY IF EXISTS "super_admin_select_all_bookings" ON public.bookings;
DROP POLICY IF EXISTS "super_admin_insert_bookings" ON public.bookings;
DROP POLICY IF EXISTS "super_admin_update_bookings" ON public.bookings;
DROP POLICY IF EXISTS "super_admin_delete_bookings" ON public.bookings;
DROP POLICY IF EXISTS "users_select_own_bookings" ON public.bookings;
DROP POLICY IF EXISTS "users_insert_own_bookings" ON public.bookings;
DROP POLICY IF EXISTS "users_update_own_bookings" ON public.bookings;
DROP POLICY IF EXISTS "users_delete_own_bookings" ON public.bookings;
DROP POLICY IF EXISTS "org_staff_select_relevant_bookings" ON public.bookings;
DROP POLICY IF EXISTS "org_staff_update_relevant_bookings" ON public.bookings;
DROP POLICY IF EXISTS "deny_anonymous_access_bookings" ON public.bookings;
DROP POLICY IF EXISTS "ban_enforcement_app_bookings" ON public.bookings;
DROP POLICY IF EXISTS "ban_enforcement_org_bookings" ON public.bookings;

-- Continue working on the view RLS and also fix booking_items and bookings policies. Almost done but not there yet. Probably need to undo some of the AI changes.


-- ---------------------------------------------------------------------------
-- STEP 2: BOOKINGS - Clean policy structure (NO super admin access)
-- ---------------------------------------------------------------------------

-- =======================
-- SECURITY: Block anonymous access
-- =======================

CREATE POLICY "deny_anonymous_access_bookings" ON public.bookings
  FOR ALL TO anon
  USING (false);

-- =======================
-- SELECT policies
-- =======================

-- BASE POLICY: All authenticated users can read their own bookings
CREATE POLICY "users_select_own_bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ADDITIONAL PERMISSIONS: Tenant Admin/Storage Manager/Requester can read bookings with items from their orgs
-- BUT explicitly exclude super admins
CREATE POLICY "org_staff_select_relevant_bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (
    NOT app.me_is_super_admin() AND (
      app.me_has_role_anywhere('tenant_admin'::public.roles_type) OR
      app.me_has_role_anywhere('storage_manager'::public.roles_type) OR
      app.me_has_role_anywhere('requester'::public.roles_type)
    )
  );

-- =======================
-- INSERT policies
-- =======================

-- BASE POLICY: Users can create their own bookings
CREATE POLICY "users_insert_own_bookings" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =======================
-- UPDATE policies
-- =======================

-- BASE POLICY: Users can update their own bookings
CREATE POLICY "users_update_own_bookings" ON public.bookings
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ADDITIONAL PERMISSIONS: Org staff can update bookings in their orgs
CREATE POLICY "org_staff_update_relevant_bookings" ON public.bookings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM booking_items bi
      WHERE bi.booking_id = bookings.id
        AND (
          app.me_has_role(bi.provider_organization_id, 'tenant_admin'::public.roles_type) OR
          app.me_has_role(bi.provider_organization_id, 'storage_manager'::public.roles_type) OR
          app.me_has_role(bi.provider_organization_id, 'requester'::public.roles_type)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM booking_items bi
      WHERE bi.booking_id = bookings.id
        AND (
          app.me_has_role(bi.provider_organization_id, 'tenant_admin'::public.roles_type) OR
          app.me_has_role(bi.provider_organization_id, 'storage_manager'::public.roles_type) OR
          app.me_has_role(bi.provider_organization_id, 'requester'::public.roles_type)
        )
    )
  );

-- =======================
-- DELETE policies
-- =======================

-- BASE POLICY: Users can delete their own bookings (only if pending)
CREATE POLICY "users_delete_own_bookings" ON public.bookings
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND status = 'pending'::booking_status);

-- =======================
-- RESTRICTIVE POLICIES: Ban enforcement
-- =======================

-- Block app-banned users
CREATE POLICY "ban_enforcement_app_bookings" ON public.bookings
  AS RESTRICTIVE
  FOR ALL TO authenticated
  USING (app.me_is_not_banned_for_app());

-- Block users from booking items from orgs they're banned from
CREATE POLICY "ban_enforcement_org_bookings" ON public.bookings
  AS RESTRICTIVE
  FOR ALL TO authenticated
  USING (NOT app.booking_has_banned_org_items(id));

-- ---------------------------------------------------------------------------
-- STEP 3: BOOKING_ITEMS - Clean policy structure (NO super admin access)
-- ---------------------------------------------------------------------------

-- =======================
-- SECURITY: Block anonymous access
-- =======================

CREATE POLICY "deny_anonymous_access_booking_items" ON public.booking_items
  FOR ALL TO anon
  USING (false);

-- =======================
-- SELECT policies
-- =======================

-- BASE POLICY: Users can read booking_items for their own bookings
CREATE POLICY "users_select_own_booking_items" ON public.booking_items
  FOR SELECT TO authenticated
  USING (app.user_owns_booking(booking_id));

-- ADDITIONAL PERMISSIONS: Org staff can read booking_items from their orgs
-- BUT explicitly exclude super admins
CREATE POLICY "org_staff_select_org_booking_items" ON public.booking_items
  FOR SELECT TO authenticated
  USING (
    NOT app.me_is_super_admin() AND (
      app.me_has_role(provider_organization_id, 'tenant_admin'::public.roles_type) OR
      app.me_has_role(provider_organization_id, 'storage_manager'::public.roles_type) OR
      app.me_has_role(provider_organization_id, 'requester'::public.roles_type)
    )
  );

-- =======================
-- INSERT policies
-- =======================

-- BASE POLICY: Users can insert booking_items for their own bookings
CREATE POLICY "users_insert_own_booking_items" ON public.booking_items
  FOR INSERT TO authenticated
  WITH CHECK (app.user_owns_booking(booking_id));

-- ADDITIONAL PERMISSIONS: Org staff can insert booking_items for their orgs
-- BUT explicitly exclude super admins
CREATE POLICY "org_staff_insert_org_booking_items" ON public.booking_items
  FOR INSERT TO authenticated
  WITH CHECK (
    NOT app.me_is_super_admin() AND (
      app.me_has_role(provider_organization_id, 'tenant_admin'::public.roles_type) OR
      app.me_has_role(provider_organization_id, 'storage_manager'::public.roles_type) OR
      app.me_has_role(provider_organization_id, 'requester'::public.roles_type)
    )
  );

-- =======================
-- UPDATE policies
-- =======================

-- BASE POLICY: Users can update booking_items for their own bookings
CREATE POLICY "users_update_own_booking_items" ON public.booking_items
  FOR UPDATE TO authenticated
  USING (app.user_owns_booking(booking_id))
  WITH CHECK (app.user_owns_booking(booking_id));

-- ADDITIONAL PERMISSIONS: Org staff can update booking_items for their orgs
-- BUT explicitly exclude super admins
CREATE POLICY "org_staff_update_org_booking_items" ON public.booking_items
  FOR UPDATE TO authenticated
  USING (
    NOT app.me_is_super_admin() AND (
      app.me_has_role(provider_organization_id, 'tenant_admin'::public.roles_type) OR
      app.me_has_role(provider_organization_id, 'storage_manager'::public.roles_type) OR
      app.me_has_role(provider_organization_id, 'requester'::public.roles_type)
    )
  )
  WITH CHECK (
    NOT app.me_is_super_admin() AND (
      app.me_has_role(provider_organization_id, 'tenant_admin'::public.roles_type) OR
      app.me_has_role(provider_organization_id, 'storage_manager'::public.roles_type) OR
      app.me_has_role(provider_organization_id, 'requester'::public.roles_type)
    )
  );

-- =======================
-- DELETE policies
-- =======================

-- BASE POLICY: Users can delete booking_items for their own bookings
CREATE POLICY "users_delete_own_booking_items" ON public.booking_items
  FOR DELETE TO authenticated
  USING (app.user_owns_booking(booking_id));

-- ADDITIONAL PERMISSIONS: Org staff can delete booking_items for their orgs
-- BUT explicitly exclude super admins
CREATE POLICY "org_staff_delete_org_booking_items" ON public.booking_items
  FOR DELETE TO authenticated
  USING (
    NOT app.me_is_super_admin() AND (
      app.me_has_role(provider_organization_id, 'tenant_admin'::public.roles_type) OR
      app.me_has_role(provider_organization_id, 'storage_manager'::public.roles_type) OR
      app.me_has_role(provider_organization_id, 'requester'::public.roles_type)
    )
  );

-- ---------------------------------------------------------------------------
-- STEP 4: Show final policy state
-- ---------------------------------------------------------------------------

SELECT 'BOOKINGS POLICIES:' as info, count(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'bookings';

SELECT 'BOOKING_ITEMS POLICIES:' as info, count(*) as policy_count  
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'booking_items';

-- Confirm no super admin policies exist
SELECT 'Super admin policies on bookings:' as info, count(*) as count
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('bookings', 'booking_items')
  AND (policyname ILIKE '%super_admin%' OR policyname ILIKE '%super admin%');

-- ---------------------------------------------------------------------------
-- STEP 5: Configure view grants (consolidated from other migrations)
-- ---------------------------------------------------------------------------

-- Revoke all default permissions and start with clean slate
REVOKE ALL ON public.view_bookings_with_details FROM public, anon, authenticated, service_role;
REVOKE ALL ON public.view_bookings_with_user_info FROM public, anon, authenticated, service_role;
REVOKE ALL ON public.view_user_ban_status FROM public, anon, authenticated, service_role;
REVOKE ALL ON public.view_user_roles_with_details FROM public, anon, authenticated, service_role;
REVOKE ALL ON public.view_item_location_summary FROM public, anon, authenticated, service_role;
REVOKE ALL ON public.view_item_ownership_summary FROM public, anon, authenticated, service_role;
REVOKE ALL ON public.view_manage_storage_items FROM public, anon, authenticated, service_role;
REVOKE ALL ON public.view_tag_popularity FROM public, anon, authenticated, service_role;
REVOKE ALL ON public.view_category_details FROM public, anon, authenticated, service_role;

-- Private views: Only authenticated and service_role should have SELECT
GRANT SELECT ON public.view_bookings_with_details TO authenticated, service_role;
GRANT SELECT ON public.view_bookings_with_user_info TO authenticated, service_role;
GRANT SELECT ON public.view_user_ban_status TO authenticated, service_role;
GRANT SELECT ON public.view_user_roles_with_details TO authenticated, service_role;

-- Public catalog views: anon, authenticated, and service_role should have SELECT
GRANT SELECT ON public.view_item_location_summary TO anon, authenticated, service_role;
GRANT SELECT ON public.view_item_ownership_summary TO anon, authenticated, service_role;
GRANT SELECT ON public.view_manage_storage_items TO anon, authenticated, service_role;
GRANT SELECT ON public.view_tag_popularity TO anon, authenticated, service_role;
GRANT SELECT ON public.view_category_details TO anon, authenticated, service_role;
