create type "public"."booking_status" as enum ('pending', 'confirmed', 'rejected', 'cancelled');

drop view if exists "public"."view_bookings_with_details";

drop view if exists "public"."view_bookings_with_user_info";

-- Clean up workflow_test table if it exists
drop table if exists "public"."workflow_test";

alter table "public"."booking_items" alter column "status" set data type booking_status using "status"::booking_status;

alter table "public"."bookings" alter column "status" set data type booking_status using "status"::booking_status;

drop sequence if exists "public"."workflow_test_id_seq";

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
