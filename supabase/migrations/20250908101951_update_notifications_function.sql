-- temporarily drop this trigger to prevent notifications from crashing the booking updates
DROP TRIGGER IF EXISTS booking_after_update ON bookings;
