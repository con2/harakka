-- Restrict booking_items UPDATE for regular users to self-pickup status changes only.
-- Allow platform storage roles (tenant_admin, storage_manager) to update anywhere.

-- Drop the broad UPDATE policy to replace it with two narrower ones
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'booking_items'
      AND policyname = 'Members can update booking_items for own bookings or admins/requesters in orgs'
  ) THEN
    EXECUTE 'DROP POLICY "Members can update booking_items for own bookings or admins/requesters in orgs" ON public.booking_items';
  END IF;
END $$;



--  Booking owner can only update self-pickup items to picked_up or returned
-- We might want to create some triggers that further enforce this logic
-- (e.g., prevent changing status back to pending, approved, rejected)
CREATE POLICY "Owner can pick up/return self-pickup items"
  ON public.booking_items
  FOR UPDATE
  TO authenticated
  USING (
    booking_items.self_pickup = true
    AND EXISTS (
      SELECT 1
      FROM public.bookings b
      WHERE b.id = booking_items.booking_id
        AND b.user_id = auth.uid()
    )
  )
  WITH CHECK (
    self_pickup = true
    AND status IN ('picked_up','returned')
    AND EXISTS (
      SELECT 1
      FROM public.bookings b
      WHERE b.id = booking_items.booking_id
        AND b.user_id = auth.uid()
    )
  );
