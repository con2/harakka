alter table "public"."audit_logs" drop constraint "audit_logs_action_check";

alter table "public"."promotions" drop constraint "promotions_discount_type_check";

alter table "public"."storage_images" drop constraint "storage_images_image_type_check";

alter table "public"."storage_item_images" drop constraint "storage_item_images_image_type_check";

alter table "public"."storage_working_hours" drop constraint "storage_working_hours_day_check";

alter table "public"."user_addresses" drop constraint "user_addresses_address_type_check";

alter table "public"."user_ban_history" drop constraint "user_ban_history_action_check";

alter table "public"."user_ban_history" drop constraint "user_ban_history_ban_type_check";

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

drop policy "Admin Delete Item Images 6eeiel_0" on "storage"."objects";

drop policy "TEMP: Allow access 6eeiel_0" on "storage"."objects";

drop policy "TEMP: Allow access 6eeiel_1" on "storage"."objects";

drop policy "TEMP: Allow access 6eeiel_2" on "storage"."objects";


