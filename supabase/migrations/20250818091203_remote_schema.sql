set check_function_bodies = off;

CREATE OR REPLACE FUNCTION extensions.grant_pg_net_access()
 RETURNS event_trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$function$
;

revoke delete on table "public"."saved_list_items" from "anon";

revoke insert on table "public"."saved_list_items" from "anon";

revoke references on table "public"."saved_list_items" from "anon";

revoke select on table "public"."saved_list_items" from "anon";

revoke trigger on table "public"."saved_list_items" from "anon";

revoke truncate on table "public"."saved_list_items" from "anon";

revoke update on table "public"."saved_list_items" from "anon";

revoke delete on table "public"."saved_list_items" from "authenticated";

revoke insert on table "public"."saved_list_items" from "authenticated";

revoke references on table "public"."saved_list_items" from "authenticated";

revoke select on table "public"."saved_list_items" from "authenticated";

revoke trigger on table "public"."saved_list_items" from "authenticated";

revoke truncate on table "public"."saved_list_items" from "authenticated";

revoke update on table "public"."saved_list_items" from "authenticated";

revoke delete on table "public"."saved_list_items" from "service_role";

revoke insert on table "public"."saved_list_items" from "service_role";

revoke references on table "public"."saved_list_items" from "service_role";

revoke select on table "public"."saved_list_items" from "service_role";

revoke trigger on table "public"."saved_list_items" from "service_role";

revoke truncate on table "public"."saved_list_items" from "service_role";

revoke update on table "public"."saved_list_items" from "service_role";

revoke delete on table "public"."saved_lists" from "anon";

revoke insert on table "public"."saved_lists" from "anon";

revoke references on table "public"."saved_lists" from "anon";

revoke select on table "public"."saved_lists" from "anon";

revoke trigger on table "public"."saved_lists" from "anon";

revoke truncate on table "public"."saved_lists" from "anon";

revoke update on table "public"."saved_lists" from "anon";

revoke delete on table "public"."saved_lists" from "authenticated";

revoke insert on table "public"."saved_lists" from "authenticated";

revoke references on table "public"."saved_lists" from "authenticated";

revoke select on table "public"."saved_lists" from "authenticated";

revoke trigger on table "public"."saved_lists" from "authenticated";

revoke truncate on table "public"."saved_lists" from "authenticated";

revoke update on table "public"."saved_lists" from "authenticated";

revoke delete on table "public"."saved_lists" from "service_role";

revoke insert on table "public"."saved_lists" from "service_role";

revoke references on table "public"."saved_lists" from "service_role";

revoke select on table "public"."saved_lists" from "service_role";

revoke trigger on table "public"."saved_lists" from "service_role";

revoke truncate on table "public"."saved_lists" from "service_role";

revoke update on table "public"."saved_lists" from "service_role";

alter table "public"."booking_items" drop constraint "order_items_item_id_fkey";

alter table "public"."saved_list_items" drop constraint "saved_list_items_item_id_fkey";

alter table "public"."saved_list_items" drop constraint "saved_list_items_list_id_fkey";

alter table "public"."saved_lists" drop constraint "saved_lists_user_id_fkey";

alter table "public"."audit_logs" drop constraint "audit_logs_action_check";

alter table "public"."payments" drop constraint "payments_payment_method_check";

alter table "public"."payments" drop constraint "payments_status_check";

alter table "public"."promotions" drop constraint "promotions_discount_type_check";

alter table "public"."storage_images" drop constraint "storage_images_image_type_check";

alter table "public"."storage_item_images" drop constraint "storage_item_images_image_type_check";

alter table "public"."storage_working_hours" drop constraint "storage_working_hours_day_check";

alter table "public"."user_addresses" drop constraint "user_addresses_address_type_check";

alter table "public"."user_ban_history" drop constraint "user_ban_history_action_check";

alter table "public"."user_ban_history" drop constraint "user_ban_history_ban_type_check";

drop view if exists "public"."view_bookings_with_user_info";

drop view if exists "public"."view_user_ban_status";

drop view if exists "public"."view_user_roles_with_details";

alter table "public"."saved_list_items" drop constraint "saved_list_items_pkey";

alter table "public"."saved_lists" drop constraint "saved_lists_pkey";

drop index if exists "public"."saved_list_items_pkey";

drop index if exists "public"."saved_lists_pkey";

drop table "public"."saved_list_items";

drop table "public"."saved_lists";

