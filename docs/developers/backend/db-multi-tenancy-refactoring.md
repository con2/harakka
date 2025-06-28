# DB refactoring

## Current DB

```sql
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.audit_logs (
  table_name character varying NOT NULL,
  record_id uuid NOT NULL,
  action character varying NOT NULL CHECK (action::text = ANY (ARRAY['insert'::character varying, 'update'::character varying, 'delete'::character varying]::text[])),
  user_id uuid,
  old_values jsonb,
  new_values jsonb,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.invoices (
  invoice_number text NOT NULL UNIQUE,
  order_id uuid,
  user_id uuid,
  due_date date,
  reference_number text,
  total_amount numeric,
  pdf_url text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id),
  CONSTRAINT invoices_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.items (
  tenant_id uuid,
  name text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT items_pkey PRIMARY KEY (id),
  CONSTRAINT items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.notifications (
  user_id uuid NOT NULL,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['order_confirmation'::character varying, 'payment_reminder'::character varying, 'status_update'::character varying]::text[])),
  title character varying NOT NULL,
  message text NOT NULL,
  order_id uuid,
  item_id uuid,
  read_at timestamp with time zone,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT notifications_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.storage_items(id)
);
CREATE TABLE public.order_items (
  order_id uuid NOT NULL,
  item_id uuid NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  total_days integer NOT NULL,
  status character varying NOT NULL CHECK (status::text = ANY (ARRAY['pending'::character varying::text, 'confirmed'::character varying::text, 'cancelled'::character varying::text, 'picked_up'::character varying::text, 'returned'::character varying::text])),
  location_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  quantity integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  subtotal numeric,
  unit_price numeric,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.storage_items(id),
  CONSTRAINT order_items_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.storage_locations(id)
);
CREATE TABLE public.orders (
  order_number character varying NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  status character varying NOT NULL CHECK (status::text = ANY (ARRAY['pending'::character varying::text, 'confirmed'::character varying::text, 'paid'::character varying::text, 'completed'::character varying::text, 'deleted'::character varying::text, 'rejected'::character varying::text, 'cancelled'::character varying::text, 'cancelled by admin'::character varying::text, 'cancelled by user'::character varying::text, 'refunded'::character varying::text])),
  discount_code character varying,
  notes text,
  updated_at timestamp with time zone,
  payment_details jsonb,
  total_amount numeric,
  final_amount numeric,
  payment_status character varying CHECK (payment_status::text = ANY (ARRAY['invoice-sent'::character varying::text, 'partial'::character varying::text, 'overdue'::character varying::text, 'payment-rejected'::character varying::text, 'paid'::character varying::text, 'refunded'::character varying::text])),
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  discount_amount numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.payments (
  order_id uuid NOT NULL,
  amount numeric NOT NULL,
  payment_method character varying NOT NULL CHECK (payment_method::text = ANY (ARRAY['credit_card'::character varying, 'bank_transfer'::character varying, 'cash'::character varying, 'paypal'::character varying]::text[])),
  transaction_id character varying,
  status character varying NOT NULL CHECK (status::text = ANY (ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying]::text[])),
  payment_date timestamp with time zone NOT NULL,
  metadata jsonb,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.promotions (
  code character varying NOT NULL UNIQUE,
  description character varying NOT NULL,
  discount_type character varying NOT NULL CHECK (discount_type::text = ANY (ARRAY['percentage'::character varying, 'fixed_amount'::character varying]::text[])),
  discount_value numeric NOT NULL,
  min_order_amount numeric,
  max_discount numeric,
  starts_at timestamp with time zone NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  usage_limit integer,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  times_used integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT promotions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.reviews (
  user_id uuid NOT NULL,
  item_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT reviews_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.storage_items(id)
);
CREATE TABLE public.roles (
  role USER-DEFINED NOT NULL UNIQUE,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.saved_list_items (
  list_id uuid NOT NULL,
  item_id uuid NOT NULL,
  notes text,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  added_at timestamp with time zone DEFAULT now(),
  CONSTRAINT saved_list_items_pkey PRIMARY KEY (id),
  CONSTRAINT saved_list_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.storage_items(id),
  CONSTRAINT saved_list_items_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.saved_lists(id)
);
CREATE TABLE public.saved_lists (
  user_id uuid NOT NULL,
  name character varying NOT NULL,
  description text,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT saved_lists_pkey PRIMARY KEY (id),
  CONSTRAINT saved_lists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.storage_compartments (
  translations jsonb,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT storage_compartments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.storage_images (
  location_id uuid NOT NULL,
  image_url character varying NOT NULL,
  image_type character varying NOT NULL CHECK (image_type::text = ANY (ARRAY['main'::character varying, 'thumbnail'::character varying, 'detail'::character varying]::text[])),
  display_order integer NOT NULL,
  alt_text character varying,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT storage_images_pkey PRIMARY KEY (id),
  CONSTRAINT storage_images_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.storage_locations(id)
);
CREATE TABLE public.storage_item_images (
  item_id uuid NOT NULL,
  image_url character varying NOT NULL,
  image_type character varying NOT NULL CHECK (image_type::text = ANY (ARRAY['main'::character varying, 'thumbnail'::character varying, 'detail'::character varying]::text[])),
  display_order integer NOT NULL,
  alt_text character varying,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  storage_path character varying,
  CONSTRAINT storage_item_images_pkey PRIMARY KEY (id),
  CONSTRAINT storage_item_images_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.storage_items(id)
);
CREATE TABLE public.storage_item_tags (
  item_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  translations jsonb,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT storage_item_tags_pkey PRIMARY KEY (id),
  CONSTRAINT storage_item_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id),
  CONSTRAINT storage_item_tags_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.storage_items(id)
);
CREATE TABLE public.storage_items (
  location_id uuid NOT NULL,
  compartment_id uuid,
  items_number_total numeric NOT NULL,
  items_number_available numeric NOT NULL,
  price numeric NOT NULL,
  translations jsonb,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  average_rating numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  items_number_currently_in_storage numeric,
  is_deleted boolean DEFAULT false,
  CONSTRAINT storage_items_pkey PRIMARY KEY (id),
  CONSTRAINT storage_items_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.storage_locations(id),
  CONSTRAINT storage_items_compartment_id_fkey FOREIGN KEY (compartment_id) REFERENCES public.storage_compartments(id)
);
CREATE TABLE public.storage_locations (
  name character varying NOT NULL,
  description character varying,
  address character varying NOT NULL,
  latitude numeric,
  longitude numeric,
  image_url character varying,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT storage_locations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.storage_working_hours (
  location_id uuid NOT NULL,
  day character varying NOT NULL CHECK (day::text = ANY (ARRAY['monday'::character varying, 'tuesday'::character varying, 'wednesday'::character varying, 'thursday'::character varying, 'friday'::character varying, 'saturday'::character varying, 'sunday'::character varying]::text[])),
  open_time time without time zone NOT NULL,
  close_time time without time zone NOT NULL,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT storage_working_hours_pkey PRIMARY KEY (id),
  CONSTRAINT storage_working_hours_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.storage_locations(id)
);
CREATE TABLE public.tags (
  translations jsonb,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tags_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tenants (
  name text NOT NULL UNIQUE,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT tenants_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_addresses (
  user_id uuid NOT NULL,
  address_type character varying NOT NULL CHECK (address_type::text = ANY (ARRAY['billing'::character varying, 'shipping'::character varying, 'both'::character varying]::text[])),
  street_address character varying NOT NULL,
  city character varying NOT NULL,
  postal_code character varying NOT NULL,
  country character varying NOT NULL,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_addresses_pkey PRIMARY KEY (id),
  CONSTRAINT user_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  full_name character varying,
  visible_name character varying,
  phone character varying,
  email character varying UNIQUE,
  saved_lists jsonb,
  preferences jsonb,
  role character varying NOT NULL DEFAULT 'user'::character varying CHECK (role::text = ANY (ARRAY['user'::character varying, 'admin'::character varying, 'superVera'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_roles (
  profile_id uuid NOT NULL,
  role USER-DEFINED NOT NULL,
  created_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
  CONSTRAINT user_roles_pkey PRIMARY KEY (profile_id),
  CONSTRAINT user_roles_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.user_profiles(id),
  CONSTRAINT user_roles_role_fkey FOREIGN KEY (role) REFERENCES public.roles(role)
);
CREATE TABLE public.user_tenant_roles (
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role USER-DEFINED NOT NULL,
  CONSTRAINT user_tenant_roles_pkey PRIMARY KEY (tenant_id, user_id, role),
  CONSTRAINT user_tenant_roles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
  CONSTRAINT user_tenant_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

## Refactoring

1. Create new organizations table

```sql
-- Create slug generation function (reusable)
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at (reusable)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create organizations table
CREATE TABLE public.ERM_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create slug generation trigger function
CREATE OR REPLACE FUNCTION generate_organization_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate slug from name
  NEW.slug := generate_slug(NEW.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.ERM_organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER generate_organizations_slug_trigger
  BEFORE INSERT OR UPDATE OF name ON public.ERM_organizations
  FOR EACH ROW
  EXECUTE FUNCTION generate_organization_slug();
```

2. Create organization inventory ownership table

```sql

-- Create organization items ownership table
CREATE TABLE public.ERM_organization_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.ERM_organizations(id) NOT NULL,
  storage_item_id UUID REFERENCES public.storage_items(id) NOT NULL,
  owned_quantity INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Unique constraint to prevent duplicate organization-item pairs
  CONSTRAINT unique_org_item UNIQUE(organization_id, storage_item_id),
  -- Check constraint to ensure owned_quantity is non-negative
  CONSTRAINT positive_quantity CHECK (owned_quantity >= 0)
);

