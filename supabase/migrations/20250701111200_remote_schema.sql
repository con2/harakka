create type "public"."roles_type" as enum ('super_admin', 'main_admin', 'admin', 'user', 'superVera', 'storage_manager', 'requester');

drop trigger if exists "update_multi_tenant_items_updated_at" on "public"."multi_tenant_items";

drop trigger if exists "update_user_tenant_roles_updated_at" on "public"."user_tenant_roles";

drop policy "Admins have full access to audit_logs" on "public"."audit_logs";

drop policy "System can insert audit logs" on "public"."audit_logs";

drop policy "Authenticated users can create items" on "public"."multi_tenant_items";

drop policy "Owners and admins can delete items" on "public"."multi_tenant_items";

drop policy "Owners and admins can update items" on "public"."multi_tenant_items";

drop policy "Tenant members can view appropriate items" on "public"."multi_tenant_items";

drop policy "Admins have full access to notifications" on "public"."notifications";

drop policy "System can insert notifications" on "public"."notifications";

drop policy "Users can mark their own notifications as read" on "public"."notifications";

drop policy "Users can view their own notifications" on "public"."notifications";

drop policy "Admins have full access to order_items" on "public"."order_items";

drop policy "Users can delete items from their own pending orders" on "public"."order_items";

drop policy "Users can insert items to their own pending orders" on "public"."order_items";

drop policy "Users can update items in their own pending orders" on "public"."order_items";

drop policy "Users can view their own order items" on "public"."order_items";

drop policy "Admins have full access to orders" on "public"."orders";

drop policy "Users can create their own orders" on "public"."orders";

drop policy "Users can update their pending orders" on "public"."orders";

drop policy "Users can view their own orders" on "public"."orders";

drop policy "Admins have full access to payments" on "public"."payments";

drop policy "Users can view their own payments" on "public"."payments";

drop policy "Admins have full access to promotions" on "public"."promotions";

drop policy "Public read access for active promotions" on "public"."promotions";

drop policy "Admins have full access to reviews" on "public"."reviews";

drop policy "Users can create reviews for items they ordered" on "public"."reviews";

drop policy "Users can delete their own reviews" on "public"."reviews";

drop policy "Users can update their own reviews" on "public"."reviews";

drop policy "Users can view all reviews" on "public"."reviews";

drop policy "Admin and Super Vera can delete roles" on "public"."roles";

drop policy "Admin and Super Vera can insert roles" on "public"."roles";

drop policy "Admin and Super Vera can update roles" on "public"."roles";

drop policy "any authenticated can read roles" on "public"."roles";

drop policy "Admins have full access to saved_list_items" on "public"."saved_list_items";

drop policy "Users can add items to their own saved lists" on "public"."saved_list_items";

drop policy "Users can remove items from their own saved lists" on "public"."saved_list_items";

drop policy "Users can update items in their own saved lists" on "public"."saved_list_items";

drop policy "Users can view items in their own saved lists" on "public"."saved_list_items";

drop policy "Admins have full access to saved_lists" on "public"."saved_lists";

drop policy "Users can create their own saved lists" on "public"."saved_lists";

drop policy "Users can delete their own saved lists" on "public"."saved_lists";

drop policy "Users can update their own saved lists" on "public"."saved_lists";

drop policy "Users can view their own saved lists" on "public"."saved_lists";

drop policy "Admins have full access to storage_images" on "public"."storage_images";

drop policy "Public read access for storage images" on "public"."storage_images";

drop policy "Admins have full access to item_images" on "public"."storage_item_images";

drop policy "Public read access for item images" on "public"."storage_item_images";

drop policy "Admins have full access to item_tags" on "public"."storage_item_tags";

drop policy "Admins have full access to storage_items" on "public"."storage_items";

drop policy "Allow anonymous read access to storage_items" on "public"."storage_items";

drop policy "Admins have full access to storage_locations" on "public"."storage_locations";

drop policy "Public read access for storage locations" on "public"."storage_locations";

drop policy "Admins have full access to working_hours" on "public"."storage_working_hours";

drop policy "Public read access for working hours" on "public"."storage_working_hours";

