-- ===============================================================================
-- Migration: 20250918130217_Bookings_Policy_Update.sql
-- Description: Update policies for bookings table to not exclude super admins in read/create
-- ===============================================================================
-- Enable again because I disabled it in the UI of main
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;

alter policy "Members can read own bookings" on "public"."bookings" to authenticated using (
    auth.uid () = user_id -- Removed NOT is_super_admin() condition
);

alter policy "Users can create their own bookings" on "public"."bookings" to authenticated
with
    check (
        auth.uid () = user_id -- Removed NOT is_super_admin() condition
    );

-- Drop Ban Policies For Good
DROP POLICY IF EXISTS "Ban Enforcement App Bookings" ON public.bookings;

DROP POLICY IF EXISTS "Ban Enforcement Org Bookings" ON public.bookings;

ALTER POLICY "Members can update own or org bookings" ON public.bookings USING (
    (
        user_id = auth.uid()
        OR app.is_any_tenant_admin()
        OR app.is_any_storage_manager()
        OR app.is_any_requester()
    )
    AND status IN ('pending')
) WITH CHECK (
    (
        user_id = auth.uid()
        OR app.is_any_tenant_admin()
        OR app.is_any_storage_manager()
        OR app.is_any_requester()
    )
    AND status IN ('pending')
);

ALTER POLICY "Users can delete their own bookings" ON public.bookings USING (
    user_id = auth.uid() -- Remove NOT is_super_admin() condition
 
);
-- Add new policies to allow any admin role to read, create, update, delete bookings
-- Let the app sort out what to show based on org context
CREATE POLICY "Any Admin Can Update Bookings" ON public.bookings
    FOR UPDATE
    TO authenticated
    USING (
        app.is_any_tenant_admin()
        OR app.is_any_storage_manager()
        OR app.is_any_requester()
    )
    WITH CHECK (
        app.is_any_tenant_admin()
        OR app.is_any_storage_manager()
        OR app.is_any_requester()
    );
-- Add new policy to allow any admin role to DELETE bookings
-- App handles the more complex logic of what to allow to delete in org context
    CREATE POLICY "Any Admin Can Delete Bookings" ON public.bookings
    FOR DELETE
    TO authenticated
    USING (
        app.is_any_tenant_admin()
        OR app.is_any_storage_manager()
        OR app.is_any_requester()
    );