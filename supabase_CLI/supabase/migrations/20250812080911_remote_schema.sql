

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE SCHEMA IF NOT EXISTS "security";


ALTER SCHEMA "security" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."notification_channel" AS ENUM (
    'in_app',
    'web_push',
    'email'
);


ALTER TYPE "public"."notification_channel" OWNER TO "postgres";


CREATE TYPE "public"."notification_severity" AS ENUM (
    'info',
    'warning',
    'critical'
);


ALTER TYPE "public"."notification_severity" OWNER TO "postgres";


CREATE TYPE "public"."notification_type" AS ENUM (
    'comment',
    'mention',
    'system',
    'custom',
    'booking.status_approved',
    'booking.status_rejected',
    'booking.created',
    'user.created'
);


ALTER TYPE "public"."notification_type" OWNER TO "postgres";


CREATE TYPE "public"."role_type" AS ENUM (
    'User',
    'Admin',
    'SuperVera',
    'app_admin',
    'main_admin',
    'admin',
    'user',
    'superVera'
);


ALTER TYPE "public"."role_type" OWNER TO "postgres";


CREATE TYPE "public"."roles_type" AS ENUM (
    'super_admin',
    'main_admin',
    'admin',
    'user',
    'superVera',
    'storage_manager',
    'requester'
);


ALTER TYPE "public"."roles_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."audit_trigger_func"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user from our function instead of directly using auth.uid()
  current_user_id := public.get_request_user_id();
  
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, user_id, old_values, new_values
    ) VALUES (
      TG_TABLE_NAME::text, NEW.id, 'update', current_user_id, to_jsonb(OLD.*), to_jsonb(NEW.*)
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, user_id, new_values
    ) VALUES (
      TG_TABLE_NAME::text, NEW.id, 'insert', current_user_id, to_jsonb(NEW.*)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, user_id, old_values
    ) VALUES (
      TG_TABLE_NAME::text, OLD.id, 'delete', current_user_id, to_jsonb(OLD.*)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."audit_trigger_func"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_average_rating"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Handle DELETE operation differently
  IF TG_OP = 'DELETE' THEN
    UPDATE storage_items
    SET average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE item_id = OLD.item_id
    )
    WHERE id = OLD.item_id;
    RETURN OLD;
  ELSE
    UPDATE storage_items
    SET average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE item_id = NEW.item_id
    )
    WHERE id = NEW.item_id;
    RETURN NEW;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in calculate_average_rating: %', SQLERRM;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."calculate_average_rating"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_storage_item_total"("item_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(owned_quantity)
     FROM public.organization_items
     WHERE storage_item_id = item_id
     AND is_active = TRUE),
    0
  );
END;
$$;


ALTER FUNCTION "public"."calculate_storage_item_total"("item_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_item_images"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'item-images'
    -- metadata->>'is_active' is stored as text, so cast it to boolean
    AND is_active = FALSE
    AND created_at < NOW() - INTERVAL '30 days';
END;
$$;


ALTER FUNCTION "public"."cleanup_item_images"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_type" "public"."notification_type", "p_title" "text", "p_message" "text" DEFAULT NULL::"text", "p_channel" "public"."notification_channel" DEFAULT 'in_app'::"public"."notification_channel", "p_severity" "public"."notification_severity" DEFAULT 'info'::"public"."notification_severity", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb", "p_idempotency_key" "text" DEFAULT "gen_random_uuid"()) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.notifications (
    user_id, type, title, message,
    channel, severity, metadata, idempotency_key
  )
  values (
    p_user_id, p_type, p_title, p_message,
    p_channel, p_severity, p_metadata, p_idempotency_key
  )
  on conflict (idempotency_key) do nothing; -- exactly-once
end;
$$;


ALTER FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_type" "public"."notification_type", "p_title" "text", "p_message" "text", "p_channel" "public"."notification_channel", "p_severity" "public"."notification_severity", "p_metadata" "jsonb", "p_idempotency_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_organization_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Generate slug from name
  NEW.slug := generate_slug(NEW.name);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_organization_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_slug"("input_text" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        TRIM(input_text),
        '[^a-zA-Z0-9\s-]', '', 'g'  -- Remove special characters
      ),
      '\s+', '-', 'g'  -- Replace spaces with hyphens
    )
  );
END;
$$;


ALTER FUNCTION "public"."generate_slug"("input_text" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_full_bookings"("in_offset" integer, "in_limit" integer) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$declare
  safe_offset integer := greatest(in_offset, 0);
  safe_limit integer := least(greatest(in_limit, 1), 1000);
  total_count integer;
  result jsonb;
begin
  -- Count total bookings
  select count(*) into total_count
  from bookings;

  -- Build JSON result
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
      'payment_status', o.payment_status,
      'notes', o.notes,
      'payment_details', o.payment_details,
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
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal,
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
end;$$;


ALTER FUNCTION "public"."get_all_full_bookings"("in_offset" integer, "in_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_full_orders"("in_offset" integer DEFAULT 0, "in_limit" integer DEFAULT 20) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
declare
  safe_offset integer := greatest(in_offset, 0);
  safe_limit integer := least(greatest(in_limit, 1), 1000);
  total_count integer;
  result jsonb;
begin
  -- Count total orders
  select count(*) into total_count
  from orders;

  -- Build JSON result
  select jsonb_build_object(
    'total_count', total_count,
    'orders', coalesce(jsonb_agg(order_data), '[]'::jsonb)
  )
  into result
  from (
    select jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'user_id', o.user_id,
      'status', o.status,
      'total_amount', o.total_amount,
      'discount_amount', o.discount_amount,
      'discount_code', o.discount_code,
      'final_amount', o.final_amount,
      'payment_status', o.payment_status,
      'notes', o.notes,
      'payment_details', o.payment_details,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'order_items', (
        select jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'order_id', oi.order_id,
            'item_id', oi.item_id,
            'start_date', oi.start_date,
            'end_date', oi.end_date,
            'total_days', oi.total_days,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal,
            'created_at', oi.created_at,
            'storage_items', jsonb_build_object(
              'translations', si.translations,
              'location_id', si.location_id
            )
          )
        )
        from order_items oi
        left join storage_items si on oi.item_id = si.id
        where oi.order_id = o.id
      )
    ) as order_data
    from orders o
    order by o.created_at desc
    offset safe_offset
    limit safe_limit
  ) t;

  return result;
end;
$$;