drop policy "Admins have full access to tags" on "public"."tags";

drop policy "Public read access for tags" on "public"."tags";

drop policy "Allow admins to manage test features" on "public"."test_features";

drop policy "Allow authenticated users to read test features" on "public"."test_features";

drop policy "Admins have full access to user_addresses" on "public"."user_addresses";

drop policy "Users can delete their own addresses" on "public"."user_addresses";

drop policy "Users can insert their own addresses" on "public"."user_addresses";

drop policy "Users can update their own addresses" on "public"."user_addresses";

drop policy "Users can view their own addresses" on "public"."user_addresses";

drop policy "Admin and Super Vera can delete user_profiles" on "public"."user_profiles";

drop policy "Admin and Super Vera can insert user_profiles" on "public"."user_profiles";

drop policy "Admin and Super Vera can select ALL user_profiles" on "public"."user_profiles";

drop policy "Admin and Super Vera can update user_profiles" on "public"."user_profiles";

drop policy "Anyone can insert user profiles" on "public"."user_profiles";

drop policy "Users can update their own profile" on "public"."user_profiles";

drop policy "Users can view their own profile" on "public"."user_profiles";

drop policy "Admin and Super Vera can delete user_roles" on "public"."user_roles";

drop policy "Admin and Super Vera can insert user_roles" on "public"."user_roles";

drop policy "Admin and Super Vera can update user_roles" on "public"."user_roles";

drop policy "any authenticated can read user_roles" on "public"."user_roles";

drop policy "Global admins can manage tenant roles" on "public"."user_tenant_roles";

drop policy "Global admins can view all tenant roles" on "public"."user_tenant_roles";

drop policy "Users can create their own basic roles" on "public"."user_tenant_roles";

drop policy "Users can view their own tenant roles" on "public"."user_tenant_roles";

revoke delete on table "public"."items" from "anon";

revoke insert on table "public"."items" from "anon";

revoke references on table "public"."items" from "anon";

revoke select on table "public"."items" from "anon";

revoke trigger on table "public"."items" from "anon";

revoke truncate on table "public"."items" from "anon";

revoke update on table "public"."items" from "anon";

revoke delete on table "public"."items" from "authenticated";

revoke insert on table "public"."items" from "authenticated";

revoke references on table "public"."items" from "authenticated";

revoke select on table "public"."items" from "authenticated";

revoke trigger on table "public"."items" from "authenticated";

revoke truncate on table "public"."items" from "authenticated";

revoke update on table "public"."items" from "authenticated";

revoke delete on table "public"."items" from "service_role";

revoke insert on table "public"."items" from "service_role";

revoke references on table "public"."items" from "service_role";

revoke select on table "public"."items" from "service_role";

revoke trigger on table "public"."items" from "service_role";

revoke truncate on table "public"."items" from "service_role";

revoke update on table "public"."items" from "service_role";

revoke delete on table "public"."multi_tenant_items" from "anon";

revoke insert on table "public"."multi_tenant_items" from "anon";

revoke references on table "public"."multi_tenant_items" from "anon";

revoke select on table "public"."multi_tenant_items" from "anon";

revoke trigger on table "public"."multi_tenant_items" from "anon";

revoke truncate on table "public"."multi_tenant_items" from "anon";

revoke update on table "public"."multi_tenant_items" from "anon";

revoke delete on table "public"."multi_tenant_items" from "authenticated";

revoke insert on table "public"."multi_tenant_items" from "authenticated";

revoke references on table "public"."multi_tenant_items" from "authenticated";

revoke select on table "public"."multi_tenant_items" from "authenticated";

revoke trigger on table "public"."multi_tenant_items" from "authenticated";

revoke truncate on table "public"."multi_tenant_items" from "authenticated";

revoke update on table "public"."multi_tenant_items" from "authenticated";

revoke delete on table "public"."multi_tenant_items" from "service_role";

revoke insert on table "public"."multi_tenant_items" from "service_role";

revoke references on table "public"."multi_tenant_items" from "service_role";

revoke select on table "public"."multi_tenant_items" from "service_role";