-- Add trigger for updated_at
CREATE TRIGGER update_ERM_organization_items_updated_at
  BEFORE UPDATE ON public.ERM_organization_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

```

3. Create user-organization-role relationships

```sql
-- Create user-organization-role relationship table
CREATE TABLE public.ERM_user_organization_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  organization_id UUID REFERENCES public.ERM_organizations(id) NOT NULL,
  role_id UUID REFERENCES public.roles(id) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Unique constraint to prevent duplicate user-organization-role combinations
  CONSTRAINT unique_user_org_role UNIQUE(user_id, organization_id, role_id)
);

-- Add trigger for updated_at
CREATE TRIGGER update_ERM_user_organization_roles_updated_at
  BEFORE UPDATE ON public.ERM_user_organization_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

```

4. Create organization-location relationships

```sql
-- Create organization-location relationship table (many-to-many)
CREATE TABLE public.ERM_organization_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.ERM_organizations(id) NOT NULL,
  storage_location_id UUID REFERENCES public.storage_locations(id) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint to prevent duplicate organization-location pairs
  CONSTRAINT unique_org_location UNIQUE(organization_id, storage_location_id)
);

-- Add trigger for updated_at
CREATE TRIGGER update_ERM_organization_locations_updated_at
  BEFORE UPDATE ON public.ERM_organization_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

