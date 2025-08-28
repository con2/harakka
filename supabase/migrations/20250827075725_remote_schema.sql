set check_function_bodies = off;

CREATE OR REPLACE FUNCTION auth.custom_access_token2(evt jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  uid    uuid;
  roles  jsonb;
begin
  -- evt is the base-claims JSON; skip anon sessions
  if not evt ? 'sub' then
    return evt;
  end if;

  uid := (evt ->> 'sub')::uuid;

  /* fetch active roles (index on user_id,is_active) */
  select jsonb_agg(jsonb_build_object(
           'role_id',        r.role_id,
           'role',           ro.role,
           'organization_id',r.organization_id,
           'organization',   org.name))
    into roles
  from   user_organization_roles r
  join   roles            ro  on ro.id  = r.role_id
  join   organizations    org on org.id = r.organization_id
  where  r.user_id = uid
    and  r.is_active;

  roles := coalesce(roles, '[]'::jsonb);

  /* merge roles into the existing claim set */
  return evt || jsonb_build_object(
           'app_metadata', jsonb_build_object(
             'roles',       roles,
             'role_count',  jsonb_array_length(roles)
           )
         );
end;
$function$
;

CREATE OR REPLACE FUNCTION auth.new_custom_access_token(evt jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  uid          uuid;
  roles        jsonb;
  meta         jsonb;
  primary_role text;
begin
  /* Skip anon / service-role sessions ----------------------------------------- */
  if not evt ? 'sub' then
    return evt;
  end if;

  uid := (evt ->> 'sub')::uuid;

  /* Build array of active role assignments ----------------------------------- */
  select jsonb_agg(
           jsonb_build_object(
             'id',                       r.id,
             'assigned_at',              r.assigned_at,
             'assignment_updated_at',    r.assignment_updated_at,
             'is_active',                r.is_active,
             'organization_id',          r.organization_id,
             'organization_is_active',   org.is_active,
             'organization_name',        org.name,
             'role_id',                  ro.id,
             'role_name',                ro.role
           )
         )
    into roles
  from   user_organization_roles r
  join   roles            ro  on ro.id  = r.role_id
  join   organizations    org on org.id = r.organization_id
  where  r.user_id = uid
    and  r.is_active;

  roles := coalesce(roles, '[]'::jsonb);

  /* Choose a “primary” role for quick front-end checks ----------------------- */
  select coalesce(
           (select 'superVera' from jsonb_array_elements(roles) e
             where e->>'role_name' = 'superVera' limit 1),
           (select 'admin'     from jsonb_array_elements(roles) e
             where e->>'role_name' = 'admin' limit 1),
           (select e->>'role_name' from jsonb_array_elements(roles) e limit 1)
         )
    into primary_role;

  /* Extend—don’t overwrite—existing app_metadata ----------------------------- */
  meta := coalesce(evt -> 'app_metadata', '{}'::jsonb);

  meta := meta
          || jsonb_build_object(
               'roles',         roles,
               'role_count',    jsonb_array_length(roles),
               'role',          primary_role,
               'last_role_sync', to_char(
                                   now() at time zone 'UTC',
                                   'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                                 )
             );

  /* Return the merged claim set --------------------------------------------- */
  return evt || jsonb_build_object('app_metadata', meta);
end;
$function$
;

CREATE OR REPLACE FUNCTION auth.new_custom_access_token_v2(evt jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  uid          uuid;
  roles        jsonb;
  meta         jsonb;
  primary_role text;
  full_evt     jsonb;
  new_claims   jsonb;
begin
  -- No longer skipping anon/service-role: always execute

  uid := (evt ->> 'sub')::uuid;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id',                       r.id,
      'assigned_at',              r.assigned_at,
      'assignment_updated_at',    r.assignment_updated_at,
      'is_active',                r.is_active,
      'organization_id',          r.organization_id,
      'organization_is_active',   org.is_active,
      'organization_name',        org.name,
      'role_id',                  ro.id,
      'role_name',                ro.role,
      'user_email',               up.email,
      'user_full_name',           up.full_name,
      'user_id',                  up.user_id,
      'user_phone',               up.phone,
      'user_visible_name',        up.visible_name
    )
  ), '[]'::jsonb)
    into roles
  from user_organization_roles r
  join roles ro   on ro.id = r.role_id
  join organizations org on org.id = r.organization_id
  left join user_profiles up on up.user_id = r.user_id
  where (evt ? 'sub' and r.user_id = uid and r.is_active) OR NOT (evt ? 'sub');

  select coalesce(
    (select 'superVera' from jsonb_array_elements(roles) e where e->>'role_name' = 'superVera' limit 1),
    (select 'admin' from jsonb_array_elements(roles) e where e->>'role_name' = 'admin' limit 1),
    (select e->>'role_name' from jsonb_array_elements(roles) e limit 1)
  ) into primary_role;

  meta := coalesce(evt -> 'app_metadata', '{}'::jsonb)
          || jsonb_build_object(
               'roles',         roles,
               'role_count',    jsonb_array_length(roles),
               'role',          primary_role,
               'last_role_sync', to_char(now() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
             );

  full_evt := evt || jsonb_build_object('app_metadata', meta);
  new_claims := full_evt -> 'app_metadata';
  return jsonb_build_object('claims', new_claims);
end;
$function$
;

CREATE OR REPLACE FUNCTION auth.new_custom_access_token_v3(evt jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  uid          uuid;
  roles        jsonb;
  meta         jsonb;
  primary_role text;
begin
  -- Skip anon / service-role sessions
  if not evt ? 'sub' then
    return evt;
  end if;

  uid := (evt ->> 'sub')::uuid;

  -- Build array of active role assignments using the view
  select coalesce(jsonb_agg(row_to_json(v)), '[]'::jsonb)
    into roles
  from view_user_roles_with_details v
  where v.user_id = uid
    and v.is_active;

  -- Determine primary role
  select coalesce(
    (select 'superVera'         from jsonb_array_elements(roles) e where e->>'role_name' = 'superVera' limit 1),
    (select 'admin'             from jsonb_array_elements(roles) e where e->>'role_name' = 'admin' limit 1),
    (select e->>'role_name'     from jsonb_array_elements(roles) e                             limit 1)
  )
  into primary_role;

  -- Prepare merged app_metadata
  meta := coalesce(evt -> 'app_metadata', '{}'::jsonb)
          || jsonb_build_object(
               'roles',          roles,
               'role_count',     jsonb_array_length(roles),
               'role',           primary_role,
               'last_role_sync', to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
             );

  -- Return updated claims payload
  return jsonb_build_object('claims', meta);
end;
$function$
;

CREATE OR REPLACE FUNCTION auth.new_custom_access_token_v4(evt jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  uid          uuid;
  roles        jsonb := '[]'::jsonb;
  primary_role text := 'user';
  new_meta     jsonb;
  claims       jsonb;
begin
  -- Parse user ID
  uid := (evt ->> 'sub')::uuid;

  -- Fetch roles from the view
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'role_name', role_name,
      'organization_id', organization_id,
      'organization_name', organization_name,
      'organization_is_active', organization_is_active,
      'assigned_at', assigned_at,
      'assignment_updated_at', assignment_updated_at
    )
  ), '[]'::jsonb)
  into roles
  from public.view_user_roles_with_details
  where user_id = uid and is_active;

  -- Logging: how many roles found
  raise notice 'User % has % roles', uid, jsonb_array_length(roles);

  -- Pick primary role (override as needed)
  select coalesce(
    (select 'superVera' from jsonb_array_elements(roles) e where e->>'role_name' = 'superVera' limit 1),
    (select 'admin' from jsonb_array_elements(roles) e where e->>'role_name' = 'admin' limit 1),
    (select e->>'role_name' from jsonb_array_elements(roles) e limit 1)
  )
  into primary_role;

  -- Build new app_metadata
  new_meta := jsonb_build_object(
    'roles', roles,
    'role_count', jsonb_array_length(roles),
    'role', primary_role,
    'last_role_sync', to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  );

  -- Full override of app_metadata in claims
  claims := evt || jsonb_build_object('app_metadata', new_meta);

  -- Return full claims object
  return jsonb_build_object('claims', claims);
end;
$function$
;

CREATE OR REPLACE FUNCTION auth.test_hook(evt jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  raise notice 'HOOK CALLED: %', evt;
  return evt;
end;
$function$
;

create type "public"."booking_status" as enum ('pending', 'confirmed', 'rejected', 'cancelled');

drop view if exists "public"."view_bookings_with_details";

drop view if exists "public"."view_bookings_with_user_info";

alter table "public"."booking_items" alter column "status" set data type booking_status using "status"::booking_status;

alter table "public"."bookings" alter column "status" set data type booking_status using "status"::booking_status;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_storage_item_totals()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.storage_items
    SET quantity = calculate_storage_item_total(NEW.storage_item_id)
    WHERE id = NEW.storage_item_id;
  END IF;

  -- Handle DELETE and UPDATE (when storage_item_id changes)
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.storage_item_id != NEW.storage_item_id) THEN
    UPDATE public.storage_items
    SET quantity = calculate_storage_item_total(OLD.storage_item_id)
    WHERE id = OLD.storage_item_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$
;

create or replace view "public"."view_bookings_with_details" as  SELECT b.id,
    b.booking_number,
    b.user_id,
    b.status,
    b.notes,
    b.created_at,
    b.updated_at,
    COALESCE(jsonb_agg(jsonb_build_object('id', bi.id, 'status', bi.status, 'item_id', bi.item_id, 'end_date', bi.end_date, 'quantity', bi.quantity, 'booking_id', bi.booking_id, 'created_at', bi.created_at, 'start_date', bi.start_date, 'total_days', bi.total_days, 'location_id', bi.location_id, 'provider_organization_id', bi.provider_organization_id, 'storage_items', jsonb_build_object('translations', si.translations))) FILTER (WHERE (bi.id IS NOT NULL)), '[]'::jsonb) AS booking_items
   FROM ((bookings b
     LEFT JOIN booking_items bi ON ((b.id = bi.booking_id)))
     LEFT JOIN storage_items si ON ((bi.item_id = si.id)))
  GROUP BY b.id, b.booking_number, b.user_id, b.status, b.notes, b.created_at, b.updated_at
  ORDER BY b.created_at DESC;


create or replace view "public"."view_bookings_with_user_info" as  SELECT b.id,
    b.status,
    b.created_at,
    b.booking_number,
    (b.created_at)::text AS created_at_text,
    u.full_name,
    u.visible_name,
    u.email,
    u.id AS user_id
   FROM (bookings b
     JOIN user_profiles u ON ((b.user_id = u.id)));



