create type "public"."notification_channel" as enum ('in_app', 'web_push', 'email');

create type "public"."notification_severity" as enum ('info', 'warning', 'critical');

create type "public"."notification_type" as enum ('comment', 'mention', 'system', 'custom');

create type "public"."role_type" as enum ('User', 'Admin', 'SuperVera', 'app_admin', 'main_admin', 'admin', 'user', 'superVera');

create type "public"."roles_type" as enum ('super_admin', 'main_admin', 'admin', 'user', 'superVera', 'storage_manager', 'requester');

create table "public"."audit_logs" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "table_name" character varying not null,
    "record_id" uuid not null,
    "action" character varying not null,
    "user_id" uuid,
    "old_values" jsonb,
    "new_values" jsonb,
    "created_at" timestamp with time zone default now()
);


create table "public"."booking_items" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "booking_id" uuid not null,
    "item_id" uuid not null,
    "quantity" integer not null default 1,
    "unit_price" numeric,
    "start_date" timestamp with time zone not null,
    "end_date" timestamp with time zone not null,
    "total_days" integer not null,
    "subtotal" numeric,
    "status" character varying not null,
    "location_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "provider_organization_id" uuid
);


create table "public"."bookings" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "booking_number" character varying not null,
    "user_id" uuid not null,
    "status" character varying not null,
    "total_amount" numeric,
    "discount_amount" numeric default 0,
    "discount_code" character varying,
    "final_amount" numeric,
    "payment_status" character varying,
    "notes" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone,
    "payment_details" jsonb
);


create table "public"."invoices" (
    "id" uuid not null default gen_random_uuid(),
    "invoice_number" text not null,
    "order_id" uuid,
    "user_id" uuid,
    "created_at" timestamp without time zone default now(),
    "due_date" date,
    "reference_number" text,
    "total_amount" numeric,
    "pdf_url" text
);


create table "public"."notifications" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "delivered_at" timestamp with time zone,
    "read_at" timestamp with time zone,
    "type" notification_type not null,
    "severity" notification_severity not null default 'info'::notification_severity,
    "title" text not null,
    "message" text,
    "channel" notification_channel not null default 'in_app'::notification_channel,
    "metadata" jsonb,
    "idempotency_key" text not null default gen_random_uuid()
);


alter table "public"."notifications" enable row level security;

create table "public"."organization_items" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid not null,
    "storage_item_id" uuid not null,
    "owned_quantity" integer not null default 0,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid,
    "updated_by" uuid,
    "storage_location_id" uuid not null
);


create table "public"."organization_locations" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid not null,
    "storage_location_id" uuid not null,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."organizations" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" text not null,
    "slug" character varying not null,
    "description" text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid,
    "updated_by" uuid,
    "is_deleted" boolean default false
);


create table "public"."payments" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "booking_id" uuid not null,
    "amount" numeric not null,
    "payment_method" character varying not null,
    "transaction_id" character varying,
    "status" character varying not null,
    "payment_date" timestamp with time zone not null,
    "created_at" timestamp with time zone default now(),
    "metadata" jsonb
);


alter table "public"."payments" enable row level security;

create table "public"."promotions" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "code" character varying not null,
    "description" character varying not null,
    "discount_type" character varying not null,
    "discount_value" numeric not null,
    "min_order_amount" numeric,
    "max_discount" numeric,
    "starts_at" timestamp with time zone not null,
    "expires_at" timestamp with time zone not null,
    "usage_limit" integer,
    "times_used" integer default 0,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "owner_organization_id" uuid
);


alter table "public"."promotions" enable row level security;

create table "public"."reviews" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "item_id" uuid not null,
    "rating" integer not null,
    "review_text" text,
    "is_verified" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."reviews" enable row level security;

create table "public"."roles" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "role" roles_type not null
);


create table "public"."saved_list_items" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "list_id" uuid not null,
    "item_id" uuid not null,
    "added_at" timestamp with time zone default now(),
    "notes" text
);


alter table "public"."saved_list_items" enable row level security;

create table "public"."saved_lists" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "name" character varying not null,
    "description" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."saved_lists" enable row level security;

create table "public"."storage_analytics" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "location_id" uuid not null,
    "date" date not null,
    "total_bookings" integer default 0,
    "total_revenue" numeric default 0,
    "occupancy_rate" numeric default 0,
    "created_at" timestamp with time zone default now()
);


create table "public"."storage_compartments" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "created_at" timestamp with time zone default now(),
    "translations" jsonb
);


create table "public"."storage_images" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "location_id" uuid not null,
    "image_url" character varying not null,
    "image_type" character varying not null,
    "display_order" integer not null,
    "alt_text" character varying,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now()
);


create table "public"."storage_item_images" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "item_id" uuid not null,
    "image_url" character varying not null,
    "image_type" character varying not null,
    "display_order" integer not null,
    "alt_text" character varying,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "storage_path" character varying not null
);


create table "public"."storage_item_tags" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "item_id" uuid not null,
    "tag_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "translations" jsonb
);


