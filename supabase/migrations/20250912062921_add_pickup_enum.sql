ALTER TYPE booking_status ADD VALUE 'picked_up';
ALTER TYPE booking_status ADD VALUE 'returned';
ALTER TYPE booking_status ADD VALUE 'completed';

ALTER TABLE booking_items DROP CONSTRAINT IF EXISTS order_items_status_check;

-- add new constraint:
-- this checks that the text value in booking_items.status is one of the enum labels
ALTER TABLE booking_items
  ADD CONSTRAINT booking_items_status_check
  CHECK ( status = ANY ( enum_range(NULL::booking_status) ) );

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS orders_status_check;

-- add new constraint:
-- this checks that the text value in bookings.status is one of the enum labels
ALTER TABLE bookings
  ADD CONSTRAINT booking_status_check
  CHECK ( status = ANY ( enum_range(NULL::booking_status) ) );

-- temporarily drop this trigger to prevent notifications from crashing the booking updates
DROP TRIGGER IF EXISTS booking_after_update ON bookings;