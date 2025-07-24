drop trigger if exists "update_erm_organization_items_updated_at" on "public"."organization_items";

drop trigger if exists "update_erm_organization_locations_updated_at" on "public"."organization_locations";

drop trigger if exists "update_erm_user_organization_roles_updated_at" on "public"."user_organization_roles";

drop trigger if exists "trigger_update_jwt_on_role_definition_change" on "public"."roles";

drop trigger if exists "refresh_jwt_on_role_change" on "public"."user_organization_roles";

drop trigger if exists "trigger_update_jwt_on_role_change" on "public"."user_organization_roles";

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

CREATE TRIGGER update_organization_items_updated_at BEFORE UPDATE ON public.organization_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_locations_updated_at BEFORE UPDATE ON public.organization_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_organization_roles_updated_at BEFORE UPDATE ON public.user_organization_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_jwt_on_role_definition_change AFTER DELETE OR UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION update_jwt_on_role_definition_change();
ALTER TABLE "public"."roles" DISABLE TRIGGER "trigger_update_jwt_on_role_definition_change";

CREATE TRIGGER refresh_jwt_on_role_change AFTER INSERT OR DELETE OR UPDATE ON public.user_organization_roles FOR EACH ROW EXECUTE FUNCTION handle_user_role_change();
ALTER TABLE "public"."user_organization_roles" DISABLE TRIGGER "refresh_jwt_on_role_change";

CREATE TRIGGER trigger_update_jwt_on_role_change AFTER INSERT OR DELETE OR UPDATE ON public.user_organization_roles FOR EACH ROW EXECUTE FUNCTION update_user_jwt_on_role_change();
ALTER TABLE "public"."user_organization_roles" DISABLE TRIGGER "trigger_update_jwt_on_role_change";