revoke trigger on table "public"."multi_tenant_items" from "service_role";

revoke truncate on table "public"."multi_tenant_items" from "service_role";

revoke update on table "public"."multi_tenant_items" from "service_role";

revoke delete on table "public"."notifications" from "anon";

revoke insert on table "public"."notifications" from "anon";

revoke references on table "public"."notifications" from "anon";

revoke select on table "public"."notifications" from "anon";

revoke trigger on table "public"."notifications" from "anon";

revoke truncate on table "public"."notifications" from "anon";

revoke update on table "public"."notifications" from "anon";

revoke delete on table "public"."notifications" from "authenticated";

revoke insert on table "public"."notifications" from "authenticated";

revoke references on table "public"."notifications" from "authenticated";

revoke select on table "public"."notifications" from "authenticated";

revoke trigger on table "public"."notifications" from "authenticated";

revoke truncate on table "public"."notifications" from "authenticated";

revoke update on table "public"."notifications" from "authenticated";

revoke delete on table "public"."notifications" from "service_role";

revoke insert on table "public"."notifications" from "service_role";

revoke references on table "public"."notifications" from "service_role";

revoke select on table "public"."notifications" from "service_role";

revoke trigger on table "public"."notifications" from "service_role";

revoke truncate on table "public"."notifications" from "service_role";

revoke update on table "public"."notifications" from "service_role";

revoke delete on table "public"."tenants" from "anon";

revoke insert on table "public"."tenants" from "anon";

revoke references on table "public"."tenants" from "anon";

revoke select on table "public"."tenants" from "anon";

revoke trigger on table "public"."tenants" from "anon";

revoke truncate on table "public"."tenants" from "anon";

revoke update on table "public"."tenants" from "anon";

revoke delete on table "public"."tenants" from "authenticated";

revoke insert on table "public"."tenants" from "authenticated";

revoke references on table "public"."tenants" from "authenticated";

revoke select on table "public"."tenants" from "authenticated";

revoke trigger on table "public"."tenants" from "authenticated";

revoke truncate on table "public"."tenants" from "authenticated";

revoke update on table "public"."tenants" from "authenticated";

revoke delete on table "public"."tenants" from "service_role";

revoke insert on table "public"."tenants" from "service_role";

revoke references on table "public"."tenants" from "service_role";

revoke select on table "public"."tenants" from "service_role";

revoke trigger on table "public"."tenants" from "service_role";

revoke truncate on table "public"."tenants" from "service_role";

revoke update on table "public"."tenants" from "service_role";

revoke delete on table "public"."user_tenant_roles" from "anon";

revoke insert on table "public"."user_tenant_roles" from "anon";

revoke references on table "public"."user_tenant_roles" from "anon";

revoke select on table "public"."user_tenant_roles" from "anon";

revoke trigger on table "public"."user_tenant_roles" from "anon";

revoke truncate on table "public"."user_tenant_roles" from "anon";

revoke update on table "public"."user_tenant_roles" from "anon";

revoke delete on table "public"."user_tenant_roles" from "authenticated";

revoke insert on table "public"."user_tenant_roles" from "authenticated";

revoke references on table "public"."user_tenant_roles" from "authenticated";

revoke select on table "public"."user_tenant_roles" from "authenticated";

revoke trigger on table "public"."user_tenant_roles" from "authenticated";

revoke truncate on table "public"."user_tenant_roles" from "authenticated";

revoke update on table "public"."user_tenant_roles" from "authenticated";

revoke delete on table "public"."user_tenant_roles" from "service_role";

revoke insert on table "public"."user_tenant_roles" from "service_role";

revoke references on table "public"."user_tenant_roles" from "service_role";

revoke select on table "public"."user_tenant_roles" from "service_role";

revoke trigger on table "public"."user_tenant_roles" from "service_role";

revoke truncate on table "public"."user_tenant_roles" from "service_role";

revoke update on table "public"."user_tenant_roles" from "service_role";

alter table "public"."items" drop constraint "items_tenant_id_fkey";

alter table "public"."multi_tenant_items" drop constraint "multi_tenant_items_owner_id_fkey";