ALTER FUNCTION "public"."get_all_full_orders"("in_offset" integer, "in_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_full_booking"("booking_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$declare
  result jsonb;
begin
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
      'payment_status', o.payment_status,
      'notes', o.notes,
      'payment_details', o.payment_details,
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
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal,
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
end;$$;


ALTER FUNCTION "public"."get_full_booking"("booking_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_full_order"("order_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$declare
  result jsonb;
begin
  select jsonb_build_object(
    'orders', jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'user_id', o.user_id,
      'status', o.status,
      'total_amount', o.total_amount,
      'discount_amount', o.discount_amount,
      'discount_code', o.discount_code,
      'final_amount', o.final_amount,
      'payment_status', o.payment_status,
      'notes', o.notes,
      'payment_details', o.payment_details,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'order_items', (
        select jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'item_id', oi.item_id,
            'start_date', oi.start_date,
            'end_date', oi.end_date,
            'total_days', oi.total_days,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal,
            'created_at', oi.created_at,
            'location_id', oi.location_id,
            'translations', si.translations,
            'location_name', sl.name
          )
        )
        from order_items oi
        left join storage_items si on oi.item_id = si.id
        left join storage_locations sl on si.location_id = sl.id
        where oi.order_id = o.id
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
  from orders o
  where o.id = order_id;

  -- Raise error if result is null
  if result is null then
    raise exception 'No order found with id: %', order_id;
  end if;

  return result;
end;$$;


ALTER FUNCTION "public"."get_full_order"("order_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_full_user_booking"("in_user_id" "uuid", "in_offset" integer, "in_limit" integer) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$declare
  safe_offset integer := greatest(in_offset, 0);
  safe_limit integer := least(greatest(in_limit, 1), 1000);
  result jsonb;
  total_count integer;
begin
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
      'payment_status', o.payment_status,
      'notes', o.notes,
      'payment_details', o.payment_details,
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
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal,
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
end;$$;


ALTER FUNCTION "public"."get_full_user_booking"("in_user_id" "uuid", "in_offset" integer, "in_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_full_user_order"("in_user_id" "uuid", "in_offset" integer DEFAULT 0, "in_limit" integer DEFAULT 20) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
declare
  safe_offset integer := greatest(in_offset, 0);
  safe_limit integer := least(greatest(in_limit, 1), 1000);
  result jsonb;
  total_count integer;
begin
  -- Get total count of user's orders
  select count(*) into total_count
  from orders
  where user_id = in_user_id;

  -- Get paginated orders with safe offset & limit
  select jsonb_build_object(
    'total_count', total_count,
    'orders', coalesce(jsonb_agg(order_data), '[]'::jsonb)
  )
  into result
  from (
    select jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'user_id', o.user_id,
      'status', o.status,
      'total_amount', o.total_amount,
      'discount_amount', o.discount_amount,
      'discount_code', o.discount_code,
      'final_amount', o.final_amount,
      'payment_status', o.payment_status,
      'notes', o.notes,
      'payment_details', o.payment_details,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'order_items', (
        select jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'order_id', oi.order_id,
            'item_id', oi.item_id,
            'start_date', oi.start_date,
            'end_date', oi.end_date,
            'total_days', oi.total_days,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal,
            'created_at', oi.created_at,
            'storage_items', jsonb_build_object(
              'translations', si.translations,
              'location_id', si.location_id
            )
          )
        )
        from order_items oi
        left join storage_items si on oi.item_id = si.id
        where oi.order_id = o.id
      )
    ) as order_data
    from orders o
    where o.user_id = in_user_id
    order by o.created_at desc
    offset safe_offset
    limit safe_limit
  ) t;

  return result;
end;
$$;


ALTER FUNCTION "public"."get_full_user_order"("in_user_id" "uuid", "in_offset" integer, "in_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_latest_ban_record"("check_user_id" "uuid") RETURNS TABLE("id" "uuid", "ban_type" character varying, "action" character varying, "ban_reason" "text", "is_permanent" boolean, "banned_by" "uuid", "banned_at" timestamp with time zone, "unbanned_at" timestamp with time zone, "organization_id" "uuid", "role_assignment_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ubh.id,
    ubh.ban_type,
    ubh.action,
    ubh.ban_reason,
    ubh.is_permanent,
    ubh.banned_by,
    ubh.banned_at,
    ubh.unbanned_at,
    ubh.organization_id,
    ubh.role_assignment_id
  FROM user_ban_history ubh
  WHERE ubh.user_id = check_user_id
  ORDER BY ubh.created_at DESC
  LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."get_latest_ban_record"("check_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_request_user_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE
    AS $$
  select current_setting('request.jwt.claim.sub', true)::uuid;
$$;


ALTER FUNCTION "public"."get_request_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_table_columns"("input_table_name" "text") RETURNS TABLE("column_name" "text", "data_type" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return query
  select 
    c.column_name::text, 
    c.data_type::text
  from information_schema.columns c
  where c.table_name = input_table_name
  order by c.ordinal_position;
end;
$$;


ALTER FUNCTION "public"."get_table_columns"("input_table_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_roles"("user_uuid" "uuid") RETURNS TABLE("id" "uuid", "user_id" "uuid", "organization_id" "uuid", "role_id" "uuid", "is_active" boolean, "created_at" timestamp with time zone, "role_name" "text", "organization_name" "text", "organization_slug" "text")
    LANGUAGE "sql" STABLE
    AS $$
  SELECT 
    uor.id,
    uor.user_id,
    uor.organization_id,
    uor.role_id,
    uor.is_active,
    uor.created_at,
    r.role as role_name,
    o.name as organization_name,
    o.slug as organization_slug
  FROM user_organization_roles uor
  INNER JOIN roles r ON uor.role_id = r.id
  INNER JOIN organizations o ON uor.organization_id = o.id
  WHERE uor.user_id = user_uuid
    AND uor.is_active = true
  ORDER BY uor.created_at DESC;
$$;


ALTER FUNCTION "public"."get_user_roles"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("p_user_id" "uuid", "p_org_id" "uuid" DEFAULT NULL::"uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.user_organization_roles uor
    join public.roles r on r.id = uor.role_id
    where uor.user_id   = p_user_id
      and uor.is_active = true
      and r.role        = 'admin'           -- ⚠️ make sure the literal matches your roles_type enum
      and (p_org_id is null or uor.organization_id = p_org_id)
  );
$$;


ALTER FUNCTION "public"."is_admin"("p_user_id" "uuid", "p_org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_user_banned_for_app"("check_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM user_organization_roles 
    WHERE user_id = check_user_id 
      AND is_active = TRUE
  );
END;
$$;


ALTER FUNCTION "public"."is_user_banned_for_app"("check_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_user_banned_for_org"("check_user_id" "uuid", "check_org_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM user_organization_roles 
    WHERE user_id = check_user_id 
      AND organization_id = check_org_id 
      AND is_active = TRUE
  );
END;
$$;


ALTER FUNCTION "public"."is_user_banned_for_org"("check_user_id" "uuid", "check_org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_user_banned_for_role"("check_user_id" "uuid", "check_org_id" "uuid", "check_role_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_organization_roles 
    WHERE user_id = check_user_id 
      AND organization_id = check_org_id 
      AND role_id = check_role_id 
      AND is_active = FALSE
  );
END;
$$;


ALTER FUNCTION "public"."is_user_banned_for_role"("check_user_id" "uuid", "check_org_id" "uuid", "check_role_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify"("p_user_id" "uuid", "p_type_txt" "text", "p_title" "text" DEFAULT ''::"text", "p_message" "text" DEFAULT ''::"text", "p_channel" "public"."notification_channel" DEFAULT 'in_app'::"public"."notification_channel", "p_severity" "public"."notification_severity" DEFAULT 'info'::"public"."notification_severity", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select public.create_notification(
    p_user_id,
    p_type_txt::notification_type,  -- single cast lives here
    p_title,
    p_message,
    p_channel,
    p_severity,
    p_metadata
  );
$$;


ALTER FUNCTION "public"."notify"("p_user_id" "uuid", "p_type_txt" "text", "p_title" "text", "p_message" "text", "p_channel" "public"."notification_channel", "p_severity" "public"."notification_severity", "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_booking_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if new.status is distinct from old.status then
    perform public.create_notification(
      new.user_id,

      case
        when new.status = 'confirmed'
          then 'booking.status_approved'::notification_type
        when new.status = 'rejected'
          then 'booking.status_rejected'::notification_type
      end,

      '', '',                                -- titles/messages from UI
      'in_app'::notification_channel,        -- 👈 explicit cast
      (case                                   -- 👈 cast both branches
         when new.status = 'confirmed'
         then 'info'::notification_severity
         else 'warning'::notification_severity
       end),
      jsonb_build_object(
        'booking_id',     new.id,
        'booking_number', new.booking_number,
        'status',         new.status
      )
    );
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."trg_booking_status_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_user_after_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  admin_id uuid;
begin
  for admin_id in
    select distinct uor.user_id
    from public.user_organization_roles uor
    join public.roles r on r.id = uor.role_id
    where r.role = 'admin' and uor.is_active
  loop
    perform public.create_notification(
      admin_id,
      'user.created'::notification_type,
      '', '',
      'in_app'::notification_channel,        -- 👈 cast
      'info'::notification_severity,         -- 👈 cast
      jsonb_build_object(
        'new_user_id', new.id,
        'email',       new.email
      )
    );
  end loop;
  return new;
end;
$$;


ALTER FUNCTION "public"."trg_user_after_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_booking_amounts"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  total_sum DECIMAL;
BEGIN
  -- Handle DELETE operation differently
  IF TG_OP = 'DELETE' THEN
    SELECT COALESCE(SUM(subtotal), 0) INTO total_sum
    FROM booking_items
    WHERE booking_id = OLD.booking_id;
    
    UPDATE bookings
    SET 
      total_amount = total_sum,
      final_amount = total_sum - COALESCE(discount_amount, 0)
    WHERE id = OLD.booking_id;
    RETURN OLD;
  ELSE
    SELECT COALESCE(SUM(subtotal), 0) INTO total_sum
    FROM booking_items
    WHERE booking_id = NEW.booking_id;
    
    UPDATE bookings
    SET
      total_amount = total_sum,
      final_amount = total_sum - COALESCE(discount_amount, 0)
    WHERE id = NEW.booking_id;
    RETURN NEW;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in update_booking_amounts: %', SQLERRM;
    RETURN NULL;
END;$$;


ALTER FUNCTION "public"."update_booking_amounts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_item_availability"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  RAISE WARNING 'Trigger fired. Operation: %', TG_OP;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    RAISE WARNING 'NEW.status: %, OLD.status: %', NEW.status, OLD.status;

    -- Wenn Bestellung bestätigt wird
    IF NEW.status = 'picked_up' AND (OLD.status IS DISTINCT FROM 'picked_up') THEN
      RAISE WARNING 'Confirmed item. Subtracting quantity % from item_id %', NEW.quantity, NEW.item_id;

      UPDATE storage_items
      SET items_number_available = items_number_available - NEW.quantity
      WHERE id = NEW.item_id AND items_number_available >= NEW.quantity;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Not enough available items for storage item %', NEW.item_id;
      END IF;
    END IF;

    -- Wenn Bestellung auf 'cancelled' wechselt und vorher NICHT 'cancelled' war
    IF NEW.status = 'returned' AND (OLD.status IS DISTINCT FROM 'returned') THEN
      RAISE WARNING 'Cancelled item. Adding quantity % back to item_id %', NEW.quantity, NEW.item_id;

      UPDATE storage_items
      SET items_number_available = items_number_available + NEW.quantity
      WHERE id = NEW.item_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    RAISE WARNING 'Deleted item. Adding quantity % back to item_id %', OLD.quantity, OLD.item_id;

    UPDATE storage_items
    SET items_number_available = items_number_available + OLD.quantity
    WHERE id = OLD.item_id;
  END IF;

  RETURN COALESCE(NEW, OLD);

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Trigger error: %', SQLERRM;
    RETURN NULL;
END;$$;


ALTER FUNCTION "public"."update_item_availability"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_storage_item_totals"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.storage_items
    SET items_number_total = calculate_storage_item_total(NEW.storage_item_id)
    WHERE id = NEW.storage_item_id;
  END IF;

  -- Handle DELETE and UPDATE (when storage_item_id changes)
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.storage_item_id != NEW.storage_item_id) THEN
    UPDATE public.storage_items
    SET items_number_total = calculate_storage_item_total(OLD.storage_item_id)
    WHERE id = OLD.storage_item_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_storage_item_totals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "table_name" character varying NOT NULL,
    "record_id" "uuid" NOT NULL,
    "action" character varying NOT NULL,
    "user_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "audit_logs_action_check" CHECK ((("action")::"text" = ANY ((ARRAY['insert'::character varying, 'update'::character varying, 'delete'::character varying])::"text"[])))
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."booking_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "unit_price" numeric,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "total_days" integer NOT NULL,
    "subtotal" numeric,
    "status" character varying NOT NULL,
    "location_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "provider_organization_id" "uuid",
    CONSTRAINT "order_items_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('pending'::character varying)::"text", ('confirmed'::character varying)::"text", ('cancelled'::character varying)::"text", ('picked_up'::character varying)::"text", ('returned'::character varying)::"text"])))
);


ALTER TABLE "public"."booking_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "booking_number" character varying NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" character varying NOT NULL,
    "total_amount" numeric,
    "discount_amount" numeric DEFAULT 0,
    "discount_code" character varying,
    "final_amount" numeric,
    "payment_status" character varying,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "payment_details" "jsonb",
    CONSTRAINT "orders_payment_status_check" CHECK ((("payment_status")::"text" = ANY (ARRAY[('invoice-sent'::character varying)::"text", ('partial'::character varying)::"text", ('overdue'::character varying)::"text", ('payment-rejected'::character varying)::"text", ('paid'::character varying)::"text", ('refunded'::character varying)::"text"]))),
    CONSTRAINT "orders_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('pending'::character varying)::"text", ('confirmed'::character varying)::"text", ('paid'::character varying)::"text", ('completed'::character varying)::"text", ('deleted'::character varying)::"text", ('rejected'::character varying)::"text", ('cancelled'::character varying)::"text", ('cancelled by admin'::character varying)::"text", ('cancelled by user'::character varying)::"text", ('refunded'::character varying)::"text"])))
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoice_number" "text" NOT NULL,
    "order_id" "uuid",
    "user_id" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "due_date" "date",
    "reference_number" "text",
    "total_amount" numeric,
    "pdf_url" "text"
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "delivered_at" timestamp with time zone,
    "read_at" timestamp with time zone,
    "type" "public"."notification_type" NOT NULL,
    "severity" "public"."notification_severity" DEFAULT 'info'::"public"."notification_severity" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text",
    "channel" "public"."notification_channel" DEFAULT 'in_app'::"public"."notification_channel" NOT NULL,
    "metadata" "jsonb",
    "idempotency_key" "text" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "storage_item_id" "uuid" NOT NULL,
    "owned_quantity" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "storage_location_id" "uuid" NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    CONSTRAINT "positive_quantity" CHECK (("owned_quantity" >= 0))
);


ALTER TABLE "public"."organization_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_locations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "storage_location_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organization_locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" character varying NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "is_deleted" boolean DEFAULT false
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "payment_method" character varying NOT NULL,
    "transaction_id" character varying,
    "status" character varying NOT NULL,
    "payment_date" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb",
    CONSTRAINT "payments_payment_method_check" CHECK ((("payment_method")::"text" = ANY ((ARRAY['credit_card'::character varying, 'bank_transfer'::character varying, 'cash'::character varying, 'paypal'::character varying])::"text"[]))),
    CONSTRAINT "payments_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying])::"text"[])))
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."promotions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "code" character varying NOT NULL,
    "description" character varying NOT NULL,
    "discount_type" character varying NOT NULL,
    "discount_value" numeric NOT NULL,
    "min_order_amount" numeric,
    "max_discount" numeric,
    "starts_at" timestamp with time zone NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "usage_limit" integer,
    "times_used" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "owner_organization_id" "uuid",
    CONSTRAINT "promotions_discount_type_check" CHECK ((("discount_type")::"text" = ANY ((ARRAY['percentage'::character varying, 'fixed_amount'::character varying])::"text"[])))
);


ALTER TABLE "public"."promotions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "review_text" "text",
    "is_verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "role" "public"."roles_type" NOT NULL
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_list_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "list_id" "uuid" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"(),
    "notes" "text"
);


ALTER TABLE "public"."saved_list_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_lists" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" character varying NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."saved_lists" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."storage_analytics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "location_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "total_bookings" integer DEFAULT 0,
    "total_revenue" numeric DEFAULT 0,
    "occupancy_rate" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."storage_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."storage_compartments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "translations" "jsonb"
);


ALTER TABLE "public"."storage_compartments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."storage_images" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "location_id" "uuid" NOT NULL,
    "image_url" character varying NOT NULL,
    "image_type" character varying NOT NULL,
    "display_order" integer NOT NULL,
    "alt_text" character varying,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "storage_images_image_type_check" CHECK ((("image_type")::"text" = ANY ((ARRAY['main'::character varying, 'thumbnail'::character varying, 'detail'::character varying])::"text"[])))
);


ALTER TABLE "public"."storage_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."storage_item_images" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "item_id" "uuid" NOT NULL,
    "image_url" character varying NOT NULL,
    "image_type" character varying NOT NULL,
    "display_order" integer NOT NULL,
    "alt_text" character varying,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "storage_path" character varying NOT NULL,
    CONSTRAINT "storage_item_images_image_type_check" CHECK ((("image_type")::"text" = ANY ((ARRAY['main'::character varying, 'thumbnail'::character varying, 'detail'::character varying])::"text"[])))
);


ALTER TABLE "public"."storage_item_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."storage_item_tags" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "item_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "translations" "jsonb"
);


ALTER TABLE "public"."storage_item_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."storage_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "location_id" "uuid" NOT NULL,
    "compartment_id" "uuid",
    "items_number_total" numeric NOT NULL,
    "price" numeric NOT NULL,
    "average_rating" numeric DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "translations" "jsonb",
    "items_number_currently_in_storage" numeric,
    "is_deleted" boolean DEFAULT false
);


ALTER TABLE "public"."storage_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."storage_locations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying NOT NULL,
    "description" character varying,
    "address" character varying NOT NULL,
    "latitude" numeric,
    "longitude" numeric,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true,
    "image_url" character varying
);


ALTER TABLE "public"."storage_locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."storage_working_hours" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "location_id" "uuid" NOT NULL,
    "day" character varying NOT NULL,
    "open_time" time without time zone NOT NULL,
    "close_time" time without time zone NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "storage_working_hours_day_check" CHECK ((("day")::"text" = ANY ((ARRAY['monday'::character varying, 'tuesday'::character varying, 'wednesday'::character varying, 'thursday'::character varying, 'friday'::character varying, 'saturday'::character varying, 'sunday'::character varying])::"text"[])))
);


ALTER TABLE "public"."storage_working_hours" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "translations" "jsonb"
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."test" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."test" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."test_features" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "feature_name" character varying(255) NOT NULL,
    "description" "text",
    "is_enabled" boolean DEFAULT false,
    "test_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."test_features" OWNER TO "postgres";


ALTER TABLE "public"."test" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."test_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_addresses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "address_type" character varying NOT NULL,
    "street_address" character varying NOT NULL,
    "city" character varying NOT NULL,
    "postal_code" character varying NOT NULL,
    "country" character varying NOT NULL,
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_addresses_address_type_check" CHECK ((("address_type")::"text" = ANY ((ARRAY['billing'::character varying, 'shipping'::character varying, 'both'::character varying])::"text"[])))
);


ALTER TABLE "public"."user_addresses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_ban_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "banned_by" "uuid" NOT NULL,
    "ban_type" character varying NOT NULL,
    "action" character varying NOT NULL,
    "ban_reason" "text",
    "is_permanent" boolean DEFAULT false,
    "role_assignment_id" "uuid",
    "organization_id" "uuid",
    "affected_assignments" "jsonb",
    "banned_at" timestamp with time zone DEFAULT "now"(),
    "unbanned_at" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_ban_history_action_check" CHECK ((("action")::"text" = ANY ((ARRAY['banned'::character varying, 'unbanned'::character varying])::"text"[]))),
    CONSTRAINT "user_ban_history_ban_type_check" CHECK ((("ban_type")::"text" = ANY ((ARRAY['banForRole'::character varying, 'banForOrg'::character varying, 'banForApp'::character varying])::"text"[])))
);