create table "public"."storage_items" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "location_id" uuid not null,
    "compartment_id" uuid,
    "items_number_total" numeric not null,
    "price" numeric not null,
    "average_rating" numeric default 0,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "translations" jsonb,
    "items_number_currently_in_storage" numeric,
    "is_deleted" boolean default false,
    "test_priority_score" numeric default 0,
    "test_metadata" jsonb default '{}'::jsonb,
    "items_number_available" numeric
);


create table "public"."storage_locations" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" character varying not null,
    "description" character varying,
    "address" character varying not null,
    "latitude" numeric,
    "longitude" numeric,
    "created_at" timestamp with time zone default now(),
    "is_active" boolean default true,
    "image_url" character varying
);


create table "public"."storage_working_hours" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "location_id" uuid not null,
    "day" character varying not null,
    "open_time" time without time zone not null,
    "close_time" time without time zone not null,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now()
);


alter table "public"."storage_working_hours" enable row level security;

create table "public"."tags" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "created_at" timestamp with time zone default now(),
    "translations" jsonb
);


create table "public"."test" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."test" enable row level security;

create table "public"."test_features" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "feature_name" character varying(255) not null,
    "description" text,
    "is_enabled" boolean default false,
    "test_data" jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."test_features" enable row level security;

create table "public"."user_addresses" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "address_type" character varying not null,
    "street_address" character varying not null,
    "city" character varying not null,
    "postal_code" character varying not null,
    "country" character varying not null,
    "is_default" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."user_ban_history" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "banned_by" uuid not null,
    "ban_type" character varying not null,
    "action" character varying not null,
    "ban_reason" text,
    "is_permanent" boolean default false,
    "role_assignment_id" uuid,
    "organization_id" uuid,
    "affected_assignments" jsonb,
    "banned_at" timestamp with time zone default now(),
    "unbanned_at" timestamp with time zone,
    "notes" text,
    "created_at" timestamp with time zone default now()
);


create table "public"."user_organization_roles" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "organization_id" uuid not null,
    "role_id" uuid not null,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid,
    "updated_by" uuid
);


create table "public"."user_profiles" (
    "id" uuid not null,
    "full_name" character varying,
    "visible_name" character varying,
    "phone" character varying,
    "email" character varying,
    "saved_lists" jsonb,
    "preferences" jsonb,
    "created_at" timestamp with time zone default now(),
    "role" text,
    "profile_picture_url" text
);


create table "public"."user_roles" (
    "profile_id" uuid not null,
    "role" role_type not null,
    "created_at" timestamp with time zone default (now() AT TIME ZONE 'utc'::text)
);


CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id);

CREATE UNIQUE INDEX erm_organization_items_pkey ON public.organization_items USING btree (id);

CREATE UNIQUE INDEX erm_organization_locations_pkey ON public.organization_locations USING btree (id);

CREATE UNIQUE INDEX erm_organizations_pkey ON public.organizations USING btree (id);

CREATE UNIQUE INDEX erm_organizations_slug_key ON public.organizations USING btree (slug);

CREATE UNIQUE INDEX erm_user_organization_roles_pkey ON public.user_organization_roles USING btree (id);

CREATE INDEX idx_order_items_order ON public.booking_items USING btree (booking_id);

CREATE INDEX idx_orders_user ON public.bookings USING btree (user_id);

CREATE INDEX idx_payments_order ON public.payments USING btree (booking_id);

CREATE INDEX idx_reviews_item ON public.reviews USING btree (item_id);

CREATE INDEX idx_storage_items_location ON public.storage_items USING btree (location_id);

CREATE INDEX idx_storage_items_translations ON public.storage_items USING gin (translations);

CREATE INDEX idx_tags_translations ON public.tags USING gin (translations);

CREATE INDEX idx_user_ban_history_action ON public.user_ban_history USING btree (action);

CREATE INDEX idx_user_ban_history_ban_type ON public.user_ban_history USING btree (ban_type);

CREATE INDEX idx_user_ban_history_banned_at ON public.user_ban_history USING btree (banned_at);

CREATE INDEX idx_user_ban_history_banned_by ON public.user_ban_history USING btree (banned_by);

CREATE INDEX idx_user_ban_history_organization_id ON public.user_ban_history USING btree (organization_id);

CREATE INDEX idx_user_ban_history_role_assignment_id ON public.user_ban_history USING btree (role_assignment_id);

CREATE INDEX idx_user_ban_history_user_id ON public.user_ban_history USING btree (user_id);

CREATE INDEX idx_user_org_roles_user_active ON public.user_organization_roles USING btree (user_id, is_active) INCLUDE (role_id, organization_id);

CREATE UNIQUE INDEX invoices_invoice_number_key ON public.invoices USING btree (invoice_number);

CREATE UNIQUE INDEX invoices_pkey ON public.invoices USING btree (id);

CREATE UNIQUE INDEX notifications_idempotency_key_key ON public.notifications USING btree (idempotency_key);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX order_items_pkey ON public.booking_items USING btree (id);

