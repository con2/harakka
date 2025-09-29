DROP POLICY IF EXISTS "org_roles_insert_booking_items" ON public.booking_items;

CREATE POLICY "Any authenticated user can insert booking_items"
ON public.booking_items
FOR INSERT
TO authenticated
WITH CHECK ( true );

-- Allow regular users to UPDATE or DELETE their own booking_items while pending
-- ---------------------------------------------------------------------------
-- A user is considered the owner if the parent booking belongs to them.
-- We require the booking_items.status to be 'pending' both before (USING)
-- and after (WITH CHECK) the update.

CREATE POLICY "Users Can Update Their Own Pending Booking Items"
ON public.booking_items
FOR UPDATE
TO authenticated
USING (
  status = 'pending'
  AND EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.id = booking_items.booking_id
      AND b.user_id = auth.uid()
  )
)
WITH CHECK (
  status = 'pending'
  AND EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.id = booking_items.booking_id
      AND b.user_id = auth.uid()
  )
);


CREATE POLICY "Users Can Delete Their Own Pending Booking Items"
ON public.booking_items
FOR DELETE
TO authenticated
USING (
  status = 'pending'
  AND EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.id = booking_items.booking_id
      AND b.user_id = auth.uid()
  )
);