alter table "public"."multi_tenant_items" drop constraint "multi_tenant_items_status_check";

alter table "public"."multi_tenant_items" drop constraint "multi_tenant_items_tenant_id_fkey";

alter table "public"."multi_tenant_items" drop constraint "multi_tenant_items_visibility_check";

alter table "public"."notifications" drop constraint "notifications_item_id_fkey";

alter table "public"."notifications" drop constraint "notifications_order_id_fkey";

alter table "public"."notifications" drop constraint "notifications_type_check";

alter table "public"."notifications" drop constraint "notifications_user_id_fkey";

alter table "public"."tenants" drop constraint "tenants_name_key";

alter table "public"."user_roles" drop constraint "user_roles_role_fkey";

alter table "public"."user_tenant_roles" drop constraint "user_tenant_roles_granted_by_fkey";

alter table "public"."user_tenant_roles" drop constraint "user_tenant_roles_tenant_id_fkey";

alter table "public"."user_tenant_roles" drop constraint "user_tenant_roles_unique";

alter table "public"."user_tenant_roles" drop constraint "user_tenant_roles_user_id_fkey";

alter table "public"."audit_logs" drop constraint "audit_logs_action_check";

alter table "public"."payments" drop constraint "payments_payment_method_check";

alter table "public"."payments" drop constraint "payments_status_check";

alter table "public"."promotions" drop constraint "promotions_discount_type_check";

alter table "public"."storage_images" drop constraint "storage_images_image_type_check";

alter table "public"."storage_item_images" drop constraint "storage_item_images_image_type_check";

alter table "public"."storage_working_hours" drop constraint "storage_working_hours_day_check";

alter table "public"."user_addresses" drop constraint "user_addresses_address_type_check";

alter table "public"."user_profiles" drop constraint "user_profiles_role_check";

drop function if exists "public"."clear_request_user_id"();

drop function if exists "public"."is_admin_only"();

drop function if exists "public"."is_elevated_core"(p_user_id uuid);

drop function if exists "public"."is_super_vera"();

drop view if exists "public"."multi_tenant_items_view";

drop function if exists "public"."set_request_user_id"(user_id uuid);

drop view if exists "public"."test_analytics_view";

drop view if exists "public"."test_booking_with_user_and_location";

drop function if exists "public"."user_is_tenant_admin"(p_user_id uuid, p_tenant_id uuid);

drop view if exists "public"."user_tenant_roles_view";

alter table "public"."items" drop constraint "items_pkey";

alter table "public"."multi_tenant_items" drop constraint "multi_tenant_items_pkey";

alter table "public"."notifications" drop constraint "notifications_pkey";

alter table "public"."tenants" drop constraint "tenants_pkey";

alter table "public"."user_tenant_roles" drop constraint "user_tenant_roles_pkey";

drop index if exists "public"."idx_notifications_user";

drop index if exists "public"."items_pkey";

drop index if exists "public"."multi_tenant_items_owner_id_idx";

drop index if exists "public"."multi_tenant_items_pkey";

drop index if exists "public"."multi_tenant_items_status_idx";

drop index if exists "public"."multi_tenant_items_tenant_id_idx";

drop index if exists "public"."notifications_pkey";

drop index if exists "public"."tenants_name_key";

drop index if exists "public"."tenants_pkey";

drop index if exists "public"."user_tenant_roles_active_idx";

drop index if exists "public"."user_tenant_roles_pkey";

drop index if exists "public"."user_tenant_roles_role_idx";

drop index if exists "public"."user_tenant_roles_tenant_id_idx";

drop index if exists "public"."user_tenant_roles_unique";

drop index if exists "public"."user_tenant_roles_user_id_idx";

drop table "public"."items";

drop table "public"."multi_tenant_items";

drop table "public"."notifications";

drop table "public"."tenants";

drop table "public"."user_tenant_roles";

alter type "public"."role_type" rename to "role_type__old_version_to_be_dropped";

create type "public"."role_type" as enum ('User', 'Admin', 'SuperVera', 'app_admin', 'main_admin', 'admin', 'user', 'superVera');