CREATE UNIQUE INDEX orders_order_number_key ON public.bookings USING btree (booking_number);

CREATE UNIQUE INDEX orders_pkey ON public.bookings USING btree (id);

CREATE UNIQUE INDEX payments_pkey ON public.payments USING btree (id);

CREATE UNIQUE INDEX promotions_code_key ON public.promotions USING btree (code);

CREATE UNIQUE INDEX promotions_pkey ON public.promotions USING btree (id);

CREATE UNIQUE INDEX reviews_pkey ON public.reviews USING btree (id);

CREATE UNIQUE INDEX roles_pkey ON public.roles USING btree (id);

CREATE UNIQUE INDEX roles_role_key ON public.roles USING btree (role);

CREATE UNIQUE INDEX saved_list_items_pkey ON public.saved_list_items USING btree (id);

CREATE UNIQUE INDEX saved_lists_pkey ON public.saved_lists USING btree (id);

CREATE INDEX storage_analytics_location_date_idx ON public.storage_analytics USING btree (location_id, date);

CREATE UNIQUE INDEX storage_analytics_pkey ON public.storage_analytics USING btree (id);

CREATE UNIQUE INDEX storage_compartments_pkey ON public.storage_compartments USING btree (id);

CREATE UNIQUE INDEX storage_images_pkey ON public.storage_images USING btree (id);

CREATE UNIQUE INDEX storage_item_images_pkey ON public.storage_item_images USING btree (id);

CREATE UNIQUE INDEX storage_item_tags_pkey ON public.storage_item_tags USING btree (id);

CREATE UNIQUE INDEX storage_items_pkey ON public.storage_items USING btree (id);

CREATE INDEX storage_items_test_metadata_idx ON public.storage_items USING gin (test_metadata);

CREATE UNIQUE INDEX storage_locations_pkey ON public.storage_locations USING btree (id);

CREATE UNIQUE INDEX storage_working_hours_pkey ON public.storage_working_hours USING btree (id);

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

CREATE INDEX test_features_feature_name_idx ON public.test_features USING btree (feature_name);

CREATE UNIQUE INDEX test_features_pkey ON public.test_features USING btree (id);

CREATE UNIQUE INDEX test_pkey ON public.test USING btree (id);

CREATE UNIQUE INDEX unique_org_item_location ON public.organization_items USING btree (organization_id, storage_item_id, storage_location_id);

CREATE UNIQUE INDEX unique_org_location ON public.organization_locations USING btree (organization_id, storage_location_id);

CREATE UNIQUE INDEX unique_user_org_role ON public.user_organization_roles USING btree (user_id, organization_id, role_id);

CREATE UNIQUE INDEX user_addresses_pkey ON public.user_addresses USING btree (id);

CREATE UNIQUE INDEX user_ban_history_pkey ON public.user_ban_history USING btree (id);

CREATE UNIQUE INDEX user_profiles_email_key ON public.user_profiles USING btree (email);

CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);

CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (profile_id);

alter table "public"."audit_logs" add constraint "audit_logs_pkey" PRIMARY KEY using index "audit_logs_pkey";

alter table "public"."booking_items" add constraint "order_items_pkey" PRIMARY KEY using index "order_items_pkey";

alter table "public"."bookings" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."invoices" add constraint "invoices_pkey" PRIMARY KEY using index "invoices_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."organization_items" add constraint "erm_organization_items_pkey" PRIMARY KEY using index "erm_organization_items_pkey";

alter table "public"."organization_locations" add constraint "erm_organization_locations_pkey" PRIMARY KEY using index "erm_organization_locations_pkey";

alter table "public"."organizations" add constraint "erm_organizations_pkey" PRIMARY KEY using index "erm_organizations_pkey";

alter table "public"."payments" add constraint "payments_pkey" PRIMARY KEY using index "payments_pkey";

alter table "public"."promotions" add constraint "promotions_pkey" PRIMARY KEY using index "promotions_pkey";

alter table "public"."reviews" add constraint "reviews_pkey" PRIMARY KEY using index "reviews_pkey";

alter table "public"."roles" add constraint "roles_pkey" PRIMARY KEY using index "roles_pkey";

alter table "public"."saved_list_items" add constraint "saved_list_items_pkey" PRIMARY KEY using index "saved_list_items_pkey";

alter table "public"."saved_lists" add constraint "saved_lists_pkey" PRIMARY KEY using index "saved_lists_pkey";

alter table "public"."storage_analytics" add constraint "storage_analytics_pkey" PRIMARY KEY using index "storage_analytics_pkey";

alter table "public"."storage_compartments" add constraint "storage_compartments_pkey" PRIMARY KEY using index "storage_compartments_pkey";

alter table "public"."storage_images" add constraint "storage_images_pkey" PRIMARY KEY using index "storage_images_pkey";

alter table "public"."storage_item_images" add constraint "storage_item_images_pkey" PRIMARY KEY using index "storage_item_images_pkey";

alter table "public"."storage_item_tags" add constraint "storage_item_tags_pkey" PRIMARY KEY using index "storage_item_tags_pkey";