ALTER TABLE "public"."user_ban_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_organization_roles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."user_organization_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" NOT NULL,
    "full_name" character varying,
    "visible_name" character varying,
    "phone" character varying,
    "email" character varying,
    "saved_lists" "jsonb",
    "preferences" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "role" "text",
    "profile_picture_url" "text"
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "profile_id" "uuid" NOT NULL,
    "role" "public"."role_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text")
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user_roles"."created_at" IS 'Date string of when the role was created.';



CREATE OR REPLACE VIEW "public"."view_bookings_with_user_info" AS
 SELECT "b"."total_amount",
    "b"."id",
    "b"."status",
    "b"."payment_status",
    "b"."created_at",
    "b"."final_amount",
    "b"."booking_number",
    ("b"."created_at")::"text" AS "created_at_text",
    ("b"."final_amount")::"text" AS "final_amount_text",
    "u"."full_name",
    "u"."visible_name",
    "u"."email",
    "u"."id" AS "user_id"
   FROM ("public"."bookings" "b"
     JOIN "public"."user_profiles" "u" ON (("b"."user_id" = "u"."id")));


ALTER TABLE "public"."view_bookings_with_user_info" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_item_location_summary" AS
 SELECT "si"."id" AS "storage_item_id",
    (("si"."translations" -> 'en'::"text") ->> 'item_name'::"text") AS "item_name",
    "sl"."name" AS "location_name",
    "sum"("eoi"."owned_quantity") AS "total_at_location",
    "count"(DISTINCT "eoi"."organization_id") AS "organizations_count",
    "string_agg"((("org"."name" || ': '::"text") || ("eoi"."owned_quantity")::"text"), ', '::"text" ORDER BY "org"."name") AS "organization_breakdown"
   FROM ((("public"."storage_items" "si"
     JOIN "public"."organization_items" "eoi" ON (("si"."id" = "eoi"."storage_item_id")))
     JOIN "public"."organizations" "org" ON (("eoi"."organization_id" = "org"."id")))
     JOIN "public"."storage_locations" "sl" ON (("eoi"."storage_location_id" = "sl"."id")))
  WHERE ("eoi"."is_active" = true)
  GROUP BY "si"."id", "si"."translations", "sl"."id", "sl"."name"
  ORDER BY (("si"."translations" -> 'en'::"text") ->> 'item_name'::"text"), "sl"."name";


