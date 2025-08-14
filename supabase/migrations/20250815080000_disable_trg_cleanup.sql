BEGIN;

-- 1) Temporarily silence user-defined triggers on tables that might emit notifications.
--    (Covers your custom app triggers without touching constraint triggers.)
ALTER TABLE public.booking_items DISABLE TRIGGER USER;
ALTER TABLE public.bookings      DISABLE TRIGGER USER;  -- keep if you have booking-level triggers

-- 2) Clean up period "violators" so your CHECK & generated column won't cause problems.
--    Choose ONE path: DELETE bad rows OR minimally fix them. Deleting is simplest.

-- (a) Inspect first (optional):
-- SELECT id, start_date, end_date, status FROM public.booking_items
-- WHERE start_date IS NULL OR end_date IS NULL OR start_date >= end_date;

-- (b1) Simple: delete rows with null/invalid periods
DELETE FROM public.booking_items
WHERE start_date IS NULL
   OR end_date   IS NULL
   OR start_date >= end_date;

-- Alternatively, (b2) minimally fix (example: nudge end_date forward 1 day when equal/null)
-- UPDATE public.booking_items
-- SET end_date = COALESCE(end_date, start_date) + INTERVAL '1 day'
-- WHERE start_date IS NOT NULL
--   AND (end_date IS NULL OR start_date >= end_date);

-- 3) (Optional but recommended) Validate the CHECK if you already added it with NOT VALID:
-- ALTER TABLE public.booking_items VALIDATE CONSTRAINT booking_items_valid_period;

-- 4) Re-enable triggers
ALTER TABLE public.booking_items ENABLE TRIGGER USER;
ALTER TABLE public.bookings      ENABLE TRIGGER USER;

COMMIT;