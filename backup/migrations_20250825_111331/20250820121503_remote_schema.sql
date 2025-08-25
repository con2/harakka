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

CREATE TRIGGER user_after_insert AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION trg_user_after_insert();

alter table "public"."audit_logs" drop constraint "audit_logs_action_check";

alter table "public"."promotions" drop constraint "promotions_discount_type_check";

alter table "public"."storage_images" drop constraint "storage_images_image_type_check";

alter table "public"."storage_item_images" drop constraint "storage_item_images_image_type_check";

alter table "public"."storage_working_hours" drop constraint "storage_working_hours_day_check";

alter table "public"."user_addresses" drop constraint "user_addresses_address_type_check";

alter table "public"."user_ban_history" drop constraint "user_ban_history_action_check";

alter table "public"."user_ban_history" drop constraint "user_ban_history_ban_type_check";

alter table "public"."user_ban_history" drop constraint "user_ban_history_role_assignment_id_fkey";

alter table "public"."audit_logs" add constraint "audit_logs_action_check" CHECK (((action)::text = ANY ((ARRAY['insert'::character varying, 'update'::character varying, 'delete'::character varying])::text[]))) not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_action_check";

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

alter table "public"."user_ban_history" add constraint "user_ban_history_role_assignment_id_fkey" FOREIGN KEY (role_assignment_id) REFERENCES user_organization_roles(id) not valid;

alter table "public"."user_ban_history" validate constraint "user_ban_history_role_assignment_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_all_full_orders(in_offset integer DEFAULT 0, in_limit integer DEFAULT 20)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_full_order(order_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$declare
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
end;$function$
;

CREATE OR REPLACE FUNCTION public.get_full_user_order(in_user_id uuid, in_offset integer DEFAULT 0, in_limit integer DEFAULT 20)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type notification_type, p_title text, p_message text DEFAULT NULL::text, p_channel notification_channel DEFAULT 'in_app'::notification_channel, p_severity notification_severity DEFAULT 'info'::notification_severity, p_metadata jsonb DEFAULT '{}'::jsonb, p_idempotency_key text DEFAULT gen_random_uuid())
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_full_bookings(in_offset integer, in_limit integer)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_full_booking(booking_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_full_user_booking(in_user_id uuid, in_offset integer, in_limit integer)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_request_user_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  select current_setting('request.jwt.claim.sub', true)::uuid;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid, p_org_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.user_organization_roles uor
    join public.roles r on r.id = uor.role_id
    where uor.user_id   = p_user_id
      and uor.is_active = true
      and r.role        = 'admin'           -- ⚠️ make sure the literal matches your roles_type enum
      and (p_org_id is null or uor.organization_id = p_org_id)
  );
$function$
;

CREATE OR REPLACE FUNCTION public.notify(p_user_id uuid, p_type_txt text, p_title text DEFAULT ''::text, p_message text DEFAULT ''::text, p_channel notification_channel DEFAULT 'in_app'::notification_channel, p_severity notification_severity DEFAULT 'info'::notification_severity, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select public.create_notification(
    p_user_id,
    p_type_txt::notification_type,  -- single cast lives here
    p_title,
    p_message,
    p_channel,
    p_severity,
    p_metadata
  );
$function$
;

CREATE OR REPLACE FUNCTION public.trg_booking_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.trg_user_after_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_booking_amounts()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- No-op function since we removed all financial functionality
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;  
  END IF;
END;
$function$
;


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



