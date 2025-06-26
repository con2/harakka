

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
    'SuperVera'
);


ALTER TYPE "public"."role_type" OWNER TO "postgres";


CREATE TYPE "public"."role_type_test" AS ENUM (
    'super_user',
    'manager',
    'user'
);


ALTER TYPE "public"."role_type_test" OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."clear_request_user_id"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  PERFORM set_config('app.current_user_id', '', false);
END;
$$;


ALTER FUNCTION "public"."clear_request_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_request_user_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  request_user_id TEXT;
  auth_user_id UUID;
BEGIN
  -- Try to get user ID from session variable first
  request_user_id := current_setting('app.current_user_id', true);
  
  -- If there's a session variable with a value, use it
  IF request_user_id IS NOT NULL AND request_user_id != '' THEN
    RETURN request_user_id::UUID;
  END IF;
  
  -- Otherwise fall back to auth.uid()
  auth_user_id := auth.uid();
  RETURN auth_user_id;
END;
$$;


ALTER FUNCTION "public"."get_request_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Removed the problematic "SET LOCAL ROLE postgres;" line
  
  INSERT INTO public.user_profiles (
    id, role, email, phone, created_at
  )
  VALUES (
    NEW.id, 'user', NEW.email, NEW.phone, NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_only"() RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.profile_id = auth.uid()
      AND ur.role = 'Admin'
  );
$$;


ALTER FUNCTION "public"."is_admin_only"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_elevated_core"("p_user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_is_elevated boolean;
BEGIN
    -- Turn RLS off ONLY for the duration of this statement
    PERFORM set_config('row_security', 'off', true);   -- avoids recursion  [oai_citation:3‡postgresql.org](https://www.postgresql.org/docs/current/ddl-rowsecurity.html?utm_source=chatgpt.com) [oai_citation:4‡stackoverflow.com](https://stackoverflow.com/questions/48238936/postgresql-infinite-recursion-detected-in-policy-for-relation?utm_source=chatgpt.com)

    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.profile_id = p_user_id
          AND ur.role IN ('Admin','SuperVera')          -- enum labels are case-sensitive  [oai_citation:5‡postgresql.org](https://www.postgresql.org/docs/current/datatype-enum.html?utm_source=chatgpt.com)
    )
    INTO  v_is_elevated;

    RETURN v_is_elevated;
END;
$$;


ALTER FUNCTION "public"."is_elevated_core"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_super_vera"() RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.profile_id = auth.uid()
      AND ur.role = 'SuperVera'
  );
$$;


ALTER FUNCTION "public"."is_super_vera"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_request_user_id"("user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id::text, false);
END;
$$;


ALTER FUNCTION "public"."set_request_user_id"("user_id" "uuid") OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "security"."has_role"("p_role" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
      SELECT 1
      FROM   public.user_roles ur
      WHERE  ur.profile_id = auth.uid()
        AND  ur.role::text = p_role      -- <-- explicit cast
  );
END;
$$;


ALTER FUNCTION "security"."has_role"("p_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "security"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT  security.has_role('Admin')
          OR security.has_role('SuperVera');
$$;


ALTER FUNCTION "security"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "security"."is_super_vera"() RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$ SELECT security.has_role('SuperVera'); $$;


ALTER FUNCTION "security"."is_super_vera"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "security"."strict_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT  security.has_role('Admin');
$$;


ALTER FUNCTION "security"."strict_admin"() OWNER TO "postgres";

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


CREATE TABLE IF NOT EXISTS "public"."items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid",
    "name" "text" NOT NULL
);


