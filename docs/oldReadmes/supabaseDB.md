# Supabase Database Documentation

## Introduction

This document covers the Supabase setup and usage for our App. Supabase provides our project with a PostgreSQL database, authentication, storage, and real-time capabilities.

## Setup & Configuration

### Project Setup

1. Access Credentials:

- Dashboard URL: https://supabase.com/dashboard/project/[project-id]
- Project-id: Stored in .env.local as SUPABASE_PROJECT_ID
- RESTful endpoint for querying and managing database: https://[project-id].supabase.co
- Project API Key (public): Stored in .env.local as SUPABASE_PUBLIC_API_KEY
- Project API Key (secret): Stored in .env.local as SUPABASE_SERVICE_ROLE_KEY

2. Local Development:

Refer to the actual Supabase docs to install CLI locally: https://supabase.com/docs/guides/local-development/cli/getting-started

During our development we used:

```sh
# Install Supabase CLI
npm install supabase --save-dev

```

TODO: Add more details on how to use the CLI after creating the actual DB.

## Database Schema

```
storage_locations
├── id (uuid, PK)
├── name (varchar, NOT NULL)
├── description (varchar)
├── address (varchar, NOT NULL)
├── latitude (decimal, nullable)
├── longitude (decimal, nullable)
├── created_at (timestamp with time zone, default NOW())
├── is_active (boolean, default true)
└── image_url (varchar)

storage_working_hours
├── id (uuid, PK)
├── location_id (uuid, FK -> storage_locations.id, NOT NULL)
├── day (varchar, CHECK IN ('monday','tuesday','wednesday','thursday','friday','saturday','sunday'), NOT NULL)
├── open_time (time, NOT NULL)
├── close_time (time, NOT NULL)
├── is_active (boolean, default true)
└── created_at (timestamp with time zone, default NOW())

storage_images
├── id (uuid, PK)
├── location_id (uuid, FK -> storage_locations.id, NOT NULL)
├── image_url (varchar, NOT NULL)
├── image_type (varchar, CHECK IN ('main', 'detail'), NOT NULL)
├── display_order (integer, NOT NULL)
├── alt_text (varchar, nullable)
├── is_active (boolean, default true)
└── created_at (timestamp with time zone, default NOW())

storage_compartments
├── id (uuid, PK)
├── created_at (timestamp with time zone, default NOW())
└── translations (jsonb) // Multilingual content for compartment information

storage_items
├── id (uuid, PK)
├── location_id (uuid, FK -> storage_locations.id, NOT NULL)
├── compartment_id (uuid, FK -> storage_compartments.id)
├── items_number_total (numeric, NOT NULL)
├── price (decimal, NOT NULL)
├── average_rating (decimal, default 0)
├── status (varchar, default 'available') // Item availability status
├── is_active (boolean, default true)
├── created_at (timestamp with time zone, default NOW())
└── translations (jsonb) // Multilingual content for item details

storage_item_images
├── id (uuid, PK)
├── item_id (uuid, FK -> storage_items.id, NOT NULL)
├── image_url (varchar, NOT NULL)
├── image_type (varchar, CHECK IN ('main','detail'), NOT NULL)
├── display_order (integer, NOT NULL)
├── alt_text (varchar, nullable)
├── is_active (boolean, default true)
└── created_at (timestamp with time zone, default NOW())

storage_item_tags
├── id (uuid, PK)
├── item_id (uuid, FK -> storage_items.id, NOT NULL)
├── tag_id (uuid, FK -> tags.id, NOT NULL)
└── created_at (timestamp with time zone, default NOW())

tags
├── id (uuid, PK)
├── is_active (boolean, default true)
├── created_at (timestamp with time zone, default NOW())
└── translations (jsonb) // Multilingual content for tag names

user_profiles
├── id (uuid, PK, FK -> auth.users.id)
├── role (varchar, CHECK IN ('user','admin','superVera'), default 'user', NOT NULL)
├── full_name (varchar)
├── visible_name (varchar)
├── phone (varchar)
├── email (varchar)
├── saved_lists (jsonb, nullable)
├── preferences (jsonb, nullable)
└── created_at (timestamp with time zone, default NOW())

user_addresses
├── id (uuid, PK)
├── user_id (uuid, FK -> auth.users.id, NOT NULL)
├── address_type (varchar, CHECK IN ('billing','shipping','both'), NOT NULL)
├── street_address (varchar, NOT NULL)
├── city (varchar, NOT NULL)
├── postal_code (varchar, NOT NULL)
├── country (varchar, NOT NULL)
├── is_default (boolean, default false)
├── created_at (timestamp with time zone, default NOW())
└── updated_at (timestamp with time zone, default NOW())

orders
├── id (uuid, PK)
├── order_number (varchar, unique, NOT NULL)
├── user_id (uuid, FK -> auth.users.id, NOT NULL)
├── status (varchar, CHECK IN ('pending','confirmed','paid','completed','cancelled','refunded'), NOT NULL)
├── total_amount (decimal, NOT NULL)
├── discount_amount (decimal, default 0)
├── discount_code (varchar, nullable)
├── final_amount (decimal, NOT NULL)
├── payment_status (varchar, CHECK IN ('pending','partial','paid','refunded'), NOT NULL)
├── notes (text, nullable)
├── created_at (timestamp with time zone, default NOW())
├── updated_at (timestamp with time zone, nullable)
└── payment_details (jsonb, nullable)

order_items
├── id (uuid, PK)
├── order_id (uuid, FK -> orders.id, NOT NULL)
├── item_id (uuid, FK -> storage_items.id, NOT NULL)
├── quantity (integer, default 1)
├── unit_price (decimal, NOT NULL)
├── start_date (timestamp with time zone, NOT NULL)
├── end_date (timestamp with time zone, NOT NULL)
├── total_days (integer, NOT NULL)
├── subtotal (decimal, NOT NULL)
├── status (varchar, CHECK IN ('pending','confirmed','cancelled'), NOT NULL)
├── location_id (uuid, FK -> storage_locations.id, NOT NULL)
└── created_at (timestamp with time zone, default NOW())

payments
├── id (uuid, PK)
├── order_id (uuid, FK -> orders.id, NOT NULL)
├── amount (decimal, NOT NULL)
├── payment_method (varchar, CHECK IN ('credit_card','bank_transfer','cash','paypal'), NOT NULL)
├── transaction_id (varchar)
├── status (varchar, CHECK IN ('pending','completed','failed','refunded'), NOT NULL)
├── payment_date (timestamp with time zone, NOT NULL)
├── created_at (timestamp with time zone, default NOW())
└── metadata (jsonb, nullable)

reviews
├── id (uuid, PK)
├── user_id (uuid, FK -> auth.users.id, NOT NULL)
├── item_id (uuid, FK -> storage_items.id, NOT NULL)
├── rating (integer, CHECK BETWEEN 1 AND 5, NOT NULL)
├── review_text (text, nullable)
├── is_verified (boolean, default false)
├── created_at (timestamp with time zone, default NOW())
└── updated_at (timestamp with time zone, default NOW())

notifications
├── id (uuid, PK)
├── user_id (uuid, FK -> auth.users.id, NOT NULL)
├── type (varchar, CHECK IN ('order_confirmation','payment_reminder','status_update'), NOT NULL)
├── title (varchar, NOT NULL)
├── message (text, NOT NULL)
├── order_id (uuid, FK -> orders.id, nullable)
├── item_id (uuid, FK -> storage_items.id, nullable)
├── is_read (boolean, default false)
├── created_at (timestamp with time zone, default NOW())
└── read_at (timestamp with time zone, nullable)

promotions
├── id (uuid, PK)
├── code (varchar, unique, NOT NULL)
├── description (varchar, NOT NULL)
├── discount_type (varchar, CHECK IN ('percentage','fixed_amount'), NOT NULL)
├── discount_value (decimal, NOT NULL)
├── min_order_amount (decimal, nullable)
├── max_discount (decimal, nullable)
├── starts_at (timestamp with time zone, NOT NULL)
├── expires_at (timestamp with time zone, NOT NULL)
├── usage_limit (integer, nullable)
├── times_used (integer, default 0)
├── is_active (boolean, default true)
└── created_at (timestamp with time zone, default NOW())

saved_lists
├── id (uuid, PK)
├── user_id (uuid, FK -> auth.users.id, NOT NULL)
├── name (varchar, NOT NULL)
├── description (text, nullable)
├── created_at (timestamp with time zone, default NOW())
└── updated_at (timestamp with time zone, default NOW())

saved_list_items
├── id (uuid, PK)
├── list_id (uuid, FK -> saved_lists.id, NOT NULL)
├── item_id (uuid, FK -> storage_items.id, NOT NULL)
├── added_at (timestamp with time zone, default NOW())
└── notes (text, nullable)

audit_logs
├── id (uuid, PK)
├── table_name (varchar, NOT NULL)
├── record_id (uuid, NOT NULL)
├── action (varchar, CHECK IN ('insert','update','delete'), NOT NULL)
├── user_id (uuid, FK -> auth.users.id, nullable)
├── old_values (jsonb, nullable)
├── new_values (jsonb, nullable)
└── created_at (timestamp with time zone, default NOW())
```

