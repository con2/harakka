-- Multi-tenant approvals for bookings
-- Date: 2025-08-13

-- 1) booking_items: allow 'rejected' status alongside existing values
ALTER TABLE public.booking_items
  DROP CONSTRAINT IF EXISTS order_items_status_check;
ALTER TABLE public.booking_items
  ADD CONSTRAINT order_items_status_check
  CHECK ((status)::text = ANY (
    ARRAY['pending','confirmed','cancelled','picked_up','returned','rejected']::text[]
  ));

-- 2) booking_items: decision audit fields (who/when/why)
ALTER TABLE public.booking_items
  ADD COLUMN IF NOT EXISTS decision_by_user_id uuid NULL,
  ADD COLUMN IF NOT EXISTS decision_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS decision_reason text NULL;

-- Optional FK: decision_by_user_id -> auth.users(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'booking_items_decision_by_user_id_fkey'
  ) THEN
    ALTER TABLE ONLY public.booking_items
      ADD CONSTRAINT booking_items_decision_by_user_id_fkey
      FOREIGN KEY (decision_by_user_id) REFERENCES auth.users(id);
  END IF;
END $$;

-- 3) Helpful indexes for org approval queues and booking aggregation
CREATE INDEX IF NOT EXISTS idx_booking_items_org_status
  ON public.booking_items (provider_organization_id, status);
CREATE INDEX IF NOT EXISTS idx_booking_items_booking_status
  ON public.booking_items (booking_id, status);

-- 4) Auto-aggregate bookings.status from its items
--    - any item "rejected" -> booking "rejected"
--    - else if all items "confirmed" (and count > 0) -> booking "confirmed"
--    - else -> booking "pending"
CREATE OR REPLACE FUNCTION public.sync_booking_status_from_items(p_booking_id uuid)
RETURNS void AS $$
DECLARE
  total_items int;
  confirmed_items int;
  rejected_items int;
BEGIN
  SELECT count(*) INTO total_items
  FROM public.booking_items
  WHERE booking_id = p_booking_id;

  SELECT count(*) INTO confirmed_items
  FROM public.booking_items
  WHERE booking_id = p_booking_id AND status = 'confirmed';

  SELECT count(*) INTO rejected_items
  FROM public.booking_items
  WHERE booking_id = p_booking_id AND status = 'rejected';

  IF rejected_items > 0 THEN
    UPDATE public.bookings SET status = 'rejected' WHERE id = p_booking_id;
  ELSIF total_items > 0 AND confirmed_items = total_items THEN
    UPDATE public.bookings SET status = 'confirmed' WHERE id = p_booking_id;
  ELSE
    UPDATE public.bookings SET status = 'pending' WHERE id = p_booking_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.trg_sync_booking_status()
RETURNS trigger AS $$
BEGIN
  PERFORM public.sync_booking_status_from_items(COALESCE(NEW.booking_id, OLD.booking_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS booking_items_sync_status ON public.booking_items;
CREATE TRIGGER booking_items_sync_status
AFTER INSERT OR UPDATE OR DELETE ON public.booking_items
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_booking_status();