ALTER TABLE "public"."view_item_location_summary" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_item_ownership_summary" AS
 SELECT "si"."id" AS "storage_item_id",
    (("si"."translations" -> 'en'::"text") ->> 'item_name'::"text") AS "item_name",
    "sl"."name" AS "location_name",
    "org"."name" AS "organization_name",
    "eoi"."owned_quantity",
    "si"."items_number_total" AS "total_across_all_locations",
    "location_totals"."location_total"
   FROM (((("public"."storage_items" "si"
     JOIN "public"."organization_items" "eoi" ON (("si"."id" = "eoi"."storage_item_id")))
     JOIN "public"."organizations" "org" ON (("eoi"."organization_id" = "org"."id")))
     JOIN "public"."storage_locations" "sl" ON (("eoi"."storage_location_id" = "sl"."id")))
     LEFT JOIN ( SELECT "organization_items"."storage_item_id",
            "organization_items"."storage_location_id",
            "sum"("organization_items"."owned_quantity") AS "location_total"
           FROM "public"."organization_items"
          WHERE ("organization_items"."is_active" = true)
          GROUP BY "organization_items"."storage_item_id", "organization_items"."storage_location_id") "location_totals" ON ((("si"."id" = "location_totals"."storage_item_id") AND ("eoi"."storage_location_id" = "location_totals"."storage_location_id"))))
  WHERE ("eoi"."is_active" = true)
  ORDER BY (("si"."translations" -> 'en'::"text") ->> 'item_name'::"text"), "sl"."name", "org"."name";