alter table "public"."storage_items" add constraint "storage_items_pkey" PRIMARY KEY using index "storage_items_pkey";

alter table "public"."storage_locations" add constraint "storage_locations_pkey" PRIMARY KEY using index "storage_locations_pkey";

alter table "public"."storage_working_hours" add constraint "storage_working_hours_pkey" PRIMARY KEY using index "storage_working_hours_pkey";

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."test" add constraint "test_pkey" PRIMARY KEY using index "test_pkey";

alter table "public"."test_features" add constraint "test_features_pkey" PRIMARY KEY using index "test_features_pkey";

alter table "public"."user_addresses" add constraint "user_addresses_pkey" PRIMARY KEY using index "user_addresses_pkey";

alter table "public"."user_ban_history" add constraint "user_ban_history_pkey" PRIMARY KEY using index "user_ban_history_pkey";

alter table "public"."user_organization_roles" add constraint "erm_user_organization_roles_pkey" PRIMARY KEY using index "erm_user_organization_roles_pkey";

alter table "public"."user_profiles" add constraint "user_profiles_pkey" PRIMARY KEY using index "user_profiles_pkey";

alter table "public"."user_roles" add constraint "user_roles_pkey" PRIMARY KEY using index "user_roles_pkey";

alter table "public"."audit_logs" add constraint "audit_logs_action_check" CHECK (((action)::text = ANY ((ARRAY['insert'::character varying, 'update'::character varying, 'delete'::character varying])::text[]))) not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_action_check";

alter table "public"."audit_logs" add constraint "audit_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_user_id_fkey";

alter table "public"."booking_items" add constraint "order_items_item_id_fkey" FOREIGN KEY (item_id) REFERENCES storage_items(id) not valid;

alter table "public"."booking_items" validate constraint "order_items_item_id_fkey";

alter table "public"."booking_items" add constraint "order_items_location_id_fkey" FOREIGN KEY (location_id) REFERENCES storage_locations(id) not valid;

alter table "public"."booking_items" validate constraint "order_items_location_id_fkey";

alter table "public"."booking_items" add constraint "order_items_order_id_fkey" FOREIGN KEY (booking_id) REFERENCES bookings(id) not valid;

alter table "public"."booking_items" validate constraint "order_items_order_id_fkey";

alter table "public"."booking_items" add constraint "order_items_provider_organization_id_fkey" FOREIGN KEY (provider_organization_id) REFERENCES organizations(id) not valid;

alter table "public"."booking_items" validate constraint "order_items_provider_organization_id_fkey";

alter table "public"."booking_items" add constraint "order_items_status_check" CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('confirmed'::character varying)::text, ('cancelled'::character varying)::text, ('picked_up'::character varying)::text, ('returned'::character varying)::text]))) not valid;

alter table "public"."booking_items" validate constraint "order_items_status_check";

alter table "public"."bookings" add constraint "orders_order_number_key" UNIQUE using index "orders_order_number_key";

alter table "public"."bookings" add constraint "orders_payment_status_check" CHECK (((payment_status)::text = ANY (ARRAY[('invoice-sent'::character varying)::text, ('partial'::character varying)::text, ('overdue'::character varying)::text, ('payment-rejected'::character varying)::text, ('paid'::character varying)::text, ('refunded'::character varying)::text]))) not valid;

alter table "public"."bookings" validate constraint "orders_payment_status_check";

alter table "public"."bookings" add constraint "orders_status_check" CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('confirmed'::character varying)::text, ('paid'::character varying)::text, ('completed'::character varying)::text, ('deleted'::character varying)::text, ('rejected'::character varying)::text, ('cancelled'::character varying)::text, ('cancelled by admin'::character varying)::text, ('cancelled by user'::character varying)::text, ('refunded'::character varying)::text]))) not valid;

alter table "public"."bookings" validate constraint "orders_status_check";

alter table "public"."bookings" add constraint "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."bookings" validate constraint "orders_user_id_fkey";

alter table "public"."invoices" add constraint "invoices_invoice_number_key" UNIQUE using index "invoices_invoice_number_key";

alter table "public"."invoices" add constraint "invoices_order_id_fkey" FOREIGN KEY (order_id) REFERENCES bookings(id) not valid;

alter table "public"."invoices" validate constraint "invoices_order_id_fkey";

alter table "public"."invoices" add constraint "invoices_user_id_fkey" FOREIGN KEY (user_id) REFERENCES user_profiles(id) not valid;

alter table "public"."invoices" validate constraint "invoices_user_id_fkey";

alter table "public"."notifications" add constraint "notifications_idempotency_key_key" UNIQUE using index "notifications_idempotency_key_key";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

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

alter table "public"."payments" add constraint "payments_booking_id_fkey" FOREIGN KEY (booking_id) REFERENCES bookings(id) not valid;

alter table "public"."payments" validate constraint "payments_booking_id_fkey";