ALTER TABLE "public"."items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" character varying NOT NULL,
    "title" character varying NOT NULL,
    "message" "text" NOT NULL,
    "order_id" "uuid",
    "item_id" "uuid",
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "read_at" timestamp with time zone,
    CONSTRAINT "notifications_type_check" CHECK ((("type")::"text" = ANY ((ARRAY['order_confirmation'::character varying, 'payment_reminder'::character varying, 'status_update'::character varying])::"text"[])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 1,
    "unit_price" numeric,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "total_days" integer NOT NULL,
    "subtotal" numeric,
    "status" character varying NOT NULL,
    "location_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
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
    "role" "public"."role_type" NOT NULL
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


CREATE TABLE IF NOT EXISTS "public"."tenants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."tenants" OWNER TO "postgres";


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



CREATE TABLE IF NOT EXISTS "public"."user_tenant_roles" (
    "tenant_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."role_type_test" NOT NULL
);


ALTER TABLE "public"."user_tenant_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_invoice_number_key" UNIQUE ("invoice_number");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_addresses"
    ADD CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("profile_id");



ALTER TABLE ONLY "public"."user_tenant_roles"
    ADD CONSTRAINT "user_tenant_roles_pkey" PRIMARY KEY ("tenant_id", "user_id", "role");



CREATE INDEX "idx_notifications_user" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_order_items_order" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "idx_orders_user" ON "public"."orders" USING "btree" ("user_id");



CREATE INDEX "idx_payments_order" ON "public"."payments" USING "btree" ("order_id");



CREATE INDEX "idx_reviews_item" ON "public"."reviews" USING "btree" ("item_id");



CREATE INDEX "idx_storage_items_location" ON "public"."storage_items" USING "btree" ("location_id");



CREATE INDEX "idx_storage_items_translations" ON "public"."storage_items" USING "gin" ("translations");



CREATE INDEX "idx_tags_translations" ON "public"."tags" USING "gin" ("translations");



CREATE OR REPLACE TRIGGER "audit_order_items_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."order_items" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_func"();



CREATE OR REPLACE TRIGGER "audit_orders_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_func"();



CREATE OR REPLACE TRIGGER "audit_payments_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_func"();



CREATE OR REPLACE TRIGGER "audit_storage_items_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."storage_items" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_func"();



CREATE OR REPLACE TRIGGER "update_average_rating_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_average_rating"();



CREATE OR REPLACE TRIGGER "update_item_availability_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."order_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_item_availability"();



CREATE OR REPLACE TRIGGER "update_order_amounts_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."order_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_order_amounts"();



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."storage_items"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."storage_items"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."storage_locations"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



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



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_role_fkey" FOREIGN KEY ("role") REFERENCES "public"."roles"("role") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."user_tenant_roles"
    ADD CONSTRAINT "user_tenant_roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_tenant_roles"
    ADD CONSTRAINT "user_tenant_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin and Super Vera can delete roles" ON "public"."roles" FOR DELETE USING ("security"."is_admin"());



CREATE POLICY "Admin and Super Vera can delete user_profiles" ON "public"."user_profiles" FOR DELETE USING ("security"."is_admin"());



CREATE POLICY "Admin and Super Vera can delete user_roles" ON "public"."user_roles" FOR DELETE USING ("security"."is_admin"());



CREATE POLICY "Admin and Super Vera can insert roles" ON "public"."roles" FOR INSERT WITH CHECK ("security"."is_admin"());



CREATE POLICY "Admin and Super Vera can insert user_profiles" ON "public"."user_profiles" FOR INSERT WITH CHECK ("security"."is_admin"());



CREATE POLICY "Admin and Super Vera can insert user_roles" ON "public"."user_roles" FOR INSERT WITH CHECK ("security"."is_admin"());



CREATE POLICY "Admin and Super Vera can select ALL user_profiles" ON "public"."user_profiles" FOR SELECT USING ("security"."is_admin"());



CREATE POLICY "Admin and Super Vera can update roles" ON "public"."roles" FOR UPDATE USING ("security"."is_admin"()) WITH CHECK ("security"."is_admin"());



CREATE POLICY "Admin and Super Vera can update user_profiles" ON "public"."user_profiles" FOR UPDATE USING ("security"."is_admin"());



CREATE POLICY "Admin and Super Vera can update user_roles" ON "public"."user_roles" FOR UPDATE USING ("security"."is_admin"()) WITH CHECK ("security"."is_admin"());



CREATE POLICY "Admins have full access to audit_logs" ON "public"."audit_logs" USING ("security"."is_admin"());



CREATE POLICY "Admins have full access to item_images" ON "public"."storage_item_images" USING ("security"."is_admin"());



CREATE POLICY "Admins have full access to item_tags" ON "public"."storage_item_tags" USING ("security"."is_admin"());



CREATE POLICY "Admins have full access to notifications" ON "public"."notifications" USING ("security"."is_admin"());



CREATE POLICY "Admins have full access to order_items" ON "public"."order_items" USING ("security"."is_admin"());



CREATE POLICY "Admins have full access to orders" ON "public"."orders" USING ("security"."is_admin"());



CREATE POLICY "Admins have full access to payments" ON "public"."payments" USING ("security"."is_admin"());



CREATE POLICY "Admins have full access to promotions" ON "public"."promotions" USING ("security"."is_admin"());



CREATE POLICY "Admins have full access to reviews" ON "public"."reviews" USING ("security"."is_admin"());



CREATE POLICY "Admins have full access to saved_list_items" ON "public"."saved_list_items" USING ("security"."is_admin"());



CREATE POLICY "Admins have full access to saved_lists" ON "public"."saved_lists" USING ("security"."is_admin"());



CREATE POLICY "Admins have full access to storage_images" ON "public"."storage_images" USING ("security"."is_admin"());



CREATE POLICY "Admins have full access to storage_items" ON "public"."storage_items" USING ("security"."is_admin"());



CREATE POLICY "Admins have full access to storage_locations" ON "public"."storage_locations" USING ("security"."is_admin"());



CREATE POLICY "Admins have full access to tags" ON "public"."tags" USING ("security"."is_admin"());



CREATE POLICY "Admins have full access to user_addresses" ON "public"."user_addresses" USING ("security"."is_admin"());



CREATE POLICY "Admins have full access to working_hours" ON "public"."storage_working_hours" USING ("security"."is_admin"());



CREATE POLICY "Allow anonymous read access to storage_items" ON "public"."storage_items" FOR SELECT USING (true);



CREATE POLICY "Anyone can insert user profiles" ON "public"."user_profiles" FOR INSERT TO "authenticated" WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Managers insert items" ON "public"."items" FOR INSERT TO "authenticated" WITH CHECK (("tenant_id" IN ( SELECT "user_tenant_roles"."tenant_id"
   FROM "public"."user_tenant_roles"
  WHERE (("user_tenant_roles"."user_id" = "auth"."uid"()) AND ("user_tenant_roles"."role" = ANY (ARRAY['manager'::"public"."role_type_test", 'super_user'::"public"."role_type_test"]))))));