alter type "public"."roles_type" rename to "roles_type__old_version_to_be_dropped";

create type "public"."roles_type" as enum ('super_admin', 'user', 'superVera', 'storage_manager', 'requester', 'tenant_admin');

alter table "public"."roles" alter column role type "public"."roles_type" using role::text::"public"."roles_type";

drop type "public"."roles_type__old_version_to_be_dropped";

alter table "public"."organizations" add column "logo_picture_url" text;

alter table "public"."storage_items" add column "org_id" uuid not null;

alter table "public"."user_profiles" drop column "preferences";

alter table "public"."user_profiles" drop column "saved_lists";

alter table "public"."booking_items" add constraint "booking_items_item_id_fkey" FOREIGN KEY (item_id) REFERENCES storage_items(id) ON DELETE CASCADE not valid;

alter table "public"."booking_items" validate constraint "booking_items_item_id_fkey";

alter table "public"."audit_logs" add constraint "audit_logs_action_check" CHECK (((action)::text = ANY ((ARRAY['insert'::character varying, 'update'::character varying, 'delete'::character varying])::text[]))) not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_action_check";

alter table "public"."payments" add constraint "payments_payment_method_check" CHECK (((payment_method)::text = ANY ((ARRAY['credit_card'::character varying, 'bank_transfer'::character varying, 'cash'::character varying, 'paypal'::character varying])::text[]))) not valid;

alter table "public"."payments" validate constraint "payments_payment_method_check";

alter table "public"."payments" add constraint "payments_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[]))) not valid;

alter table "public"."payments" validate constraint "payments_status_check";

alter table "public"."promotions" add constraint "promotions_discount_type_check" CHECK (((discount_type)::text = ANY ((ARRAY['percentage'::character varying, 'fixed_amount'::character varying])::text[]))) not valid;

alter table "public"."promotions" validate constraint "promotions_discount_type_check";

alter table "public"."storage_images" add constraint "storage_images_image_type_check" CHECK (((image_type)::text = ANY ((ARRAY['main'::character varying, 'thumbnail'::character varying, 'detail'::character varying])::text[]))) not valid;

alter table "public"."storage_images" validate constraint "storage_images_image_type_check";

alter table "public"."storage_item_images" add constraint "storage_item_images_image_type_check" CHECK (((image_type)::text = ANY ((ARRAY['main'::character varying, 'thumbnail'::character varying, 'detail'::character varying])::text[]))) not valid;

alter table "public"."storage_item_images" validate constraint "storage_item_images_image_type_check";

alter table "public"."storage_working_hours" add constraint "storage_working_hours_day_check" CHECK (((day)::text = ANY ((ARRAY['monday'::character varying, 'tuesday'::character varying, 'wednesday'::character varying, 'thursday'::character varying, 'friday'::character varying, 'saturday'::character varying, 'sunday'::character varying])::text[]))) not valid;

alter table "public"."storage_working_hours" validate constraint "storage_working_hours_day_check";

alter table "public"."user_addresses" add constraint "user_addresses_address_type_check" CHECK (((address_type)::text = ANY ((ARRAY['billing'::character varying, 'shipping'::character varying, 'both'::character varying])::text[]))) not valid;

alter table "public"."user_addresses" validate constraint "user_addresses_address_type_check";

alter table "public"."user_ban_history" add constraint "user_ban_history_action_check" CHECK (((action)::text = ANY ((ARRAY['banned'::character varying, 'unbanned'::character varying])::text[]))) not valid;

alter table "public"."user_ban_history" validate constraint "user_ban_history_action_check";

alter table "public"."user_ban_history" add constraint "user_ban_history_ban_type_check" CHECK (((ban_type)::text = ANY ((ARRAY['banForRole'::character varying, 'banForOrg'::character varying, 'banForApp'::character varying])::text[]))) not valid;

alter table "public"."user_ban_history" validate constraint "user_ban_history_ban_type_check";

create or replace view "public"."view_bookings_with_user_info" as  SELECT b.total_amount,
    b.id,
    b.status,
    b.payment_status,
    b.created_at,
    b.final_amount,
    b.booking_number,
    (b.created_at)::text AS created_at_text,
    (b.final_amount)::text AS final_amount_text,
    u.full_name,
    u.visible_name,
    u.email,
    u.id AS user_id
   FROM (bookings b
     JOIN user_profiles u ON ((b.user_id = u.id)));