### Example translations field for a storage item

```json
{
  "fi": {
    "item_type": "kypäriä",
    "item_name": "sotilaskypärä",
    "item_description": "sotilaskypärä musta, iso"
  },
  "en": {
    "item_type": "helmets",
    "item_name": "military helmet",
    "item_description": "military helmet black, large"
  }
}
```

This approach allows:

- Storing translations for all languages in a single field
- Adding new languages without schema changes
- Flexible querying using JSON operators
- Client-side language selection

## Security and Automation Features

### 1. Audit System

The database implements a comprehensive audit system that automatically tracks all changes to critical tables:

- orders
- order_items
- payments
- storage_items
- user_profiles

#### Audit Function

```sql
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user if available in session
  current_user_id := auth.uid();

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
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

This function is applied to critical tables via triggers like:

```sql
CREATE TRIGGER audit_orders_trigger
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

**How It Works**

- Every change to audited tables is logged with the user who made the change
- Captures full before/after state for updates
- Stores all data in JSONB format for flexible querying
- Maintains a complete change history for compliance and debugging

### 2. Auto-Generated Fields

The database uses PostgreSQL triggers to automatically calculate and update certain fields.

**Average Rating Calculation**

```sql
CREATE OR REPLACE FUNCTION calculate_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE storage_items
  SET average_rating = (
    SELECT AVG(rating)
    FROM reviews
    WHERE item_id = NEW.item_id
  )
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_average_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION calculate_average_rating();
```

