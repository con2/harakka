-- Final cleanup migration to ensure all payment references are removed
-- This addresses any functions or views that still reference removed columns

-- 1. Completely recreate update_booking_amounts function as no-op
-- (The diff shows it still references 'subtotal' which no longer exists)
DROP FUNCTION IF EXISTS update_booking_amounts() CASCADE;
CREATE OR REPLACE FUNCTION update_booking_amounts() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
  -- No-op function since we removed pricing functionality completely
  -- This prevents any triggers from breaking while maintaining compatibility
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;  
  END IF;
END;
$$;

-- 2. Fix all booking-related functions to remove payment_status, payment_details, unit_price, subtotal references
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

  -- Build JSON result WITHOUT payment references
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
      'total_amount', o.total_amount,
      'discount_amount', o.discount_amount,
      'discount_code', o.discount_code,
      'final_amount', o.final_amount,
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

-- 3. Fix get_full_booking function
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
      'total_amount', o.total_amount,
      'discount_amount', o.discount_amount,
      'discount_code', o.discount_code,
      'final_amount', o.final_amount,
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

-- 4. Fix get_full_user_booking function
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

  -- Get paginated bookings with safe offset & limit
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
      'total_amount', o.total_amount,
      'discount_amount', o.discount_amount,
      'discount_code', o.discount_code,
      'final_amount', o.final_amount,
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

-- 5. Fix view_bookings_with_user_info to remove payment_status reference
DROP VIEW IF EXISTS view_bookings_with_user_info CASCADE;
CREATE VIEW view_bookings_with_user_info AS
SELECT 
    b.total_amount,
    b.id,
    b.status,
    b.created_at,
    b.final_amount,
    b.booking_number,
    (b.created_at)::text AS created_at_text,
    (b.final_amount)::text AS final_amount_text,
    u.full_name,
    u.visible_name,
    u.email,
    u.id AS user_id
FROM bookings b
JOIN user_profiles u ON b.user_id = u.id;

-- 6. Fix view_manage_storage_items to remove price column reference
DROP VIEW IF EXISTS view_manage_storage_items CASCADE;
CREATE VIEW view_manage_storage_items AS
SELECT 
    (s.translations -> 'fi'::text) ->> 'item_name'::text AS fi_item_name,
    (s.translations -> 'fi'::text) ->> 'item_type'::text AS fi_item_type,
    (s.translations -> 'en'::text) ->> 'item_name'::text AS en_item_name,
    (s.translations -> 'en'::text) ->> 'item_type'::text AS en_item_type,
    s.translations,
    s.id,
    s.items_number_total,
    s.created_at,
    s.is_active,
    s.location_id,
    l.name AS location_name,
    array_agg(DISTINCT t.tag_id) AS tag_ids,
    array_agg(DISTINCT g.translations) AS tag_translations,
    s.items_number_currently_in_storage,
    s.is_deleted,
    s.org_id AS organization_id
FROM storage_items s
JOIN storage_locations l ON s.location_id = l.id
LEFT JOIN storage_item_tags t ON s.id = t.item_id
LEFT JOIN tags g ON t.tag_id = g.id
GROUP BY s.id, s.translations, s.items_number_total, s.created_at, s.is_active, s.location_id, l.name, s.items_number_currently_in_storage, s.is_deleted, s.org_id;

-- 7. Ensure any remaining triggers are properly recreated
-- Recreate the trigger for update_booking_amounts if it doesn't exist
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

-- 8. Final verification - ensure we don't have any remaining references to removed columns
-- This will help identify if there are any other functions we missed
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Check for any functions that might still reference removed columns
    FOR func_record IN 
        SELECT proname, prosrc 
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND (prosrc LIKE '%payment_status%' 
             OR prosrc LIKE '%payment_details%' 
             OR prosrc LIKE '%unit_price%' 
             OR prosrc LIKE '%subtotal%')
    LOOP
        RAISE NOTICE 'Function % still contains payment references', func_record.proname;
    END LOOP;
END
$$;