create table "public"."organization_items" (
    "id" uuid not null default uuid_generate_v4(),
    "organization_id" uuid not null,
    "storage_item_id" uuid not null,
    "owned_quantity" integer not null default 0,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid,
    "updated_by" uuid,
    "storage_location_id" uuid not null
);


create table "public"."organization_locations" (
    "id" uuid not null default uuid_generate_v4(),
    "organization_id" uuid not null,
    "storage_location_id" uuid not null,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."organizations" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "slug" character varying not null,
    "description" text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid,
    "updated_by" uuid
);


create table "public"."user_organization_roles" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "organization_id" uuid not null,
    "role_id" uuid not null,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid,
    "updated_by" uuid
);


alter table "public"."user_roles" alter column role type "public"."role_type" using role::text::"public"."role_type";

drop type "public"."role_type__old_version_to_be_dropped";

alter table "public"."order_items" add column "provider_organization_id" uuid;

alter table "public"."order_items" alter column "quantity" set not null;

alter table "public"."order_items" disable row level security;

alter table "public"."orders" disable row level security;

alter table "public"."promotions" add column "owner_organization_id" uuid;

alter table "public"."roles" alter column "role" set data type roles_type using "role"::text::roles_type;

alter table "public"."storage_images" disable row level security;

alter table "public"."storage_item_images" disable row level security;

alter table "public"."storage_item_tags" disable row level security;

alter table "public"."storage_items" disable row level security;

alter table "public"."storage_locations" disable row level security;

alter table "public"."tags" disable row level security;

alter table "public"."user_addresses" disable row level security;

alter table "public"."user_profiles" disable row level security;

alter table "public"."user_roles" disable row level security;

CREATE UNIQUE INDEX erm_organization_items_pkey ON public.organization_items USING btree (id);

CREATE UNIQUE INDEX erm_organization_locations_pkey ON public.organization_locations USING btree (id);

CREATE UNIQUE INDEX erm_organizations_pkey ON public.organizations USING btree (id);

CREATE UNIQUE INDEX erm_organizations_slug_key ON public.organizations USING btree (slug);

CREATE UNIQUE INDEX erm_user_organization_roles_pkey ON public.user_organization_roles USING btree (id);

CREATE UNIQUE INDEX unique_org_item_location ON public.organization_items USING btree (organization_id, storage_item_id, storage_location_id);

CREATE UNIQUE INDEX unique_org_location ON public.organization_locations USING btree (organization_id, storage_location_id);

CREATE UNIQUE INDEX unique_user_org_role ON public.user_organization_roles USING btree (user_id, organization_id, role_id);

alter table "public"."organization_items" add constraint "erm_organization_items_pkey" PRIMARY KEY using index "erm_organization_items_pkey";

alter table "public"."organization_locations" add constraint "erm_organization_locations_pkey" PRIMARY KEY using index "erm_organization_locations_pkey";

alter table "public"."organizations" add constraint "erm_organizations_pkey" PRIMARY KEY using index "erm_organizations_pkey";

alter table "public"."user_organization_roles" add constraint "erm_user_organization_roles_pkey" PRIMARY KEY using index "erm_user_organization_roles_pkey";

alter table "public"."order_items" add constraint "order_items_provider_organization_id_fkey" FOREIGN KEY (provider_organization_id) REFERENCES organizations(id) not valid;

alter table "public"."order_items" validate constraint "order_items_provider_organization_id_fkey";

alter table "public"."organization_items" add constraint "erm_organization_items_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."organization_items" validate constraint "erm_organization_items_created_by_fkey";

alter table "public"."organization_items" add constraint "erm_organization_items_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) not valid;

alter table "public"."organization_items" validate constraint "erm_organization_items_organization_id_fkey";

alter table "public"."organization_items" add constraint "erm_organization_items_storage_item_id_fkey" FOREIGN KEY (storage_item_id) REFERENCES storage_items(id) not valid;

alter table "public"."organization_items" validate constraint "erm_organization_items_storage_item_id_fkey";

alter table "public"."organization_items" add constraint "erm_organization_items_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."organization_items" validate constraint "erm_organization_items_updated_by_fkey";

