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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
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
$function$;
CREATE TRIGGER user_after_insert AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION trg_user_after_insert();
revoke select on table "storage"."iceberg_namespaces" from "anon";
revoke select on table "storage"."iceberg_namespaces" from "authenticated";
revoke delete on table "storage"."iceberg_namespaces" from "service_role";
revoke insert on table "storage"."iceberg_namespaces" from "service_role";
revoke references on table "storage"."iceberg_namespaces" from "service_role";
revoke select on table "storage"."iceberg_namespaces" from "service_role";
revoke trigger on table "storage"."iceberg_namespaces" from "service_role";
revoke truncate on table "storage"."iceberg_namespaces" from "service_role";
revoke update on table "storage"."iceberg_namespaces" from "service_role";
revoke select on table "storage"."iceberg_tables" from "anon";
revoke select on table "storage"."iceberg_tables" from "authenticated";
revoke delete on table "storage"."iceberg_tables" from "service_role";
revoke insert on table "storage"."iceberg_tables" from "service_role";
revoke references on table "storage"."iceberg_tables" from "service_role";
revoke select on table "storage"."iceberg_tables" from "service_role";
revoke trigger on table "storage"."iceberg_tables" from "service_role";
revoke truncate on table "storage"."iceberg_tables" from "service_role";
revoke update on table "storage"."iceberg_tables" from "service_role";
alter table "storage"."iceberg_namespaces" drop constraint "iceberg_namespaces_bucket_id_fkey";
alter table "storage"."iceberg_tables" drop constraint "iceberg_tables_bucket_id_fkey";
alter table "storage"."iceberg_tables" drop constraint "iceberg_tables_namespace_id_fkey";
alter table "storage"."iceberg_namespaces" drop constraint "iceberg_namespaces_pkey";
alter table "storage"."iceberg_tables" drop constraint "iceberg_tables_pkey";
drop index if exists "storage"."iceberg_namespaces_pkey";
drop index if exists "storage"."iceberg_tables_pkey";
drop index if exists "storage"."idx_iceberg_namespaces_bucket_id";
drop index if exists "storage"."idx_iceberg_tables_namespace_id";
drop table "storage"."iceberg_namespaces";
drop table "storage"."iceberg_tables";
create policy "Admin Delete Item Images 6eeiel_0"
  on "storage"."objects"
  as permissive
  for delete
  to public
using ((bucket_id = 'item-images-drafts'::text));
create policy "Admin Delete Item Images"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'item-images'::text) AND (auth.role() = 'authenticated'::text)));
create policy "Admin Insert Item Images"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'item-images'::text) AND (auth.role() = 'authenticated'::text)));
create policy "Admin can delete 6eeiel_0 6eeiel_0"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'item-images'::text) AND (auth.role() = 'authenticated'::text)));
create policy "Admin can delete 6eeiel_0"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'item-images'::text) AND (auth.role() = 'authenticated'::text)));
create policy "Give users access to own folder 1skn4k9_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'profile-pictures'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));
create policy "Give users access to own folder 1skn4k9_1"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'profile-pictures'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));
create policy "Give users access to own folder 1skn4k9_2"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'profile-pictures'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));
create policy "Give users access to own folder 1skn4k9_3"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'profile-pictures'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));
create policy "Public Access to Item Images 6eeiel_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using (true);
create policy "Public Access to Item Images"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'item-images'::text));
create policy "Public Read Access"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'item-images'::text));
create policy "TEMP: Allow access 6eeiel_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'item-images-drafts'::text));
create policy "TEMP: Allow access 6eeiel_1"
  on "storage"."objects"
  as permissive
  for update
  to public
using ((bucket_id = 'item-images-drafts'::text));
create policy "TEMP: Allow access 6eeiel_2"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'item-images-drafts'::text));
create policy "anyone can do anything 1jxj86u_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'organization-logo-picture'::text));
create policy "anyone can do anything 1jxj86u_1"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'organization-logo-picture'::text));
create policy "anyone can do anything 1jxj86u_2"
  on "storage"."objects"
  as permissive
  for update
  to public
using ((bucket_id = 'organization-logo-picture'::text));
create policy "anyone can do anything 1jxj86u_3"
  on "storage"."objects"
  as permissive
  for delete
  to public
using ((bucket_id = 'organization-logo-picture'::text));
