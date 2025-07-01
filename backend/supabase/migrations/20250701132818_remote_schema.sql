

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


CREATE OR REPLACE FUNCTION "public"."get_full_order"("order_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
declare
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
end;
$$;


ALTER FUNCTION "public"."get_full_order"("order_id" "uuid") OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  -- Removed the problematic "SET LOCAL ROLE postgres;" line
  
  INSERT INTO public.user_profiles (
    id, role, email, phone, created_at
  )
  VALUES (
    NEW.id, 'user', NEW.email, NEW.phone, NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."update_order_amounts"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  total_sum DECIMAL;
BEGIN
  -- Handle DELETE operation differently
  IF TG_OP = 'DELETE' THEN
    SELECT COALESCE(SUM(subtotal), 0) INTO total_sum
    FROM order_items
    WHERE order_id = OLD.order_id;
    
    UPDATE orders
    SET 
      total_amount = total_sum,
      final_amount = total_sum - COALESCE(discount_amount, 0)
    WHERE id = OLD.order_id;
    RETURN OLD;
  ELSE
    SELECT COALESCE(SUM(subtotal), 0) INTO total_sum
    FROM order_items
    WHERE order_id = NEW.order_id;
    
    UPDATE orders
    SET 
      total_amount = total_sum,
      final_amount = total_sum - COALESCE(discount_amount, 0)
    WHERE id = NEW.order_id;
    RETURN NEW;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in update_order_amounts: %', SQLERRM;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_order_amounts"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."update_test_metadata"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update test metadata when storage item is modified
    IF TG_OP = 'UPDATE' THEN
        NEW.test_metadata = NEW.test_metadata || jsonb_build_object(
            'last_modified', now(),
            'test_flag', true,
            'version', COALESCE((OLD.test_metadata->>'version')::int, 0) + 1
        );
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_test_metadata"() OWNER TO "postgres";


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


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid" NOT NULL,
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


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_number" character varying NOT NULL,
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


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "storage_item_id" "uuid" NOT NULL,
    "owned_quantity" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "storage_location_id" "uuid" NOT NULL,
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
    "updated_by" "uuid"
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid" NOT NULL,
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
    "storage_path" character varying,
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
    "items_number_available" numeric NOT NULL,
    "price" numeric NOT NULL,
    "average_rating" numeric DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "translations" "jsonb",
    "items_number_currently_in_storage" numeric,
    "is_deleted" boolean DEFAULT false,
    "test_priority_score" numeric DEFAULT 0,
    "test_metadata" "jsonb" DEFAULT '{}'::"jsonb"
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
    "role" character varying DEFAULT 'user'::character varying NOT NULL,
    "full_name" character varying,
    "visible_name" character varying,
    "phone" character varying,
    "email" character varying,
    "saved_lists" "jsonb",
    "preferences" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_profiles_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['user'::character varying, 'admin'::character varying, 'superVera'::character varying])::"text"[])))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "profile_id" "uuid" NOT NULL,
    "role" "public"."role_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text")
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user_roles"."created_at" IS 'Date string of when the role was created.';



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



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."orders"
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



ALTER TABLE ONLY "public"."organization_items"
    ADD CONSTRAINT "unique_org_item_location" UNIQUE ("organization_id", "storage_item_id", "storage_location_id");



ALTER TABLE ONLY "public"."organization_locations"
    ADD CONSTRAINT "unique_org_location" UNIQUE ("organization_id", "storage_location_id");



ALTER TABLE ONLY "public"."user_organization_roles"
    ADD CONSTRAINT "unique_user_org_role" UNIQUE ("user_id", "organization_id", "role_id");



ALTER TABLE ONLY "public"."user_addresses"
    ADD CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("profile_id");



CREATE INDEX "idx_order_items_order" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "idx_orders_user" ON "public"."orders" USING "btree" ("user_id");



CREATE INDEX "idx_payments_order" ON "public"."payments" USING "btree" ("order_id");



CREATE INDEX "idx_reviews_item" ON "public"."reviews" USING "btree" ("item_id");



CREATE INDEX "idx_storage_items_location" ON "public"."storage_items" USING "btree" ("location_id");



CREATE INDEX "idx_storage_items_translations" ON "public"."storage_items" USING "gin" ("translations");



CREATE INDEX "idx_tags_translations" ON "public"."tags" USING "gin" ("translations");



CREATE INDEX "storage_analytics_location_date_idx" ON "public"."storage_analytics" USING "btree" ("location_id", "date");



CREATE INDEX "storage_items_test_metadata_idx" ON "public"."storage_items" USING "gin" ("test_metadata");