5. Update old tables later to reference the new organization structure TODO: apply later

```sql
-- Update order_items to reference the providing organization
ALTER TABLE public.order_items
ADD COLUMN provider_organization_id UUID REFERENCES public.ERM_organizations(id);

-- Update promotions to reference the organization that created them
ALTER TABLE public.promotions
ADD COLUMN owner_organization_id UUID REFERENCES public.ERM_organizations(id);

-- Update audit_logs to include organization context
ALTER TABLE public.audit_logs
ADD COLUMN organization_id UUID REFERENCES public.ERM_organizations(id);

-- Create function to calculate total items from organization ownership
CREATE OR REPLACE FUNCTION calculate_storage_item_total(item_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(owned_quantity)
     FROM public.ERM_organization_items
     WHERE storage_item_id = item_id
     AND is_active = TRUE),
    0
  );
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to update storage_items totals when ERM_organization_items changes
CREATE OR REPLACE FUNCTION update_storage_item_totals()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger on ERM_organization_items to automatically update storage_items totals
CREATE TRIGGER update_storage_items_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.ERM_organization_items
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_item_totals();

-- Create a view to easily see organization ownership breakdown per item
CREATE VIEW ERM_v_item_ownership_summary AS
SELECT
  si.id as storage_item_id,
  si.translations->>'name' as item_name,
  si.items_number_total,
  si.items_number_available,
  COALESCE(org_totals.total_owned, 0) as calculated_total,
  CASE
    WHEN si.items_number_total != COALESCE(org_totals.total_owned, 0)
    THEN 'MISMATCH'
    ELSE 'OK'
  END as total_status
FROM public.storage_items si
LEFT JOIN (
  SELECT
    storage_item_id,
    SUM(owned_quantity) as total_owned,
    COUNT(*) as owner_count
  FROM public.ERM_organization_items
  WHERE is_active = TRUE
  GROUP BY storage_item_id
) org_totals ON si.id = org_totals.storage_item_id;

-- One-time update to sync existing storage_items with organization ownership
UPDATE public.storage_items
SET items_number_total = calculate_storage_item_total(id);
```