alter table "public"."payments" add constraint "payments_payment_method_check" CHECK (((payment_method)::text = ANY ((ARRAY['credit_card'::character varying, 'bank_transfer'::character varying, 'cash'::character varying, 'paypal'::character varying])::text[]))) not valid;

alter table "public"."payments" validate constraint "payments_payment_method_check";

alter table "public"."payments" add constraint "payments_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[]))) not valid;

alter table "public"."payments" validate constraint "payments_status_check";

alter table "public"."promotions" add constraint "promotions_code_key" UNIQUE using index "promotions_code_key";

alter table "public"."promotions" add constraint "promotions_discount_type_check" CHECK (((discount_type)::text = ANY ((ARRAY['percentage'::character varying, 'fixed_amount'::character varying])::text[]))) not valid;

alter table "public"."promotions" validate constraint "promotions_discount_type_check";

alter table "public"."promotions" add constraint "promotions_owner_organization_id_fkey" FOREIGN KEY (owner_organization_id) REFERENCES organizations(id) not valid;

alter table "public"."promotions" validate constraint "promotions_owner_organization_id_fkey";

alter table "public"."reviews" add constraint "reviews_item_id_fkey" FOREIGN KEY (item_id) REFERENCES storage_items(id) not valid;

alter table "public"."reviews" validate constraint "reviews_item_id_fkey";

alter table "public"."reviews" add constraint "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5))) not valid;

alter table "public"."reviews" validate constraint "reviews_rating_check";

alter table "public"."reviews" add constraint "reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."reviews" validate constraint "reviews_user_id_fkey";

alter table "public"."roles" add constraint "roles_role_key" UNIQUE using index "roles_role_key";

alter table "public"."saved_list_items" add constraint "saved_list_items_item_id_fkey" FOREIGN KEY (item_id) REFERENCES storage_items(id) not valid;

alter table "public"."saved_list_items" validate constraint "saved_list_items_item_id_fkey";

alter table "public"."saved_list_items" add constraint "saved_list_items_list_id_fkey" FOREIGN KEY (list_id) REFERENCES saved_lists(id) not valid;

alter table "public"."saved_list_items" validate constraint "saved_list_items_list_id_fkey";

alter table "public"."saved_lists" add constraint "saved_lists_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."saved_lists" validate constraint "saved_lists_user_id_fkey";

alter table "public"."storage_analytics" add constraint "storage_analytics_location_id_fkey" FOREIGN KEY (location_id) REFERENCES storage_locations(id) ON DELETE CASCADE not valid;

alter table "public"."storage_analytics" validate constraint "storage_analytics_location_id_fkey";

alter table "public"."storage_images" add constraint "storage_images_image_type_check" CHECK (((image_type)::text = ANY ((ARRAY['main'::character varying, 'thumbnail'::character varying, 'detail'::character varying])::text[]))) not valid;

alter table "public"."storage_images" validate constraint "storage_images_image_type_check";

alter table "public"."storage_images" add constraint "storage_images_location_id_fkey" FOREIGN KEY (location_id) REFERENCES storage_locations(id) not valid;

alter table "public"."storage_images" validate constraint "storage_images_location_id_fkey";

alter table "public"."storage_item_images" add constraint "storage_item_images_image_type_check" CHECK (((image_type)::text = ANY ((ARRAY['main'::character varying, 'thumbnail'::character varying, 'detail'::character varying])::text[]))) not valid;

alter table "public"."storage_item_images" validate constraint "storage_item_images_image_type_check";

alter table "public"."storage_item_images" add constraint "storage_item_images_item_id_fkey" FOREIGN KEY (item_id) REFERENCES storage_items(id) not valid;

alter table "public"."storage_item_images" validate constraint "storage_item_images_item_id_fkey";

alter table "public"."storage_item_tags" add constraint "storage_item_tags_item_id_fkey" FOREIGN KEY (item_id) REFERENCES storage_items(id) not valid;

alter table "public"."storage_item_tags" validate constraint "storage_item_tags_item_id_fkey";

alter table "public"."storage_item_tags" add constraint "storage_item_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tags(id) not valid;

alter table "public"."storage_item_tags" validate constraint "storage_item_tags_tag_id_fkey";

alter table "public"."storage_items" add constraint "storage_items_compartment_id_fkey" FOREIGN KEY (compartment_id) REFERENCES storage_compartments(id) not valid;

alter table "public"."storage_items" validate constraint "storage_items_compartment_id_fkey";

alter table "public"."storage_items" add constraint "storage_items_location_id_fkey" FOREIGN KEY (location_id) REFERENCES storage_locations(id) not valid;

alter table "public"."storage_items" validate constraint "storage_items_location_id_fkey";

alter table "public"."storage_working_hours" add constraint "storage_working_hours_day_check" CHECK (((day)::text = ANY ((ARRAY['monday'::character varying, 'tuesday'::character varying, 'wednesday'::character varying, 'thursday'::character varying, 'friday'::character varying, 'saturday'::character varying, 'sunday'::character varying])::text[]))) not valid;

alter table "public"."storage_working_hours" validate constraint "storage_working_hours_day_check";