alter table "public"."organization_items" add constraint "organization_items_storage_location_id_fkey" FOREIGN KEY (storage_location_id) REFERENCES storage_locations(id) not valid;

alter table "public"."organization_items" validate constraint "organization_items_storage_location_id_fkey";

alter table "public"."organization_items" add constraint "positive_quantity" CHECK ((owned_quantity >= 0)) not valid;

alter table "public"."organization_items" validate constraint "positive_quantity";

alter table "public"."organization_items" add constraint "unique_org_item_location" UNIQUE using index "unique_org_item_location";

alter table "public"."organization_locations" add constraint "erm_organization_locations_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) not valid;

alter table "public"."organization_locations" validate constraint "erm_organization_locations_organization_id_fkey";

alter table "public"."organization_locations" add constraint "erm_organization_locations_storage_location_id_fkey" FOREIGN KEY (storage_location_id) REFERENCES storage_locations(id) not valid;

alter table "public"."organization_locations" validate constraint "erm_organization_locations_storage_location_id_fkey";

alter table "public"."organization_locations" add constraint "unique_org_location" UNIQUE using index "unique_org_location";

alter table "public"."organizations" add constraint "erm_organizations_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."organizations" validate constraint "erm_organizations_created_by_fkey";

alter table "public"."organizations" add constraint "erm_organizations_slug_key" UNIQUE using index "erm_organizations_slug_key";

alter table "public"."organizations" add constraint "erm_organizations_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."organizations" validate constraint "erm_organizations_updated_by_fkey";

alter table "public"."promotions" add constraint "promotions_owner_organization_id_fkey" FOREIGN KEY (owner_organization_id) REFERENCES organizations(id) not valid;

alter table "public"."promotions" validate constraint "promotions_owner_organization_id_fkey";

alter table "public"."user_organization_roles" add constraint "erm_user_organization_roles_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."user_organization_roles" validate constraint "erm_user_organization_roles_created_by_fkey";

alter table "public"."user_organization_roles" add constraint "erm_user_organization_roles_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) not valid;

alter table "public"."user_organization_roles" validate constraint "erm_user_organization_roles_organization_id_fkey";

alter table "public"."user_organization_roles" add constraint "erm_user_organization_roles_role_id_fkey" FOREIGN KEY (role_id) REFERENCES roles(id) not valid;

alter table "public"."user_organization_roles" validate constraint "erm_user_organization_roles_role_id_fkey";

alter table "public"."user_organization_roles" add constraint "erm_user_organization_roles_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."user_organization_roles" validate constraint "erm_user_organization_roles_updated_by_fkey";

alter table "public"."user_organization_roles" add constraint "erm_user_organization_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."user_organization_roles" validate constraint "erm_user_organization_roles_user_id_fkey";

alter table "public"."user_organization_roles" add constraint "unique_user_org_role" UNIQUE using index "unique_user_org_role";

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

alter table "public"."user_profiles" add constraint "user_profiles_role_check" CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying, 'superVera'::character varying])::text[]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_role_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.calculate_storage_item_total(item_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(owned_quantity)
     FROM public.organization_items
     WHERE storage_item_id = item_id
     AND is_active = TRUE),
    0
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_organization_slug()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Generate slug from name
  NEW.slug := generate_slug(NEW.name);
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        TRIM(input_text),
        '[^a-zA-Z0-9\s-]', '', 'g'  -- Remove special characters
      ),
      '\s+', '-', 'g'  -- Replace spaces with hyphens
    )
  );
END;
$function$
;

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
AS $function$
declare
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
end;
$function$
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

CREATE OR REPLACE FUNCTION public.update_storage_item_totals()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.storage_items
    SET items_number_total = calculate_storage_item_total(NEW.storage_item_id)
    WHERE id = NEW.storage_item_id;
  END IF;

  -- Handle DELETE and UPDATE (when storage_item_id changes)
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.storage_item_id != NEW.storage_item_id) THEN
    UPDATE public.storage_items
    SET items_number_total = calculate_storage_item_total(OLD.storage_item_id)
    WHERE id = OLD.storage_item_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$