**Order Amount Calculations**

```sql
CREATE OR REPLACE FUNCTION update_order_amounts()
RETURNS TRIGGER AS $$
DECLARE
  total_sum DECIMAL;
BEGIN
  -- Handle DELETE operation differently
  IF TG_OP = 'DELETE' THEN
    SELECT COALESCE(SUM(subtotal), 0) INTO total_sum
    FROM order_items
    WHERE order_id = OLD.order_id;

    UPDATE orders
    SET
      total_amount = total_sum,
      final_amount = total_sum - COALESCE(discount_amount, 0)
    WHERE id = OLD.order_id;
    RETURN OLD;
  ELSE
    SELECT COALESCE(SUM(subtotal), 0) INTO total_sum
    FROM order_items
    WHERE order_id = NEW.order_id;

    UPDATE orders
    SET
      total_amount = total_sum,
      final_amount = total_sum - COALESCE(discount_amount, 0)
    WHERE id = NEW.order_id;
    RETURN NEW;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in update_order_amounts: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

**Inventory management**

```sql
CREATE OR REPLACE FUNCTION update_item_availability()
RETURNS TRIGGER AS $$
BEGIN
/*   -- For new or updated order items
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- When a new order is placed or an existing one is updated
    IF NEW.status = 'confirmed' THEN
      UPDATE storage_items
      SET items_number_available = items_number_available - NEW.quantity
      WHERE id = NEW.item_id AND items_number_available >= NEW.quantity;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Not enough available items for storage item %', NEW.item_id;
      END IF;
    END IF;

  -- For deleted or cancelled order items
  ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status = 'cancelled' AND OLD.status = 'confirmed') THEN
    UPDATE storage_items
    SET items_number_available = items_number_available +
        CASE WHEN TG_OP = 'DELETE' THEN OLD.quantity
             ELSE NEW.quantity END
    WHERE id = CASE WHEN TG_OP = 'DELETE' THEN OLD.item_id ELSE NEW.item_id END;
  END IF; */

  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in update_item_availability: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### 3. Row Level Security (RLS)

