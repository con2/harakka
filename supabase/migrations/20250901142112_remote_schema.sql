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

revoke delete on table "public"."test2" from "anon";

revoke insert on table "public"."test2" from "anon";

revoke references on table "public"."test2" from "anon";

revoke select on table "public"."test2" from "anon";

revoke trigger on table "public"."test2" from "anon";

revoke truncate on table "public"."test2" from "anon";

revoke update on table "public"."test2" from "anon";

revoke delete on table "public"."test2" from "authenticated";

revoke insert on table "public"."test2" from "authenticated";

revoke references on table "public"."test2" from "authenticated";

revoke select on table "public"."test2" from "authenticated";

revoke trigger on table "public"."test2" from "authenticated";

revoke truncate on table "public"."test2" from "authenticated";

revoke update on table "public"."test2" from "authenticated";

revoke delete on table "public"."test2" from "service_role";

revoke insert on table "public"."test2" from "service_role";

revoke references on table "public"."test2" from "service_role";

revoke select on table "public"."test2" from "service_role";

revoke trigger on table "public"."test2" from "service_role";

revoke truncate on table "public"."test2" from "service_role";

revoke update on table "public"."test2" from "service_role";

alter table "public"."test2" drop constraint "test2_pkey";

drop index if exists "public"."test2_pkey";

drop table "public"."test2";

drop sequence if exists "public"."test2_id_seq";