;

create or replace view "public"."view_item_location_summary" as  SELECT si.id AS storage_item_id,
    ((si.translations -> 'en'::text) ->> 'item_name'::text) AS item_name,
    sl.name AS location_name,
    sum(eoi.owned_quantity) AS total_at_location,
    count(DISTINCT eoi.organization_id) AS organizations_count,
    string_agg(((org.name || ': '::text) || (eoi.owned_quantity)::text), ', '::text ORDER BY org.name) AS organization_breakdown
   FROM (((storage_items si
     JOIN organization_items eoi ON ((si.id = eoi.storage_item_id)))
     JOIN organizations org ON ((eoi.organization_id = org.id)))
     JOIN storage_locations sl ON ((eoi.storage_location_id = sl.id)))
  WHERE (eoi.is_active = true)
  GROUP BY si.id, si.translations, sl.id, sl.name
  ORDER BY ((si.translations -> 'en'::text) ->> 'item_name'::text), sl.name;


create or replace view "public"."view_item_ownership_summary" as  SELECT si.id AS storage_item_id,
    ((si.translations -> 'en'::text) ->> 'item_name'::text) AS item_name,
    sl.name AS location_name,
    org.name AS organization_name,
    eoi.owned_quantity,
    si.items_number_total AS total_across_all_locations,
    location_totals.location_total
   FROM ((((storage_items si
     JOIN organization_items eoi ON ((si.id = eoi.storage_item_id)))
     JOIN organizations org ON ((eoi.organization_id = org.id)))
     JOIN storage_locations sl ON ((eoi.storage_location_id = sl.id)))
     LEFT JOIN ( SELECT organization_items.storage_item_id,
            organization_items.storage_location_id,
            sum(organization_items.owned_quantity) AS location_total
           FROM organization_items
          WHERE (organization_items.is_active = true)
          GROUP BY organization_items.storage_item_id, organization_items.storage_location_id) location_totals ON (((si.id = location_totals.storage_item_id) AND (eoi.storage_location_id = location_totals.storage_location_id))))
  WHERE (eoi.is_active = true)
  ORDER BY ((si.translations -> 'en'::text) ->> 'item_name'::text), sl.name, org.name;


CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  -- Removed the problematic "SET LOCAL ROLE postgres;" line
  
  INSERT INTO public.user_profiles (
    id, role, email, phone, created_at
  )
  VALUES (
    NEW.id, 'user', NEW.email, NEW.phone, NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."organization_items" to "anon";

grant insert on table "public"."organization_items" to "anon";

grant references on table "public"."organization_items" to "anon";

grant select on table "public"."organization_items" to "anon";

grant trigger on table "public"."organization_items" to "anon";

grant truncate on table "public"."organization_items" to "anon";

grant update on table "public"."organization_items" to "anon";

grant delete on table "public"."organization_items" to "authenticated";

grant insert on table "public"."organization_items" to "authenticated";

grant references on table "public"."organization_items" to "authenticated";

grant select on table "public"."organization_items" to "authenticated";

grant trigger on table "public"."organization_items" to "authenticated";

grant truncate on table "public"."organization_items" to "authenticated";

grant update on table "public"."organization_items" to "authenticated";

grant delete on table "public"."organization_items" to "service_role";

grant insert on table "public"."organization_items" to "service_role";

grant references on table "public"."organization_items" to "service_role";

grant select on table "public"."organization_items" to "service_role";

grant trigger on table "public"."organization_items" to "service_role";

grant truncate on table "public"."organization_items" to "service_role";

grant update on table "public"."organization_items" to "service_role";

grant delete on table "public"."organization_locations" to "anon";

grant insert on table "public"."organization_locations" to "anon";

grant references on table "public"."organization_locations" to "anon";

grant select on table "public"."organization_locations" to "anon";

grant trigger on table "public"."organization_locations" to "anon";

grant truncate on table "public"."organization_locations" to "anon";

grant update on table "public"."organization_locations" to "anon";

grant delete on table "public"."organization_locations" to "authenticated";

grant insert on table "public"."organization_locations" to "authenticated";

grant references on table "public"."organization_locations" to "authenticated";

grant select on table "public"."organization_locations" to "authenticated";

grant trigger on table "public"."organization_locations" to "authenticated";

grant truncate on table "public"."organization_locations" to "authenticated";

grant update on table "public"."organization_locations" to "authenticated";

grant delete on table "public"."organization_locations" to "service_role";

grant insert on table "public"."organization_locations" to "service_role";

grant references on table "public"."organization_locations" to "service_role";

grant select on table "public"."organization_locations" to "service_role";

grant trigger on table "public"."organization_locations" to "service_role";

grant truncate on table "public"."organization_locations" to "service_role";

grant update on table "public"."organization_locations" to "service_role";

grant delete on table "public"."organizations" to "anon";

grant insert on table "public"."organizations" to "anon";

grant references on table "public"."organizations" to "anon";

grant select on table "public"."organizations" to "anon";

grant trigger on table "public"."organizations" to "anon";

grant truncate on table "public"."organizations" to "anon";

grant update on table "public"."organizations" to "anon";

grant delete on table "public"."organizations" to "authenticated";

grant insert on table "public"."organizations" to "authenticated";

grant references on table "public"."organizations" to "authenticated";

grant select on table "public"."organizations" to "authenticated";

grant trigger on table "public"."organizations" to "authenticated";

grant truncate on table "public"."organizations" to "authenticated";

grant update on table "public"."organizations" to "authenticated";

grant delete on table "public"."organizations" to "service_role";

grant insert on table "public"."organizations" to "service_role";

grant references on table "public"."organizations" to "service_role";

grant select on table "public"."organizations" to "service_role";

grant trigger on table "public"."organizations" to "service_role";

grant truncate on table "public"."organizations" to "service_role";

grant update on table "public"."organizations" to "service_role";

grant delete on table "public"."user_organization_roles" to "anon";

grant insert on table "public"."user_organization_roles" to "anon";

grant references on table "public"."user_organization_roles" to "anon";

grant select on table "public"."user_organization_roles" to "anon";

grant trigger on table "public"."user_organization_roles" to "anon";

grant truncate on table "public"."user_organization_roles" to "anon";

grant update on table "public"."user_organization_roles" to "anon";

grant delete on table "public"."user_organization_roles" to "authenticated";

grant insert on table "public"."user_organization_roles" to "authenticated";

grant references on table "public"."user_organization_roles" to "authenticated";

grant select on table "public"."user_organization_roles" to "authenticated";

grant trigger on table "public"."user_organization_roles" to "authenticated";

grant truncate on table "public"."user_organization_roles" to "authenticated";

grant update on table "public"."user_organization_roles" to "authenticated";

grant delete on table "public"."user_organization_roles" to "service_role";

grant insert on table "public"."user_organization_roles" to "service_role";

grant references on table "public"."user_organization_roles" to "service_role";

grant select on table "public"."user_organization_roles" to "service_role";

grant trigger on table "public"."user_organization_roles" to "service_role";

grant truncate on table "public"."user_organization_roles" to "service_role";

grant update on table "public"."user_organization_roles" to "service_role";

CREATE TRIGGER update_erm_organization_items_updated_at BEFORE UPDATE ON public.organization_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storage_items_totals_trigger AFTER INSERT OR DELETE OR UPDATE ON public.organization_items FOR EACH ROW EXECUTE FUNCTION update_storage_item_totals();

CREATE TRIGGER update_erm_organization_locations_updated_at BEFORE UPDATE ON public.organization_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER generate_organizations_slug_trigger BEFORE INSERT OR UPDATE OF name ON public.organizations FOR EACH ROW EXECUTE FUNCTION generate_organization_slug();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_erm_user_organization_roles_updated_at BEFORE UPDATE ON public.user_organization_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


set check_function_bodies = off;

CREATE OR REPLACE FUNCTION security.has_role(p_role text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
begin
  return exists (
    select 1
    from public.user_roles ur
    where ur.profile_id = auth.uid()
      and lower(ur.role::text) = lower(p_role)   -- case-insensitive
  );
end;
$function$
;