ALTER TABLE "public"."view_item_ownership_summary" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_manage_storage_items" AS
SELECT
    NULL::"text" AS "fi_item_name",
    NULL::"text" AS "fi_item_type",
    NULL::"text" AS "en_item_name",
    NULL::"text" AS "en_item_type",
    NULL::"jsonb" AS "translations",
    NULL::"uuid" AS "id",
    NULL::numeric AS "items_number_total",
    NULL::numeric AS "price",
    NULL::timestamp with time zone AS "created_at",
    NULL::boolean AS "is_active",
    NULL::"uuid" AS "location_id",
    NULL::character varying AS "location_name",
    NULL::"uuid"[] AS "tag_ids",
    NULL::"jsonb"[] AS "tag_translations",
    NULL::numeric AS "items_number_currently_in_storage",
    NULL::boolean AS "is_deleted",
    NULL::"uuid" AS "organization_id";


ALTER TABLE "public"."view_manage_storage_items" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_user_ban_status" AS
 SELECT "up"."id",
    "up"."email",
    "up"."full_name",
    "up"."visible_name",
    "up"."created_at" AS "user_created_at",
    COALESCE("active_roles"."count", (0)::bigint) AS "active_roles_count",
    COALESCE("inactive_roles"."count", (0)::bigint) AS "inactive_roles_count",
        CASE
            WHEN (COALESCE("active_roles"."count", (0)::bigint) = 0) THEN 'banned_app'::"text"
            WHEN (COALESCE("inactive_roles"."count", (0)::bigint) > 0) THEN 'partially_banned'::"text"
            ELSE 'active'::"text"
        END AS "ban_status",
    "latest_ban"."ban_type" AS "latest_ban_type",
    "latest_ban"."action" AS "latest_action",
    "latest_ban"."ban_reason",
    "latest_ban"."is_permanent",
    "latest_ban"."banned_by",
    "latest_ban"."banned_at",
    "latest_ban"."unbanned_at",
    "banned_by_user"."full_name" AS "banned_by_name",
    "banned_by_user"."email" AS "banned_by_email"
   FROM (((("public"."user_profiles" "up"
     LEFT JOIN ( SELECT "user_organization_roles"."user_id",
            "count"(*) AS "count"
           FROM "public"."user_organization_roles"
          WHERE ("user_organization_roles"."is_active" = true)
          GROUP BY "user_organization_roles"."user_id") "active_roles" ON (("up"."id" = "active_roles"."user_id")))
     LEFT JOIN ( SELECT "user_organization_roles"."user_id",
            "count"(*) AS "count"
           FROM "public"."user_organization_roles"
          WHERE ("user_organization_roles"."is_active" = false)
          GROUP BY "user_organization_roles"."user_id") "inactive_roles" ON (("up"."id" = "inactive_roles"."user_id")))
     LEFT JOIN LATERAL ( SELECT "get_latest_ban_record"."id",
            "get_latest_ban_record"."ban_type",
            "get_latest_ban_record"."action",
            "get_latest_ban_record"."ban_reason",
            "get_latest_ban_record"."is_permanent",
            "get_latest_ban_record"."banned_by",
            "get_latest_ban_record"."banned_at",
            "get_latest_ban_record"."unbanned_at",
            "get_latest_ban_record"."organization_id",
            "get_latest_ban_record"."role_assignment_id"
           FROM "public"."get_latest_ban_record"("up"."id") "get_latest_ban_record"("id", "ban_type", "action", "ban_reason", "is_permanent", "banned_by", "banned_at", "unbanned_at", "organization_id", "role_assignment_id")) "latest_ban" ON (true))
     LEFT JOIN "public"."user_profiles" "banned_by_user" ON (("latest_ban"."banned_by" = "banned_by_user"."id")));