CREATE POLICY "Managers update items" ON "public"."items" FOR UPDATE TO "authenticated" USING (("tenant_id" IN ( SELECT "user_tenant_roles"."tenant_id"
   FROM "public"."user_tenant_roles"
  WHERE (("user_tenant_roles"."user_id" = "auth"."uid"()) AND ("user_tenant_roles"."role" = ANY (ARRAY['manager'::"public"."role_type_test", 'super_user'::"public"."role_type_test"]))))));



CREATE POLICY "Public read access for active promotions" ON "public"."promotions" FOR SELECT USING ((("is_active" = true) AND ("starts_at" <= "now"()) AND ("expires_at" > "now"())));



CREATE POLICY "Public read access for item images" ON "public"."storage_item_images" FOR SELECT USING ((("is_active" = true) AND (EXISTS ( SELECT 1
   FROM "public"."storage_items"
  WHERE (("storage_items"."id" = "storage_item_images"."item_id") AND ("storage_items"."is_active" = true))))));



CREATE POLICY "Public read access for storage images" ON "public"."storage_images" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public read access for storage locations" ON "public"."storage_locations" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public read access for tags" ON "public"."tags" FOR SELECT USING (true);



CREATE POLICY "Public read access for working hours" ON "public"."storage_working_hours" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Read items for my tenants" ON "public"."items" FOR SELECT TO "authenticated" USING (("tenant_id" IN ( SELECT "user_tenant_roles"."tenant_id"
   FROM "public"."user_tenant_roles"
  WHERE ("user_tenant_roles"."user_id" = "auth"."uid"()))));



CREATE POLICY "System can insert audit logs" ON "public"."audit_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert notifications" ON "public"."notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can add items to their own saved lists" ON "public"."saved_list_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."saved_lists"
  WHERE (("saved_lists"."id" = "saved_list_items"."list_id") AND ("saved_lists"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can create reviews for items they ordered" ON "public"."reviews" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."order_items"
     JOIN "public"."orders" ON (("order_items"."order_id" = "orders"."id")))
  WHERE (("order_items"."item_id" = "reviews"."item_id") AND ("orders"."user_id" = "auth"."uid"()) AND (("orders"."status")::"text" = ANY ((ARRAY['completed'::character varying, 'paid'::character varying])::"text"[])))))));