alter table "public"."storage_working_hours" add constraint "storage_working_hours_location_id_fkey" FOREIGN KEY (location_id) REFERENCES storage_locations(id) not valid;

alter table "public"."storage_working_hours" validate constraint "storage_working_hours_location_id_fkey";

alter table "public"."user_addresses" add constraint "user_addresses_address_type_check" CHECK (((address_type)::text = ANY ((ARRAY['billing'::character varying, 'shipping'::character varying, 'both'::character varying])::text[]))) not valid;

alter table "public"."user_addresses" validate constraint "user_addresses_address_type_check";

alter table "public"."user_addresses" add constraint "user_addresses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."user_addresses" validate constraint "user_addresses_user_id_fkey";

alter table "public"."user_ban_history" add constraint "user_ban_history_action_check" CHECK (((action)::text = ANY ((ARRAY['banned'::character varying, 'unbanned'::character varying])::text[]))) not valid;

alter table "public"."user_ban_history" validate constraint "user_ban_history_action_check";

alter table "public"."user_ban_history" add constraint "user_ban_history_ban_type_check" CHECK (((ban_type)::text = ANY ((ARRAY['banForRole'::character varying, 'banForOrg'::character varying, 'banForApp'::character varying])::text[]))) not valid;

alter table "public"."user_ban_history" validate constraint "user_ban_history_ban_type_check";

alter table "public"."user_ban_history" add constraint "user_ban_history_banned_by_fkey" FOREIGN KEY (banned_by) REFERENCES user_profiles(id) not valid;

alter table "public"."user_ban_history" validate constraint "user_ban_history_banned_by_fkey";

alter table "public"."user_ban_history" add constraint "user_ban_history_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) not valid;

alter table "public"."user_ban_history" validate constraint "user_ban_history_organization_id_fkey";

alter table "public"."user_ban_history" add constraint "user_ban_history_role_assignment_id_fkey" FOREIGN KEY (role_assignment_id) REFERENCES user_organization_roles(id) not valid;

alter table "public"."user_ban_history" validate constraint "user_ban_history_role_assignment_id_fkey";

alter table "public"."user_ban_history" add constraint "user_ban_history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES user_profiles(id) not valid;

alter table "public"."user_ban_history" validate constraint "user_ban_history_user_id_fkey";

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

alter table "public"."user_profiles" add constraint "user_profiles_email_key" UNIQUE using index "user_profiles_email_key";

alter table "public"."user_profiles" add constraint "user_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_profile_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.audit_trigger_func()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user from our function instead of directly using auth.uid()
  current_user_id := public.get_request_user_id();
  
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, user_id, old_values, new_values
    ) VALUES (
      TG_TABLE_NAME::text, NEW.id, 'update', current_user_id, to_jsonb(OLD.*), to_jsonb(NEW.*)
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, user_id, new_values
    ) VALUES (
      TG_TABLE_NAME::text, NEW.id, 'insert', current_user_id, to_jsonb(NEW.*)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, user_id, old_values
    ) VALUES (
      TG_TABLE_NAME::text, OLD.id, 'delete', current_user_id, to_jsonb(OLD.*)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_average_rating()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Handle DELETE operation differently
  IF TG_OP = 'DELETE' THEN
    UPDATE storage_items
    SET average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE item_id = OLD.item_id
    )
    WHERE id = OLD.item_id;
    RETURN OLD;
  ELSE
    UPDATE storage_items
    SET average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE item_id = NEW.item_id
    )
    WHERE id = NEW.item_id;
    RETURN NEW;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in calculate_average_rating: %', SQLERRM;
    RETURN NULL;
END;
$function$
;

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

CREATE OR REPLACE FUNCTION public.get_all_full_bookings(in_offset integer, in_limit integer)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$declare
  safe_offset integer := greatest(in_offset, 0);
  safe_limit integer := least(greatest(in_limit, 1), 1000);
  total_count integer;
  result jsonb;
begin
  -- Count total bookings
  select count(*) into total_count
  from bookings;

  -- Build JSON result
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
      'total_amount', o.total_amount,
      'discount_amount', o.discount_amount,
      'discount_code', o.discount_code,
      'final_amount', o.final_amount,
      'payment_status', o.payment_status,
      'notes', o.notes,
      'payment_details', o.payment_details,
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
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal,
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
end;$function$
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

