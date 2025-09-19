-- Saving this migration in case we need to activate policies again later.
ALTER TABLE IF EXISTS public.booking_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;

-- Cleanup: ensure no misnamed policies exist on bookings
DROP POLICY IF EXISTS "org_roles_update_booking_items" ON public.bookings;

DROP POLICY IF EXISTS "org_roles_insert_booking_items" ON public.bookings;

DROP POLICY IF EXISTS "org_roles_delete_booking_items" ON public.bookings;

-- Policies for booking_items
DROP POLICY IF EXISTS "org_roles_insert_booking_items" ON public.booking_items;

CREATE POLICY "org_roles_insert_booking_items" ON public.booking_items FOR INSERT TO authenticated
WITH
    CHECK (
        (
            app.is_any_tenant_admin ()
            OR app.is_any_storage_manager ()
        )
    );

DROP POLICY IF EXISTS "org_roles_update_booking_items" ON public.booking_items;

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

DROP POLICY IF EXISTS "org_roles_delete_booking_items" ON public.booking_items;

CREATE POLICY "org_roles_delete_booking_items" ON public.booking_items FOR DELETE TO authenticated USING (
    (
        app.is_any_tenant_admin ()
        OR app.is_any_storage_manager ()
    )
);