CREATE POLICY "Users can create their own orders" ON "public"."orders" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") OR ("user_id" = "auth"."uid"())));



CREATE POLICY "Users can create their own saved lists" ON "public"."saved_lists" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete items from their own pending orders" ON "public"."order_items" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"()) AND (("orders"."status")::"text" = 'pending'::"text")))));



CREATE POLICY "Users can delete their own addresses" ON "public"."user_addresses" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own reviews" ON "public"."reviews" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own saved lists" ON "public"."saved_lists" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can insert items to their own pending orders" ON "public"."order_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"()) AND (("orders"."status")::"text" = 'pending'::"text")))));



CREATE POLICY "Users can insert their own addresses" ON "public"."user_addresses" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can mark their own notifications as read" ON "public"."notifications" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK ((("user_id" = "auth"."uid"()) AND ("is_read" = true) AND ("read_at" IS NOT NULL)));



CREATE POLICY "Users can read their roles" ON "public"."user_tenant_roles" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can remove items from their own saved lists" ON "public"."saved_list_items" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."saved_lists"
  WHERE (("saved_lists"."id" = "saved_list_items"."list_id") AND ("saved_lists"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update items in their own pending orders" ON "public"."order_items" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"()) AND (("orders"."status")::"text" = 'pending'::"text")))));



CREATE POLICY "Users can update items in their own saved lists" ON "public"."saved_list_items" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."saved_lists"
  WHERE (("saved_lists"."id" = "saved_list_items"."list_id") AND ("saved_lists"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own addresses" ON "public"."user_addresses" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own profile" ON "public"."user_profiles" FOR UPDATE USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can update their own reviews" ON "public"."reviews" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own saved lists" ON "public"."saved_lists" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their pending orders" ON "public"."orders" FOR UPDATE USING ((("user_id" = "auth"."uid"()) AND (("status")::"text" = 'pending'::"text")));



CREATE POLICY "Users can view all reviews" ON "public"."reviews" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view items in their own saved lists" ON "public"."saved_list_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."saved_lists"
  WHERE (("saved_lists"."id" = "saved_list_items"."list_id") AND ("saved_lists"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own addresses" ON "public"."user_addresses" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own order items" ON "public"."order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own orders" ON "public"."orders" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR ("user_id" IN ( SELECT "user_profiles"."id"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own payments" ON "public"."payments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "payments"."order_id") AND ("orders"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own profile" ON "public"."user_profiles" FOR SELECT USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can view their own saved lists" ON "public"."saved_lists" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "any authenticated can read roles" ON "public"."roles" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "any authenticated can read user_roles" ON "public"."user_roles" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promotions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_list_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_lists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storage_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storage_item_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storage_item_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storage_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storage_locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storage_working_hours" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_addresses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_tenant_roles" ENABLE ROW LEVEL SECURITY;




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



GRANT ALL ON FUNCTION "public"."clear_request_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."clear_request_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."clear_request_user_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_request_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_request_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_request_user_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_only"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin_only"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_only"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_elevated_core"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_elevated_core"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_elevated_core"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_super_vera"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_super_vera"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_super_vera"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_request_user_id"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."set_request_user_id"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_request_user_id"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_item_availability"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_item_availability"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_item_availability"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_order_amounts"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_order_amounts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_order_amounts"() TO "service_role";



GRANT ALL ON FUNCTION "security"."has_role"("p_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "security"."has_role"("p_role" "text") TO "anon";



GRANT ALL ON FUNCTION "security"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "security"."is_admin"() TO "anon";



GRANT ALL ON FUNCTION "security"."is_super_vera"() TO "authenticated";
GRANT ALL ON FUNCTION "security"."is_super_vera"() TO "anon";


















GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON TABLE "public"."items" TO "anon";
GRANT ALL ON TABLE "public"."items" TO "authenticated";
GRANT ALL ON TABLE "public"."items" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



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



GRANT ALL ON TABLE "public"."tenants" TO "anon";
GRANT ALL ON TABLE "public"."tenants" TO "authenticated";
GRANT ALL ON TABLE "public"."tenants" TO "service_role";



GRANT ALL ON TABLE "public"."user_addresses" TO "anon";
GRANT ALL ON TABLE "public"."user_addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."user_addresses" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."user_tenant_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_tenant_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_tenant_roles" TO "service_role";



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
