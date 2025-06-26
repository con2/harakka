drop policy "Users can create reviews for items they ordered" on "public"."reviews";

alter table "public"."audit_logs" drop constraint "audit_logs_action_check";

alter table "public"."notifications" drop constraint "notifications_type_check";

alter table "public"."payments" drop constraint "payments_payment_method_check";

alter table "public"."payments" drop constraint "payments_status_check";

alter table "public"."promotions" drop constraint "promotions_discount_type_check";

alter table "public"."storage_images" drop constraint "storage_images_image_type_check";

alter table "public"."storage_item_images" drop constraint "storage_item_images_image_type_check";

alter table "public"."storage_working_hours" drop constraint "storage_working_hours_day_check";

alter table "public"."user_addresses" drop constraint "user_addresses_address_type_check";

alter table "public"."user_profiles" drop constraint "user_profiles_role_check";

alter table "public"."audit_logs" add constraint "audit_logs_action_check" CHECK (((action)::text = ANY ((ARRAY['insert'::character varying, 'update'::character varying, 'delete'::character varying])::text[]))) not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_action_check";

alter table "public"."notifications" add constraint "notifications_type_check" CHECK (((type)::text = ANY ((ARRAY['order_confirmation'::character varying, 'payment_reminder'::character varying, 'status_update'::character varying])::text[]))) not valid;

alter table "public"."notifications" validate constraint "notifications_type_check";

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

alter table "public"."user_profiles" add constraint "user_profiles_role_check" CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying, 'superVera'::character varying])::text[]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_role_check";

create or replace view "public"."test_booking_with_user_and_location" as  SELECT orders.id,
    orders.order_number,
    orders.user_id,
    orders.status,
    orders.total_amount,
    orders.discount_amount,
    orders.discount_code,
    orders.final_amount,
    orders.payment_status,
    orders.notes,
    orders.created_at,
    orders.updated_at,
    orders.payment_details,
    user_profiles.full_name,
    user_profiles.email
   FROM (orders
     JOIN user_profiles ON ((orders.user_id = user_profiles.id)));


create policy "Users can create reviews for items they ordered"
on "public"."reviews"
as permissive
for insert
to public
with check (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM (order_items
     JOIN orders ON ((order_items.order_id = orders.id)))
  WHERE ((order_items.item_id = reviews.item_id) AND (orders.user_id = auth.uid()) AND ((orders.status)::text = ANY ((ARRAY['completed'::character varying, 'paid'::character varying])::text[])))))));