create or replace view "public"."view_manage_storage_items" as  SELECT ((s.translations -> 'fi'::text) ->> 'item_name'::text) AS fi_item_name,
    ((s.translations -> 'fi'::text) ->> 'item_type'::text) AS fi_item_type,
    ((s.translations -> 'en'::text) ->> 'item_name'::text) AS en_item_name,
    ((s.translations -> 'en'::text) ->> 'item_type'::text) AS en_item_type,
    s.translations,
    s.id,
    s.items_number_total,
    s.price,
    s.created_at,
    s.is_active,
    s.location_id,
    l.name AS location_name,
    array_agg(DISTINCT t.tag_id) AS tag_ids,
    array_agg(DISTINCT g.translations) AS tag_translations,
    s.items_number_currently_in_storage,
    s.is_deleted,
    s.org_id AS organization_id
   FROM (((storage_items s
     JOIN storage_locations l ON ((s.location_id = l.id)))
     LEFT JOIN storage_item_tags t ON ((s.id = t.item_id)))
     LEFT JOIN tags g ON ((t.tag_id = g.id)))
  GROUP BY s.id, s.translations, s.items_number_total, s.price, s.created_at, s.is_active, s.location_id, l.name, s.items_number_currently_in_storage, s.is_deleted, s.org_id;


create or replace view "public"."view_user_ban_status" as  SELECT up.id,
    up.email,
    up.full_name,
    up.visible_name,
    up.created_at AS user_created_at,
    COALESCE(active_roles.count, (0)::bigint) AS active_roles_count,
    COALESCE(inactive_roles.count, (0)::bigint) AS inactive_roles_count,
        CASE
            WHEN (COALESCE(active_roles.count, (0)::bigint) = 0) THEN 'banned_app'::text
            WHEN (COALESCE(inactive_roles.count, (0)::bigint) > 0) THEN 'partially_banned'::text
            ELSE 'active'::text
        END AS ban_status,
    latest_ban.ban_type AS latest_ban_type,
    latest_ban.action AS latest_action,
    latest_ban.ban_reason,
    latest_ban.is_permanent,
    latest_ban.banned_by,
    latest_ban.banned_at,
    latest_ban.unbanned_at,
    banned_by_user.full_name AS banned_by_name,
    banned_by_user.email AS banned_by_email
   FROM ((((user_profiles up
     LEFT JOIN ( SELECT user_organization_roles.user_id,
            count(*) AS count
           FROM user_organization_roles
          WHERE (user_organization_roles.is_active = true)
          GROUP BY user_organization_roles.user_id) active_roles ON ((up.id = active_roles.user_id)))
     LEFT JOIN ( SELECT user_organization_roles.user_id,
            count(*) AS count
           FROM user_organization_roles
          WHERE (user_organization_roles.is_active = false)
          GROUP BY user_organization_roles.user_id) inactive_roles ON ((up.id = inactive_roles.user_id)))
     LEFT JOIN LATERAL ( SELECT get_latest_ban_record.id,
            get_latest_ban_record.ban_type,
            get_latest_ban_record.action,
            get_latest_ban_record.ban_reason,
            get_latest_ban_record.is_permanent,
            get_latest_ban_record.banned_by,
            get_latest_ban_record.banned_at,
            get_latest_ban_record.unbanned_at,
            get_latest_ban_record.organization_id,
            get_latest_ban_record.role_assignment_id
           FROM get_latest_ban_record(up.id) get_latest_ban_record(id, ban_type, action, ban_reason, is_permanent, banned_by, banned_at, unbanned_at, organization_id, role_assignment_id)) latest_ban ON (true))
     LEFT JOIN user_profiles banned_by_user ON ((latest_ban.banned_by = banned_by_user.id)));


create or replace view "public"."view_user_roles_with_details" as  SELECT uor.id,
    uor.user_id,
    uor.organization_id,
    uor.role_id,
    uor.is_active,
    uor.created_at AS assigned_at,
    uor.updated_at AS assignment_updated_at,
    up.email AS user_email,
    up.full_name AS user_full_name,
    up.visible_name AS user_visible_name,
    up.phone AS user_phone,
    r.role AS role_name,
    o.name AS organization_name,
    o.is_active AS organization_is_active
   FROM (((user_organization_roles uor
     JOIN user_profiles up ON ((uor.user_id = up.id)))
     JOIN roles r ON ((uor.role_id = r.id)))
     JOIN organizations o ON ((uor.organization_id = o.id)));



