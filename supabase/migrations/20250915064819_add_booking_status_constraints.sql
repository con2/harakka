-- Add constraints to ensure booking status values are valid enum values
-- This migration runs after the enum values have been added in the previous migration

-- Drop any existing constraints first
ALTER TABLE booking_items DROP CONSTRAINT IF EXISTS order_items_status_check;
ALTER TABLE booking_items DROP CONSTRAINT IF EXISTS booking_items_status_check;

-- Add new constraint for booking_items
-- This checks that the text value in booking_items.status is one of the enum labels
ALTER TABLE booking_items
  ADD CONSTRAINT booking_items_status_check
  CHECK ( status = ANY ( enum_range(NULL::booking_status) ) );

-- Drop any existing constraints for bookings table
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS booking_status_check;

-- Add new constraint for bookings
-- This checks that the text value in bookings.status is one of the enum labels
ALTER TABLE bookings
  ADD CONSTRAINT booking_status_check
  CHECK ( status = ANY ( enum_range(NULL::booking_status) ) );

-- Temporarily drop this trigger to prevent notifications from crashing the booking updates.
-- (if it exists - this is a safety measure)
DROP TRIGGER IF EXISTS booking_after_update ON bookings;