Our database implements comprehensive Row Level Security to ensure data protection and proper access controls.

**Overview**
All tables have RLS enabled, with policies controlling:

- What public (unauthenticated) users can see
- What authenticated users can see and modify
- What administrators and superVera can access

**Role-Based Access Control Functions**

```sql
-- Helper function to check if user is superVera
CREATE OR REPLACE FUNCTION is_super_vera()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'superVera'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin (but not superVera)
CREATE OR REPLACE FUNCTION is_admin_only()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated function to check if user has elevated privileges (admin or superVera)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superVera')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Policy Categories**

Public Access Policies:

```sql
-- Example: Public can view active locations
CREATE POLICY "Public read access for storage locations"
ON storage_locations FOR SELECT
USING (is_active = TRUE);
```

User-Specific Policies:

```sql
-- Example: Users can view their own orders
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (user_id = auth.uid());
```

Admin Policies:

```sql
-- Example: Admins can view all user profiles but modify only regular users
CREATE POLICY "Admins can view all user profiles"
ON user_profiles FOR SELECT
USING (is_admin_only());

CREATE POLICY "Admins can modify regular user profiles"
ON user_profiles FOR UPDATE
USING (
  is_admin_only() AND
  (SELECT role FROM user_profiles WHERE id = user_profiles.id) = 'user'
);
```

SuperVera Policies:

```sql
-- Example: SuperVera has full access to all user profiles
CREATE POLICY "SuperVera has full access to user_profiles"
ON user_profiles FOR ALL
USING (is_super_vera());
```

System Policies:

```sql
CREATE POLICY "System can insert audit logs"
ON audit_logs FOR INSERT
WITH CHECK (TRUE);
```

### 4. Indexation

Add indexes for frequently queried columns to improve performance.

```sql
CREATE INDEX idx_storage_items_location ON storage_items(location_id);
CREATE INDEX idx_storage_items_status ON storage_items(status);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_reviews_item ON reviews(item_id);
CREATE INDEX idx_storage_items_translations ON storage_items USING GIN (translations);
CREATE INDEX idx_tags_translations ON tags USING GIN (translations);
```

## Injecting test data

### Test users:

Test users are created in Supabase, including roles:

- superVera: Has full access to all data
- admin: Can manage all data except other admins and superVera
- user: Regular user with limited access

### Test data:

Test data injection is done by running the following file: '../backend/dbSetStatements/testData.sql'

## Using Database Features in the Application

### Working with Multilingual Content

```js
// Get item data in Finnish
const { data, error } = await supabase
  .from("storage_items")
  .select("id, price, translations:translations->fi")
  .eq("status", "available");

// Client-side language selection
const displayName =
  item.translations[userLanguage].item_name || item.translations.en.item_name; // Fallback to English
```

### Querying Audit Logs

```js
//Get history of changes to a specific order
const { data, error } = await supabase
  .from("audit_logs")
  .select("*")
  .eq("table_name", "orders")
  .eq("record_id", orderId)
  .order("created_at", { ascending: false });
```

### Working with Row Level Security

```js
// This will only return the user's own orders due to RLS
const { data, error } = await supabase.from("orders").select("*");

// Admin users will see all orders due to RLS
const { data, error } = await supabase.from("orders").select("*");
```
