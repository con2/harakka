-- ✅ Keep timestamptz columns; remove the problematic generated daterange
BEGIN;

-- 0) (Optional) Keep the CHECK constraint; it’s fine with timestamptz
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.conname = 'booking_items_valid_period'
      AND n.nspname = 'public'
      AND t.relname = 'booking_items'
  ) THEN
    ALTER TABLE public.booking_items
      ADD CONSTRAINT booking_items_valid_period
      CHECK (start_date < end_date) NOT VALID;
  END IF;
END$$;

-- 1) Remove the generated daterange column and its index if they exist
ALTER TABLE public.booking_items DROP COLUMN IF EXISTS period;
DROP INDEX IF EXISTS idx_booking_items_period;

-- 2) Create a functional GiST index on the tstzrange expression (works with timestamptz)
CREATE INDEX IF NOT EXISTS idx_booking_items_tstzrange
  ON public.booking_items
  USING gist (tstzrange(start_date, end_date, '[)'));

-- 3) Keep this helpful btree for filtering (org/item/location/status)
CREATE INDEX IF NOT EXISTS idx_booking_items_org_item_loc_status
  ON public.booking_items (provider_organization_id, item_id, location_id, status);

COMMIT;

-- 4) RPC: get_item_availability over TIMESTAMPTZ
CREATE OR REPLACE FUNCTION public.get_item_availability(
  p_start timestamptz,
  p_end   timestamptz,
  p_org_item_ids uuid[] DEFAULT NULL,
  p_storage_item_ids uuid[] DEFAULT NULL,
  p_provider_organization_id uuid DEFAULT NULL,
  p_location_id uuid DEFAULT NULL,
  p_include_pending boolean DEFAULT true,
  p_exclude_booking_id uuid DEFAULT NULL
)
RETURNS TABLE(
  org_item_id uuid,
  storage_item_id uuid,
  location_id uuid,
  owned_quantity integer,
  reserved_quantity integer,
  available integer
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  blocking_statuses text[] := ARRAY['confirmed','picked_up'];
BEGIN
  -- guard
  IF p_start >= p_end THEN
    RAISE EXCEPTION 'p_start (%) must be < p_end (%)', p_start, p_end USING ERRCODE = '22007';
  END IF;

  IF p_include_pending THEN
    blocking_statuses := array_append(blocking_statuses, 'pending');
  END IF;

  RETURN QUERY
  WITH candidate_org_items AS (
    SELECT
      oi.id AS org_item_id,
      oi.organization_id,
      oi.storage_item_id,
      oi.storage_location_id AS location_id,
      COALESCE(oi.owned_quantity, 0)::int AS owned_quantity
    FROM public.organization_items oi
    WHERE (oi.is_active IS TRUE)
      AND (p_org_item_ids IS NULL OR oi.id = ANY(p_org_item_ids))
      AND (p_storage_item_ids IS NULL OR oi.storage_item_id = ANY(p_storage_item_ids))
      AND (p_provider_organization_id IS NULL OR oi.organization_id = p_provider_organization_id)
      AND (p_location_id IS NULL OR oi.storage_location_id = p_location_id)
  ),
  reservations AS (
    SELECT
      c.org_item_id,
      SUM(bi.quantity)::int AS reserved_quantity
    FROM candidate_org_items c
    JOIN public.booking_items bi
      ON bi.item_id = c.storage_item_id
     AND bi.provider_organization_id = c.organization_id
     AND bi.location_id = c.location_id
    WHERE (p_exclude_booking_id IS NULL OR bi.booking_id <> p_exclude_booking_id)
      AND bi.status = ANY(blocking_statuses)
      AND tstzrange(bi.start_date, bi.end_date, '[)') && tstzrange(p_start, p_end, '[)')
    GROUP BY c.org_item_id
  )
  SELECT
    c.org_item_id,
    c.storage_item_id,
    c.location_id,
    c.owned_quantity,
    COALESCE(r.reserved_quantity, 0) AS reserved_quantity,
    GREATEST(c.owned_quantity - COALESCE(r.reserved_quantity, 0), 0) AS available
  FROM candidate_org_items c
  LEFT JOIN reservations r ON r.org_item_id = c.org_item_id
  ORDER BY c.org_item_id, c.storage_item_id;
END;
$$;