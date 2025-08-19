-- Remove all remaining financial columns from bookings table
-- This completes the removal of payment/pricing functionality

-- 1. First drop any views or functions that depend on these columns
DROP VIEW IF EXISTS view_bookings_with_user_info CASCADE;

-- 2. Remove all financial columns from bookings table
ALTER TABLE bookings DROP COLUMN IF EXISTS total_amount;
ALTER TABLE bookings DROP COLUMN IF EXISTS discount_amount;
ALTER TABLE bookings DROP COLUMN IF EXISTS discount_code;
ALTER TABLE bookings DROP COLUMN IF EXISTS final_amount;

-- 3. Recreate the view_bookings_with_user_info without financial columns
CREATE VIEW view_bookings_with_user_info AS
SELECT 
    b.id,
    b.status,
    b.created_at,
    b.booking_number,
    (b.created_at)::text AS created_at_text,
    u.full_name,
    u.visible_name,
    u.email,
    u.id AS user_id
FROM bookings b
JOIN user_profiles u ON b.user_id = u.id;

-- 4. Update all functions to remove references to financial columns
DROP FUNCTION IF EXISTS get_all_full_bookings(integer, integer) CASCADE;
CREATE OR REPLACE FUNCTION get_all_full_bookings(in_offset integer, in_limit integer)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  safe_offset integer := greatest(in_offset, 0);
  safe_limit integer := least(greatest(in_limit, 1), 1000);
  total_count integer;
  result jsonb;
BEGIN
  -- Count total bookings
  select count(*) into total_count
  from bookings;

  -- Build JSON result WITHOUT any financial references
  select jsonb_build_object(
    'total_count', total_count,
    'bookings', coalesce(jsonb_agg(booking_data), '[]'::jsonb)
  )
  into result
  from (
    select jsonb_build_object(
      'id', o.id,
      'booking_number', o.booking_number,
      'user_id', o.user_id,
      'status', o.status,
      'notes', o.notes,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'booking_items', (
        select jsonb_agg(
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
        from booking_items oi
        left join storage_items si on oi.item_id = si.id
        where oi.booking_id = o.id
      )
    ) as booking_data
    from bookings o
    order by o.created_at desc
    offset safe_offset
    limit safe_limit
  ) t;

  return result;
END;
$$;

-- 5. Update get_full_booking function
DROP FUNCTION IF EXISTS get_full_booking(uuid) CASCADE;
CREATE OR REPLACE FUNCTION get_full_booking(booking_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
BEGIN
  select jsonb_build_object(
    'bookings', jsonb_build_object(
      'id', o.id,
      'booking_number', o.booking_number,
      'user_id', o.user_id,
      'status', o.status,
      'notes', o.notes,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'booking_items', (
        select jsonb_agg(
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
        from booking_items oi
        left join storage_items si on oi.item_id = si.id
        left join storage_locations sl on si.location_id = sl.id
        where oi.booking_id = o.id
      )
    ),
    'user_profile', (
      select jsonb_build_object(
        'full_name', u.full_name,
        'email', u.email
      )
      from user_profiles u
      where u.id = o.user_id
    )
  )
  into result
  from bookings o
  where o.id = booking_id;

  -- Raise error if result is null
  if result is null then
    raise exception 'No booking found with id: %', booking_id;
  end if;

  return result;
END;
$$;

-- 6. Update get_full_user_booking function
DROP FUNCTION IF EXISTS get_full_user_booking(uuid, integer, integer) CASCADE;
CREATE OR REPLACE FUNCTION get_full_user_booking(in_user_id uuid, in_offset integer, in_limit integer)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  safe_offset integer := greatest(in_offset, 0);
  safe_limit integer := least(greatest(in_limit, 1), 1000);
  result jsonb;
  total_count integer;
BEGIN
  -- Get total count of user's bookings
  select count(*) into total_count
  from bookings
  where user_id = in_user_id;

  -- Get paginated bookings without financial columns
  select jsonb_build_object(
    'total_count', total_count,
    'bookings', coalesce(jsonb_agg(booking_data), '[]'::jsonb)
  )
  into result
  from (
    select jsonb_build_object(
      'id', o.id,
      'booking_number', o.booking_number,
      'user_id', o.user_id,
      'status', o.status,
      'notes', o.notes,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'booking_items', (
        select jsonb_agg(
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
        from booking_items oi
        left join storage_items si on oi.item_id = si.id
        where oi.booking_id = o.id
      )
    ) as booking_data
    from bookings o
    where o.user_id = in_user_id
    order by o.created_at desc
    offset safe_offset
    limit safe_limit
  ) t;

  return result;
END;
$$;

-- 7. Ensure update_booking_amounts function is still a no-op
-- (It should already be updated from previous migration, but let's be safe)
DROP FUNCTION IF EXISTS update_booking_amounts() CASCADE;
CREATE OR REPLACE FUNCTION update_booking_amounts() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
  -- No-op function since we removed all financial functionality
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;  
  END IF;
END;
$$;

-- 8. Recreate trigger if it was dropped
DO $$
BEGIN
    -- Drop existing trigger first
    DROP TRIGGER IF EXISTS update_booking_amounts_trigger ON booking_items;
    
    -- Recreate trigger with our no-op function
    CREATE TRIGGER update_booking_amounts_trigger
    AFTER INSERT OR DELETE OR UPDATE ON booking_items
    FOR EACH ROW EXECUTE FUNCTION update_booking_amounts();
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not recreate trigger: %', SQLERRM;
END
$$;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Successfully removed all financial columns from bookings table';
    RAISE NOTICE 'Updated all functions to work without financial data';
    RAISE NOTICE 'Bookings now track only: id, booking_number, user_id, status, notes, created_at, updated_at';
END
$$;
