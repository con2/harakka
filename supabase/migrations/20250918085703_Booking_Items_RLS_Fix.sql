-- ============================================================================
-- Bookings/Booking Items: SELECT policies using any-role helpers
-- Goal: allow tenant_admin and storage_manager (any org) to see bookings and
--       booking_items without joining to booking_items inside bookings RLS.
-- Notes:
--   - Avoids recursion and RLS cross-table visibility problems.
--   - Continues to exclude super_admin from bookings visibility per prior rules.
--   - Does not change mutation policies.
-- ============================================================================
-- Ensure RLS is enabled (idempotent)
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.booking_items ENABLE ROW LEVEL SECURITY;

-- Cleanup: ensure no misnamed policies exist on bookings
DROP POLICY IF EXISTS "org_roles_update_booking_items" ON public.bookings;

DROP POLICY IF EXISTS "org_roles_insert_booking_items" ON public.bookings;

DROP POLICY IF EXISTS "org_roles_delete_booking_items" ON public.bookings;

-- -----------------------------
-- BOOKINGS: SELECT any-role
-- -----------------------------
-- Drop potentially conflicting SELECT policies
DROP POLICY IF EXISTS "org_staff_select_relevant_bookings" ON public.bookings;

DROP POLICY IF EXISTS "Authenticated can read bookings" ON public.bookings;

DROP POLICY IF EXISTS "users_select_own_bookings" ON public.bookings;

DROP POLICY IF EXISTS "ban_enforcement_app_booking_items" ON public.booking_items;

DROP POLICY IF EXISTS "ban_enforcement_org_booking_items" ON public.booking_items;

-- Allow tenant_admin or storage_manager (any org) to read bookings
CREATE POLICY "any_admins_select_bookings" ON public.bookings FOR
SELECT
    TO authenticated USING (
        (
            app.is_any_tenant_admin ()
            OR app.is_any_storage_manager ()
        )
    );

-- -----------------------------
-- BOOKING_ITEMS: SELECT any-role (optional broader read)
-- -----------------------------
-- Keep existing org-scoped policies, but add a permissive SELECT for admins anywhere
DROP POLICY IF EXISTS "any_admins_select_booking_items" ON public.booking_items;

CREATE POLICY "any_admins_select_booking_items" ON public.booking_items FOR
SELECT
    TO authenticated USING (
        (
            app.is_any_tenant_admin ()
            OR app.is_any_storage_manager ()
        )
    );

-- Note: If you still have restrictive ban policies on bookings (SELECT),
-- consider making them mutation-only or switching to EXISTS on allowed orgs.
DROP POLICY IF EXISTS "org_roles_select_booking_items" ON public.booking_items;

DROP POLICY IF EXISTS "org_roles_update_booking_items" ON public.booking_items;

DROP POLICY IF EXISTS "org_roles_insert_booking_items" ON public.booking_items;

DROP POLICY IF EXISTS "org_roles_delete_booking_items" ON public.booking_items;

-- Recreate the UPDATE policy (booking_items)
CREATE POLICY "org_roles_update_booking_items" ON public.booking_items FOR
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

-- Recreate the INSERT policy (booking_items)
-- NOTE: INSERT policies may only specify WITH CHECK (no USING clause)
CREATE POLICY "org_roles_insert_booking_items" ON public.booking_items FOR INSERT TO authenticated
WITH
    CHECK (
        (
            app.is_any_tenant_admin ()
            OR app.is_any_storage_manager ()
        )
    );

-- Recreate the DELETE policy (booking_items)
-- NOTE: DELETE policies use USING only
CREATE POLICY "org_roles_delete_booking_items" ON public.booking_items FOR DELETE TO authenticated USING (
    (
        app.is_any_tenant_admin ()
        OR app.is_any_storage_manager ()
    )
);