ALTER TABLE "public"."view_user_ban_status" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_user_roles_with_details" AS
 SELECT "uor"."id",
    "uor"."user_id",
    "uor"."organization_id",
    "uor"."role_id",
    "uor"."is_active",
    "uor"."created_at" AS "assigned_at",
    "uor"."updated_at" AS "assignment_updated_at",
    "up"."email" AS "user_email",
    "up"."full_name" AS "user_full_name",
    "up"."visible_name" AS "user_visible_name",
    "up"."phone" AS "user_phone",
    "r"."role" AS "role_name",
    "o"."name" AS "organization_name",
    "o"."is_active" AS "organization_is_active"
   FROM ((("public"."user_organization_roles" "uor"
     JOIN "public"."user_profiles" "up" ON (("uor"."user_id" = "up"."id")))
     JOIN "public"."roles" "r" ON (("uor"."role_id" = "r"."id")))
     JOIN "public"."organizations" "o" ON (("uor"."organization_id" = "o"."id")));


ALTER TABLE "public"."view_user_roles_with_details" OWNER TO "postgres";


ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_items"
    ADD CONSTRAINT "erm_organization_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_locations"
    ADD CONSTRAINT "erm_organization_locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "erm_organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "erm_organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."user_organization_roles"
    ADD CONSTRAINT "erm_user_organization_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_invoice_number_key" UNIQUE ("invoice_number");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_idempotency_key_key" UNIQUE ("idempotency_key");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."booking_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("booking_number");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promotions"
    ADD CONSTRAINT "promotions_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."promotions"
    ADD CONSTRAINT "promotions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_role_key" UNIQUE ("role");



ALTER TABLE ONLY "public"."saved_list_items"
    ADD CONSTRAINT "saved_list_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_lists"
    ADD CONSTRAINT "saved_lists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storage_analytics"
    ADD CONSTRAINT "storage_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storage_compartments"
    ADD CONSTRAINT "storage_compartments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storage_images"
    ADD CONSTRAINT "storage_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storage_item_images"
    ADD CONSTRAINT "storage_item_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storage_item_tags"
    ADD CONSTRAINT "storage_item_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storage_items"
    ADD CONSTRAINT "storage_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storage_locations"
    ADD CONSTRAINT "storage_locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storage_working_hours"
    ADD CONSTRAINT "storage_working_hours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."test_features"
    ADD CONSTRAINT "test_features_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."test"
    ADD CONSTRAINT "test_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_items"
    ADD CONSTRAINT "unique_org_item_location" UNIQUE ("organization_id", "storage_item_id", "storage_location_id");



ALTER TABLE ONLY "public"."organization_locations"
    ADD CONSTRAINT "unique_org_location" UNIQUE ("organization_id", "storage_location_id");



ALTER TABLE ONLY "public"."user_organization_roles"
    ADD CONSTRAINT "unique_user_org_role" UNIQUE ("user_id", "organization_id", "role_id");



ALTER TABLE ONLY "public"."user_addresses"
    ADD CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_ban_history"
    ADD CONSTRAINT "user_ban_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("profile_id");



CREATE INDEX "idx_order_items_order" ON "public"."booking_items" USING "btree" ("booking_id");



CREATE INDEX "idx_orders_user" ON "public"."bookings" USING "btree" ("user_id");



CREATE INDEX "idx_payments_order" ON "public"."payments" USING "btree" ("booking_id");



CREATE INDEX "idx_reviews_item" ON "public"."reviews" USING "btree" ("item_id");



CREATE INDEX "idx_storage_items_location" ON "public"."storage_items" USING "btree" ("location_id");



CREATE INDEX "idx_storage_items_translations" ON "public"."storage_items" USING "gin" ("translations");



CREATE INDEX "idx_tags_translations" ON "public"."tags" USING "gin" ("translations");



CREATE INDEX "idx_user_ban_history_action" ON "public"."user_ban_history" USING "btree" ("action");



CREATE INDEX "idx_user_ban_history_ban_type" ON "public"."user_ban_history" USING "btree" ("ban_type");



CREATE INDEX "idx_user_ban_history_banned_at" ON "public"."user_ban_history" USING "btree" ("banned_at");



CREATE INDEX "idx_user_ban_history_banned_by" ON "public"."user_ban_history" USING "btree" ("banned_by");



CREATE INDEX "idx_user_ban_history_organization_id" ON "public"."user_ban_history" USING "btree" ("organization_id");



CREATE INDEX "idx_user_ban_history_role_assignment_id" ON "public"."user_ban_history" USING "btree" ("role_assignment_id");



CREATE INDEX "idx_user_ban_history_user_id" ON "public"."user_ban_history" USING "btree" ("user_id");



CREATE INDEX "idx_user_org_roles_user_active" ON "public"."user_organization_roles" USING "btree" ("user_id", "is_active") INCLUDE ("role_id", "organization_id");



CREATE INDEX "storage_analytics_location_date_idx" ON "public"."storage_analytics" USING "btree" ("location_id", "date");



CREATE INDEX "test_features_feature_name_idx" ON "public"."test_features" USING "btree" ("feature_name");



CREATE OR REPLACE VIEW "public"."view_manage_storage_items" AS
 SELECT (("s"."translations" -> 'fi'::"text") ->> 'item_name'::"text") AS "fi_item_name",
    (("s"."translations" -> 'fi'::"text") ->> 'item_type'::"text") AS "fi_item_type",
    (("s"."translations" -> 'en'::"text") ->> 'item_name'::"text") AS "en_item_name",
    (("s"."translations" -> 'en'::"text") ->> 'item_type'::"text") AS "en_item_type",
    "s"."translations",
    "o"."storage_item_id" AS "id",
    "s"."items_number_total",
    "s"."price",
    "s"."created_at",
    "s"."is_active",
    "s"."location_id",
    "l"."name" AS "location_name",
    "array_agg"("t"."tag_id") AS "tag_ids",
    "array_agg"("g"."translations") AS "tag_translations",
    "s"."items_number_currently_in_storage",
    "o"."is_deleted",
    "o"."organization_id"
   FROM (((("public"."organization_items" "o"
     JOIN "public"."storage_items" "s" ON (("o"."storage_item_id" = "s"."id")))
     JOIN "public"."storage_locations" "l" ON (("s"."location_id" = "l"."id")))
     LEFT JOIN "public"."storage_item_tags" "t" ON (("s"."id" = "t"."item_id")))
     LEFT JOIN "public"."tags" "g" ON (("t"."tag_id" = "g"."id")))
  GROUP BY "s"."id", "s"."translations", "s"."items_number_total", "s"."price", "s"."is_active", "l"."name", "s"."items_number_currently_in_storage", "o"."is_deleted", "o"."organization_id", "o"."storage_item_id";



CREATE OR REPLACE TRIGGER "audit_booking_items_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."booking_items" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_func"();



CREATE OR REPLACE TRIGGER "audit_bookings_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_func"();



CREATE OR REPLACE TRIGGER "audit_payments_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_func"();



CREATE OR REPLACE TRIGGER "audit_storage_items_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."storage_items" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_func"();



CREATE OR REPLACE TRIGGER "audit_user_ban_history_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."user_ban_history" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_func"();



CREATE OR REPLACE TRIGGER "booking_after_update" AFTER UPDATE ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."trg_booking_status_change"();



