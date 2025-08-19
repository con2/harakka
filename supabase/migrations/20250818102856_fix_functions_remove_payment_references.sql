-- Fix all stored functions that reference removed payment/price columns

-- 1. Drop and recreate the update_booking_amounts trigger function
-- This function was referencing 'subtotal' column that we removed
DROP FUNCTION IF EXISTS update_booking_amounts() CASCADE;

-- Since we removed pricing functionality, we can either remove this trigger entirely
-- or create a simplified version that doesn't calculate amounts
-- For now, let's create a no-op version to avoid breaking existing triggers

CREATE OR REPLACE FUNCTION update_booking_amounts() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- No-op function since we removed pricing functionality
  -- This prevents the trigger from breaking while maintaining compatibility
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- 2. Fix get_all_full_bookings function
-- Remove payment_status, payment_details, unit_price, and subtotal references
DROP FUNCTION IF EXISTS get_all_full_bookings(integer, integer);

CREATE OR REPLACE FUNCTION get_all_full_bookings(in_offset integer, in_limit integer)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(booking_data)
  INTO result
  FROM (
    SELECT jsonb_build_object(
      'id', o.id,
      'booking_number', o.booking_number,
      'user_id', o.user_id,
      'status', o.status,
      'total_amount', o.total_amount,
      'discount_amount', o.discount_amount,
      'discount_code', o.discount_code,
      'final_amount', o.final_amount,
      'notes', o.notes,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'booking_items', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'booking_id', oi.booking_id,
            'item_id', oi.item_id,
            'start_date', oi.start_date,
            'end_date', oi.end_date,
            'total_days', oi.total_days,
            'quantity', oi.quantity,
            'created_at', oi.created_at,
            'storage_items', jsonb_build_object(
              'translations', si.translations,
              'location_id', si.location_id
            )
          )
        )
        FROM booking_items oi
        LEFT JOIN storage_items si ON oi.item_id = si.id
        WHERE oi.booking_id = o.id
      )
    ) as booking_data
    FROM bookings o
    ORDER BY o.created_at DESC
    LIMIT in_limit OFFSET in_offset
  ) subquery;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- 3. Fix get_full_booking function
DROP FUNCTION IF EXISTS get_full_booking(uuid);

CREATE OR REPLACE FUNCTION get_full_booking(booking_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'bookings', jsonb_build_object(
      'id', o.id,
      'booking_number', o.booking_number,
      'user_id', o.user_id,
      'status', o.status,
      'total_amount', o.total_amount,
      'discount_amount', o.discount_amount,
      'discount_code', o.discount_code,
      'final_amount', o.final_amount,
      'notes', o.notes,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'booking_items', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'item_id', oi.item_id,
            'start_date', oi.start_date,
            'end_date', oi.end_date,
            'total_days', oi.total_days,
            'quantity', oi.quantity,
            'created_at', oi.created_at,
            'location_id', oi.location_id,
            'translations', si.translations,
            'location_name', sl.name
          )
        )
        FROM booking_items oi
        LEFT JOIN storage_items si ON oi.item_id = si.id
        LEFT JOIN storage_locations sl ON si.location_id = sl.id
        WHERE oi.booking_id = o.id
      )
    )
  ) INTO result
  FROM bookings o
  WHERE o.id = booking_id;

  RETURN result;
END;
$$;

-- 4. Fix get_full_user_booking function
DROP FUNCTION IF EXISTS get_full_user_booking(uuid, integer, integer);

CREATE OR REPLACE FUNCTION get_full_user_booking(in_user_id uuid, in_offset integer, in_limit integer)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(booking_data)
  INTO result
  FROM (
    SELECT jsonb_build_object(
      'id', o.id,
      'booking_number', o.booking_number,
      'user_id', o.user_id,
      'status', o.status,
      'total_amount', o.total_amount,
      'discount_amount', o.discount_amount,
      'discount_code', o.discount_code,
      'final_amount', o.final_amount,
      'notes', o.notes,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'booking_items', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'booking_id', oi.booking_id,
            'item_id', oi.item_id,
            'start_date', oi.start_date,
            'end_date', oi.end_date,
            'total_days', oi.total_days,
            'quantity', oi.quantity,
            'created_at', oi.created_at,
            'storage_items', jsonb_build_object(
              'translations', si.translations,
              'location_id', si.location_id
            )
          )
        )
        FROM booking_items oi
        LEFT JOIN storage_items si ON oi.item_id = si.id
        WHERE oi.booking_id = o.id
      )
    ) as booking_data
    FROM bookings o
    WHERE o.user_id = in_user_id
    ORDER BY o.created_at DESC
    LIMIT in_limit OFFSET in_offset
  ) subquery;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- 5. Remove order-related functions entirely (they seem to be legacy/duplicate)
-- These reference non-existent 'orders' table and 'order_items' table
DROP FUNCTION IF EXISTS get_all_full_orders(integer, integer);
DROP FUNCTION IF EXISTS get_full_order(uuid);  
DROP FUNCTION IF EXISTS get_full_user_order(uuid, integer, integer);

-- Note: The above order functions appear to be legacy code referencing tables
-- that don't exist in our current schema (orders, order_items vs bookings, booking_items)
-- Since we're working with bookings, not orders, these can be safely removed

-- 6. Update any triggers that might be affected
-- The update_booking_amounts_trigger should still work with our no-op function
-- but let's verify it's still properly attached
DO $$
BEGIN
    -- Check if trigger exists and recreate if needed
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_booking_amounts_trigger' 
        AND tgrelid = 'booking_items'::regclass
    ) THEN
        CREATE TRIGGER update_booking_amounts_trigger
        AFTER INSERT OR DELETE OR UPDATE ON booking_items
        FOR EACH ROW EXECUTE FUNCTION update_booking_amounts();
    END IF;
END
$$;