CREATE OR REPLACE FUNCTION public.get_full_booking(booking_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$declare
  result jsonb;
begin
  select jsonb_build_object(
    'bookings', jsonb_build_object(
      'id', o.id,
      'booking_number', o.booking_number,
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
      'booking_items', (
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
end;$function$
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

CREATE OR REPLACE FUNCTION public.get_full_user_booking(in_user_id uuid, in_offset integer, in_limit integer)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$declare
  safe_offset integer := greatest(in_offset, 0);
  safe_limit integer := least(greatest(in_limit, 1), 1000);
  result jsonb;
  total_count integer;
begin
  -- Get total count of user's bookings
  select count(*) into total_count
  from bookings
  where user_id = in_user_id;

  -- Get paginated bookings with safe offset & limit
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
      'total_amount', o.total_amount,
      'discount_amount', o.discount_amount,
      'discount_code', o.discount_code,
      'final_amount', o.final_amount,
      'payment_status', o.payment_status,
      'notes', o.notes,
      'payment_details', o.payment_details,
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
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal,
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

CREATE OR REPLACE FUNCTION public.get_latest_ban_record(check_user_id uuid)
 RETURNS TABLE(id uuid, ban_type character varying, action character varying, ban_reason text, is_permanent boolean, banned_by uuid, banned_at timestamp with time zone, unbanned_at timestamp with time zone, organization_id uuid, role_assignment_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ubh.id,
    ubh.ban_type,
    ubh.action,
    ubh.ban_reason,
    ubh.is_permanent,
    ubh.banned_by,
    ubh.banned_at,
    ubh.unbanned_at,
    ubh.organization_id,
    ubh.role_assignment_id
  FROM user_ban_history ubh
  WHERE ubh.user_id = check_user_id
  ORDER BY ubh.created_at DESC
  LIMIT 1;
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

CREATE OR REPLACE FUNCTION public.get_table_columns(input_table_name text)
 RETURNS TABLE(column_name text, data_type text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  return query
  select 
    c.column_name::text, 
    c.data_type::text
  from information_schema.columns c
  where c.table_name = input_table_name
  order by c.ordinal_position;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_roles(user_uuid uuid)
 RETURNS TABLE(id uuid, user_id uuid, organization_id uuid, role_id uuid, is_active boolean, created_at timestamp with time zone, role_name text, organization_name text, organization_slug text)
 LANGUAGE sql
 STABLE
AS $function$
  SELECT 
    uor.id,
    uor.user_id,
    uor.organization_id,
    uor.role_id,
    uor.is_active,
    uor.created_at,
    r.role as role_name,
    o.name as organization_name,
    o.slug as organization_slug
  FROM user_organization_roles uor
  INNER JOIN roles r ON uor.role_id = r.id
  INNER JOIN organizations o ON uor.organization_id = o.id
  WHERE uor.user_id = user_uuid
    AND uor.is_active = true
  ORDER BY uor.created_at DESC;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  -- Removed the problematic "SET LOCAL ROLE postgres;" line
  
  INSERT INTO public.user_profiles (
    id, email, phone, created_at
  )
  VALUES (
    NEW.id, NEW.email, NEW.phone, NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;$function$
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

CREATE OR REPLACE FUNCTION public.is_user_banned_for_app(check_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM user_organization_roles 
    WHERE user_id = check_user_id 
      AND is_active = TRUE
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_user_banned_for_org(check_user_id uuid, check_org_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM user_organization_roles 
    WHERE user_id = check_user_id 
      AND organization_id = check_org_id 
      AND is_active = TRUE
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_user_banned_for_role(check_user_id uuid, check_org_id uuid, check_role_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_organization_roles 
    WHERE user_id = check_user_id 
      AND organization_id = check_org_id 
      AND role_id = check_role_id 
      AND is_active = FALSE
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trg_booking_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.status is distinct from old.status
     and new.status in ('confirmed','rejected') then

    perform public.create_notification( -- create a notification
      new.user_id, -- owner of the booking
      'system'::notification_type,        -- type

      -- Title and message depend on the new status
      (case
         when new.status = 'confirmed' then 'Booking confirmed'
         when new.status = 'rejected'  then 'Booking rejected'
         else format('Booking %s status changed', new.booking_number)
       end),
      (case
         when new.status = 'confirmed'
         then format('Your booking %s has been confirmed.', new.booking_number)
         when new.status = 'rejected'
         then format('Unfortunately, your booking %s was rejected.', new.booking_number)
         else format('Your booking %s is now %s.', new.booking_number, new.status)
       end),
      'in_app'::notification_channel,         -- channel
      (case                                    -- severity
         when new.status = 'confirmed'
         then 'info'::notification_severity
         else 'warning'::notification_severity
       end),
      jsonb_build_object('booking_id', new.id, 'status', new.status)
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
    where uor.is_active = true
      and r.role        = 'admin'
  loop
    perform public.create_notification(
      admin_id,
      'system',
      'A new user joined',
      format('User %s just registered', new.email),
      'in_app',
      'info',
      jsonb_build_object('new_user_id', new.id)
    );
  end loop;

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_booking_amounts()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$DECLARE
  total_sum DECIMAL;
BEGIN
  -- Handle DELETE operation differently
  IF TG_OP = 'DELETE' THEN
    SELECT COALESCE(SUM(subtotal), 0) INTO total_sum
    FROM booking_items
    WHERE booking_id = OLD.booking_id;
    
    UPDATE bookings
    SET 
      total_amount = total_sum,
      final_amount = total_sum - COALESCE(discount_amount, 0)
    WHERE id = OLD.booking_id;
    RETURN OLD;
  ELSE
    SELECT COALESCE(SUM(subtotal), 0) INTO total_sum
    FROM booking_items
    WHERE booking_id = NEW.booking_id;
    
    UPDATE bookings
    SET
      total_amount = total_sum,
      final_amount = total_sum - COALESCE(discount_amount, 0)
    WHERE id = NEW.booking_id;
    RETURN NEW;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in update_booking_amounts: %', SQLERRM;
    RETURN NULL;
END;$function$
;

CREATE OR REPLACE FUNCTION public.update_item_availability()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  RAISE WARNING 'Trigger fired. Operation: %', TG_OP;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    RAISE WARNING 'NEW.status: %, OLD.status: %', NEW.status, OLD.status;

    -- Wenn Bestellung bestätigt wird
    IF NEW.status = 'picked_up' AND (OLD.status IS DISTINCT FROM 'picked_up') THEN
      RAISE WARNING 'Confirmed item. Subtracting quantity % from item_id %', NEW.quantity, NEW.item_id;

      UPDATE storage_items
      SET items_number_available = items_number_available - NEW.quantity
      WHERE id = NEW.item_id AND items_number_available >= NEW.quantity;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Not enough available items for storage item %', NEW.item_id;
      END IF;
    END IF;

    -- Wenn Bestellung auf 'cancelled' wechselt und vorher NICHT 'cancelled' war
    IF NEW.status = 'returned' AND (OLD.status IS DISTINCT FROM 'returned') THEN
      RAISE WARNING 'Cancelled item. Adding quantity % back to item_id %', NEW.quantity, NEW.item_id;

      UPDATE storage_items
      SET items_number_available = items_number_available + NEW.quantity
      WHERE id = NEW.item_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    RAISE WARNING 'Deleted item. Adding quantity % back to item_id %', OLD.quantity, OLD.item_id;

    UPDATE storage_items
    SET items_number_available = items_number_available + OLD.quantity
    WHERE id = OLD.item_id;
  END IF;

  RETURN COALESCE(NEW, OLD);

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Trigger error: %', SQLERRM;
    RETURN NULL;
END;$function$
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

CREATE OR REPLACE FUNCTION public.update_test_metadata()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Update test metadata when storage item is modified
    IF TG_OP = 'UPDATE' THEN
        NEW.test_metadata = NEW.test_metadata || jsonb_build_object(
            'last_modified', now(),
            'test_flag', true,
            'version', COALESCE((OLD.test_metadata->>'version')::int, 0) + 1
        );
    END IF;
    
    RETURN NEW;
END;
$function$
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
    array_agg(t.tag_id) AS tag_ids,
    array_agg(g.translations) AS tag_translations
   FROM (((storage_items s
     JOIN storage_locations l ON ((s.location_id = l.id)))
     LEFT JOIN storage_item_tags t ON ((s.id = t.item_id)))
     LEFT JOIN tags g ON ((t.tag_id = g.id)))
  GROUP BY s.id, s.translations, s.items_number_total, s.price, s.is_active, l.name;


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


create policy "User can select own notifications"
on "public"."notifications"
as permissive
for select
to public
using ((user_id = auth.uid()));


CREATE TRIGGER audit_booking_items_trigger AFTER INSERT OR DELETE OR UPDATE ON public.booking_items FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER update_booking_amounts_trigger AFTER INSERT OR DELETE OR UPDATE ON public.booking_items FOR EACH ROW EXECUTE FUNCTION update_booking_amounts();

CREATE TRIGGER update_item_availability_trigger AFTER INSERT OR DELETE OR UPDATE ON public.booking_items FOR EACH ROW EXECUTE FUNCTION update_item_availability();

CREATE TRIGGER audit_bookings_trigger AFTER INSERT OR DELETE OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER booking_after_update AFTER UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION trg_booking_status_change();

CREATE TRIGGER update_organization_items_updated_at BEFORE UPDATE ON public.organization_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storage_items_totals_trigger AFTER INSERT OR DELETE OR UPDATE ON public.organization_items FOR EACH ROW EXECUTE FUNCTION update_storage_item_totals();

CREATE TRIGGER update_organization_locations_updated_at BEFORE UPDATE ON public.organization_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER generate_organizations_slug_trigger BEFORE INSERT OR UPDATE OF name ON public.organizations FOR EACH ROW EXECUTE FUNCTION generate_organization_slug();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_payments_trigger AFTER INSERT OR DELETE OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER update_average_rating_trigger AFTER INSERT OR DELETE OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION calculate_average_rating();

CREATE TRIGGER audit_storage_items_trigger AFTER INSERT OR DELETE OR UPDATE ON public.storage_items FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER test_metadata_trigger BEFORE UPDATE ON public.storage_items FOR EACH ROW EXECUTE FUNCTION update_test_metadata();

CREATE TRIGGER audit_user_ban_history_trigger AFTER INSERT OR DELETE OR UPDATE ON public.user_ban_history FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER update_user_organization_roles_updated_at BEFORE UPDATE ON public.user_organization_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


create schema if not exists "security";