CREATE OR REPLACE TRIGGER "generate_organizations_slug_trigger" BEFORE INSERT OR UPDATE OF "name" ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."generate_organization_slug"();



CREATE OR REPLACE TRIGGER "update_average_rating_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_average_rating"();



CREATE OR REPLACE TRIGGER "update_booking_amounts_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."booking_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_booking_amounts"();



CREATE OR REPLACE TRIGGER "update_item_availability_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."booking_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_item_availability"();



CREATE OR REPLACE TRIGGER "update_organization_items_updated_at" BEFORE UPDATE ON "public"."organization_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_organization_locations_updated_at" BEFORE UPDATE ON "public"."organization_locations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_organizations_updated_at" BEFORE UPDATE ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_storage_items_totals_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."organization_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_storage_item_totals"();



CREATE OR REPLACE TRIGGER "update_user_organization_roles_updated_at" BEFORE UPDATE ON "public"."user_organization_roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organization_items"
    ADD CONSTRAINT "erm_organization_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organization_items"
    ADD CONSTRAINT "erm_organization_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."organization_items"
    ADD CONSTRAINT "erm_organization_items_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organization_locations"
    ADD CONSTRAINT "erm_organization_locations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."organization_locations"
    ADD CONSTRAINT "erm_organization_locations_storage_location_id_fkey" FOREIGN KEY ("storage_location_id") REFERENCES "public"."storage_locations"("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "erm_organizations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "erm_organizations_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_organization_roles"
    ADD CONSTRAINT "erm_user_organization_roles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_organization_roles"
    ADD CONSTRAINT "erm_user_organization_roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."user_organization_roles"
    ADD CONSTRAINT "erm_user_organization_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id");



ALTER TABLE ONLY "public"."user_organization_roles"
    ADD CONSTRAINT "erm_user_organization_roles_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_organization_roles"
    ADD CONSTRAINT "erm_user_organization_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."bookings"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."booking_items"
    ADD CONSTRAINT "order_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."storage_items"("id");



ALTER TABLE ONLY "public"."booking_items"
    ADD CONSTRAINT "order_items_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."storage_locations"("id");



ALTER TABLE ONLY "public"."booking_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id");