CREATE INDEX "test_features_feature_name_idx" ON "public"."test_features" USING "btree" ("feature_name");



CREATE OR REPLACE TRIGGER "audit_order_items_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."order_items" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_func"();



CREATE OR REPLACE TRIGGER "audit_orders_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_func"();



CREATE OR REPLACE TRIGGER "audit_payments_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_func"();



CREATE OR REPLACE TRIGGER "audit_storage_items_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."storage_items" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_func"();



CREATE OR REPLACE TRIGGER "generate_organizations_slug_trigger" BEFORE INSERT OR UPDATE OF "name" ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."generate_organization_slug"();



CREATE OR REPLACE TRIGGER "test_metadata_trigger" BEFORE UPDATE ON "public"."storage_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_test_metadata"();



CREATE OR REPLACE TRIGGER "update_average_rating_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_average_rating"();



CREATE OR REPLACE TRIGGER "update_erm_organization_items_updated_at" BEFORE UPDATE ON "public"."organization_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_erm_organization_locations_updated_at" BEFORE UPDATE ON "public"."organization_locations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_erm_user_organization_roles_updated_at" BEFORE UPDATE ON "public"."user_organization_roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_item_availability_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."order_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_item_availability"();



CREATE OR REPLACE TRIGGER "update_order_amounts_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."order_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_order_amounts"();



CREATE OR REPLACE TRIGGER "update_organizations_updated_at" BEFORE UPDATE ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_storage_items_totals_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."organization_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_storage_item_totals"();



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organization_items"
    ADD CONSTRAINT "erm_organization_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organization_items"
    ADD CONSTRAINT "erm_organization_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."organization_items"
    ADD CONSTRAINT "erm_organization_items_storage_item_id_fkey" FOREIGN KEY ("storage_item_id") REFERENCES "public"."storage_items"("id");



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
    ADD CONSTRAINT "invoices_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."storage_items"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."storage_locations"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_provider_organization_id_fkey" FOREIGN KEY ("provider_organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organization_items"
    ADD CONSTRAINT "organization_items_storage_location_id_fkey" FOREIGN KEY ("storage_location_id") REFERENCES "public"."storage_locations"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."promotions"
    ADD CONSTRAINT "promotions_owner_organization_id_fkey" FOREIGN KEY ("owner_organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."storage_items"("id");



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
    ADD CONSTRAINT "storage_item_images_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."storage_items"("id");



ALTER TABLE ONLY "public"."storage_item_tags"
    ADD CONSTRAINT "storage_item_tags_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."storage_items"("id");



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



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promotions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_list_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_lists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storage_working_hours" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."test_features" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





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



GRANT ALL ON FUNCTION "public"."generate_organization_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_organization_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_organization_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_full_orders"("in_offset" integer, "in_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_full_orders"("in_offset" integer, "in_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_full_orders"("in_offset" integer, "in_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_full_order"("order_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_full_order"("order_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_full_order"("order_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_full_user_order"("in_user_id" "uuid", "in_offset" integer, "in_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_full_user_order"("in_user_id" "uuid", "in_offset" integer, "in_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_full_user_order"("in_user_id" "uuid", "in_offset" integer, "in_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_item_availability"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_item_availability"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_item_availability"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_order_amounts"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_order_amounts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_order_amounts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_storage_item_totals"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_storage_item_totals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_storage_item_totals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_test_metadata"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_test_metadata"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_test_metadata"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."organization_items" TO "anon";
GRANT ALL ON TABLE "public"."organization_items" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_items" TO "service_role";



GRANT ALL ON TABLE "public"."organization_locations" TO "anon";
GRANT ALL ON TABLE "public"."organization_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_locations" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



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



GRANT ALL ON TABLE "public"."test_features" TO "anon";
GRANT ALL ON TABLE "public"."test_features" TO "authenticated";
GRANT ALL ON TABLE "public"."test_features" TO "service_role";



GRANT ALL ON TABLE "public"."user_addresses" TO "anon";
GRANT ALL ON TABLE "public"."user_addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."user_addresses" TO "service_role";



GRANT ALL ON TABLE "public"."user_organization_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_organization_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_organization_roles" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."view_item_location_summary" TO "anon";
GRANT ALL ON TABLE "public"."view_item_location_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."view_item_location_summary" TO "service_role";



GRANT ALL ON TABLE "public"."view_item_ownership_summary" TO "anon";
GRANT ALL ON TABLE "public"."view_item_ownership_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."view_item_ownership_summary" TO "service_role";



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