ALTER TABLE ONLY "public"."booking_items"
    ADD CONSTRAINT "order_items_provider_organization_id_fkey" FOREIGN KEY ("provider_organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organization_items"
    ADD CONSTRAINT "organization_items_storage_item_id_fkey" FOREIGN KEY ("storage_item_id") REFERENCES "public"."storage_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_items"
    ADD CONSTRAINT "organization_items_storage_location_id_fkey" FOREIGN KEY ("storage_location_id") REFERENCES "public"."storage_locations"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id");



ALTER TABLE ONLY "public"."promotions"
    ADD CONSTRAINT "promotions_owner_organization_id_fkey" FOREIGN KEY ("owner_organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."storage_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."saved_list_items"
    ADD CONSTRAINT "saved_list_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."storage_items"("id");



ALTER TABLE ONLY "public"."saved_list_items"
    ADD CONSTRAINT "saved_list_items_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."saved_lists"("id");



ALTER TABLE ONLY "public"."saved_lists"
    ADD CONSTRAINT "saved_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."storage_analytics"
    ADD CONSTRAINT "storage_analytics_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."storage_locations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storage_images"
    ADD CONSTRAINT "storage_images_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."storage_locations"("id");



ALTER TABLE ONLY "public"."storage_item_images"
    ADD CONSTRAINT "storage_item_images_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."storage_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storage_item_tags"
    ADD CONSTRAINT "storage_item_tags_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."storage_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storage_item_tags"
    ADD CONSTRAINT "storage_item_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id");



ALTER TABLE ONLY "public"."storage_items"
    ADD CONSTRAINT "storage_items_compartment_id_fkey" FOREIGN KEY ("compartment_id") REFERENCES "public"."storage_compartments"("id");



ALTER TABLE ONLY "public"."storage_items"
    ADD CONSTRAINT "storage_items_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."storage_locations"("id");



ALTER TABLE ONLY "public"."storage_working_hours"
    ADD CONSTRAINT "storage_working_hours_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."storage_locations"("id");



ALTER TABLE ONLY "public"."user_addresses"
    ADD CONSTRAINT "user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_ban_history"
    ADD CONSTRAINT "user_ban_history_banned_by_fkey" FOREIGN KEY ("banned_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."user_ban_history"
    ADD CONSTRAINT "user_ban_history_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."user_ban_history"
    ADD CONSTRAINT "user_ban_history_role_assignment_id_fkey" FOREIGN KEY ("role_assignment_id") REFERENCES "public"."user_organization_roles"("id");



ALTER TABLE ONLY "public"."user_ban_history"
    ADD CONSTRAINT "user_ban_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



CREATE POLICY "User can delete own notifications" ON "public"."notifications" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "User can select own notifications" ON "public"."notifications" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "User can update own notifications" ON "public"."notifications" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promotions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_list_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_lists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storage_working_hours" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."test" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."test_features" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notifications";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT USAGE ON SCHEMA "security" TO "authenticated";
GRANT USAGE ON SCHEMA "security" TO "anon";









































































































































































































GRANT ALL ON FUNCTION "public"."audit_trigger_func"() TO "anon";
GRANT ALL ON FUNCTION "public"."audit_trigger_func"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_trigger_func"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_average_rating"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_average_rating"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_average_rating"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_storage_item_total"("item_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_storage_item_total"("item_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_storage_item_total"("item_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_item_images"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_item_images"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_item_images"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_type" "public"."notification_type", "p_title" "text", "p_message" "text", "p_channel" "public"."notification_channel", "p_severity" "public"."notification_severity", "p_metadata" "jsonb", "p_idempotency_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_type" "public"."notification_type", "p_title" "text", "p_message" "text", "p_channel" "public"."notification_channel", "p_severity" "public"."notification_severity", "p_metadata" "jsonb", "p_idempotency_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_type" "public"."notification_type", "p_title" "text", "p_message" "text", "p_channel" "public"."notification_channel", "p_severity" "public"."notification_severity", "p_metadata" "jsonb", "p_idempotency_key" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_organization_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_organization_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_organization_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_full_bookings"("in_offset" integer, "in_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_full_bookings"("in_offset" integer, "in_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_full_bookings"("in_offset" integer, "in_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_full_orders"("in_offset" integer, "in_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_full_orders"("in_offset" integer, "in_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_full_orders"("in_offset" integer, "in_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_full_booking"("booking_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_full_booking"("booking_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_full_booking"("booking_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_full_order"("order_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_full_order"("order_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_full_order"("order_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_full_user_booking"("in_user_id" "uuid", "in_offset" integer, "in_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_full_user_booking"("in_user_id" "uuid", "in_offset" integer, "in_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_full_user_booking"("in_user_id" "uuid", "in_offset" integer, "in_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_full_user_order"("in_user_id" "uuid", "in_offset" integer, "in_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_full_user_order"("in_user_id" "uuid", "in_offset" integer, "in_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_full_user_order"("in_user_id" "uuid", "in_offset" integer, "in_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_latest_ban_record"("check_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_latest_ban_record"("check_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_latest_ban_record"("check_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_request_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_request_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_request_user_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_table_columns"("input_table_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_table_columns"("input_table_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_table_columns"("input_table_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_roles"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_roles"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_roles"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("p_user_id" "uuid", "p_org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("p_user_id" "uuid", "p_org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("p_user_id" "uuid", "p_org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_banned_for_app"("check_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_banned_for_app"("check_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_banned_for_app"("check_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_banned_for_org"("check_user_id" "uuid", "check_org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_banned_for_org"("check_user_id" "uuid", "check_org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_banned_for_org"("check_user_id" "uuid", "check_org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_banned_for_role"("check_user_id" "uuid", "check_org_id" "uuid", "check_role_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_banned_for_role"("check_user_id" "uuid", "check_org_id" "uuid", "check_role_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_banned_for_role"("check_user_id" "uuid", "check_org_id" "uuid", "check_role_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."notify"("p_user_id" "uuid", "p_type_txt" "text", "p_title" "text", "p_message" "text", "p_channel" "public"."notification_channel", "p_severity" "public"."notification_severity", "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."notify"("p_user_id" "uuid", "p_type_txt" "text", "p_title" "text", "p_message" "text", "p_channel" "public"."notification_channel", "p_severity" "public"."notification_severity", "p_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify"("p_user_id" "uuid", "p_type_txt" "text", "p_title" "text", "p_message" "text", "p_channel" "public"."notification_channel", "p_severity" "public"."notification_severity", "p_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_booking_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_booking_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_booking_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_user_after_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_user_after_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_user_after_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_booking_amounts"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_booking_amounts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_booking_amounts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_item_availability"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_item_availability"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_item_availability"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_storage_item_totals"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_storage_item_totals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_storage_item_totals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";
























GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."booking_items" TO "anon";
GRANT ALL ON TABLE "public"."booking_items" TO "authenticated";
GRANT ALL ON TABLE "public"."booking_items" TO "service_role";



GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."organization_items" TO "anon";
GRANT ALL ON TABLE "public"."organization_items" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_items" TO "service_role";



GRANT ALL ON TABLE "public"."organization_locations" TO "anon";
GRANT ALL ON TABLE "public"."organization_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_locations" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";
GRANT SELECT ON TABLE "public"."organizations" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."promotions" TO "anon";
GRANT ALL ON TABLE "public"."promotions" TO "authenticated";
GRANT ALL ON TABLE "public"."promotions" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";
GRANT SELECT ON TABLE "public"."roles" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."saved_list_items" TO "anon";
GRANT ALL ON TABLE "public"."saved_list_items" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_list_items" TO "service_role";



GRANT ALL ON TABLE "public"."saved_lists" TO "anon";
GRANT ALL ON TABLE "public"."saved_lists" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_lists" TO "service_role";



GRANT ALL ON TABLE "public"."storage_analytics" TO "anon";
GRANT ALL ON TABLE "public"."storage_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."storage_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."storage_compartments" TO "anon";
GRANT ALL ON TABLE "public"."storage_compartments" TO "authenticated";
GRANT ALL ON TABLE "public"."storage_compartments" TO "service_role";



GRANT ALL ON TABLE "public"."storage_images" TO "anon";
GRANT ALL ON TABLE "public"."storage_images" TO "authenticated";
GRANT ALL ON TABLE "public"."storage_images" TO "service_role";



GRANT ALL ON TABLE "public"."storage_item_images" TO "anon";
GRANT ALL ON TABLE "public"."storage_item_images" TO "authenticated";
GRANT ALL ON TABLE "public"."storage_item_images" TO "service_role";



GRANT ALL ON TABLE "public"."storage_item_tags" TO "anon";
GRANT ALL ON TABLE "public"."storage_item_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."storage_item_tags" TO "service_role";



GRANT ALL ON TABLE "public"."storage_items" TO "anon";
GRANT ALL ON TABLE "public"."storage_items" TO "authenticated";
GRANT ALL ON TABLE "public"."storage_items" TO "service_role";



GRANT ALL ON TABLE "public"."storage_locations" TO "anon";
GRANT ALL ON TABLE "public"."storage_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."storage_locations" TO "service_role";



GRANT ALL ON TABLE "public"."storage_working_hours" TO "anon";
GRANT ALL ON TABLE "public"."storage_working_hours" TO "authenticated";
GRANT ALL ON TABLE "public"."storage_working_hours" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON TABLE "public"."test" TO "anon";
GRANT ALL ON TABLE "public"."test" TO "authenticated";
GRANT ALL ON TABLE "public"."test" TO "service_role";



GRANT ALL ON TABLE "public"."test_features" TO "anon";
GRANT ALL ON TABLE "public"."test_features" TO "authenticated";
GRANT ALL ON TABLE "public"."test_features" TO "service_role";



GRANT ALL ON SEQUENCE "public"."test_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."test_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."test_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_addresses" TO "anon";
GRANT ALL ON TABLE "public"."user_addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."user_addresses" TO "service_role";



GRANT ALL ON TABLE "public"."user_ban_history" TO "anon";
GRANT ALL ON TABLE "public"."user_ban_history" TO "authenticated";
GRANT ALL ON TABLE "public"."user_ban_history" TO "service_role";



GRANT ALL ON TABLE "public"."user_organization_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_organization_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_organization_roles" TO "service_role";
GRANT SELECT ON TABLE "public"."user_organization_roles" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."view_bookings_with_user_info" TO "anon";
GRANT ALL ON TABLE "public"."view_bookings_with_user_info" TO "authenticated";
GRANT ALL ON TABLE "public"."view_bookings_with_user_info" TO "service_role";



GRANT ALL ON TABLE "public"."view_item_location_summary" TO "anon";
GRANT ALL ON TABLE "public"."view_item_location_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."view_item_location_summary" TO "service_role";



GRANT ALL ON TABLE "public"."view_item_ownership_summary" TO "anon";
GRANT ALL ON TABLE "public"."view_item_ownership_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."view_item_ownership_summary" TO "service_role";



GRANT ALL ON TABLE "public"."view_manage_storage_items" TO "anon";
GRANT ALL ON TABLE "public"."view_manage_storage_items" TO "authenticated";
GRANT ALL ON TABLE "public"."view_manage_storage_items" TO "service_role";



GRANT ALL ON TABLE "public"."view_user_ban_status" TO "anon";
GRANT ALL ON TABLE "public"."view_user_ban_status" TO "authenticated";
GRANT ALL ON TABLE "public"."view_user_ban_status" TO "service_role";



GRANT ALL ON TABLE "public"."view_user_roles_with_details" TO "anon";
GRANT ALL ON TABLE "public"."view_user_roles_with_details" TO "authenticated";
GRANT ALL ON TABLE "public"."view_user_roles_with_details" TO "service_role";
GRANT SELECT ON TABLE "public"."view_user_roles_with_details" TO "supabase_auth_admin";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
