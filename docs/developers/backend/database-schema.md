# Database Schema

This document provides a comprehensive overview of the database schema used in the Storage and Booking Application.

## Table of Contents

- [Overview](#overview)
- [Core Tables](#core-tables)
- [User Management](#user-management)
- [Order Management](#order-management)
- [Content Management](#content-management)
- [Relationships](#relationships)
- [Security Model](#security-model)
- [Automation Features](#automation-features)
- [Indexing Strategy](#indexing-strategy)
- [Multilingual Support](#multilingual-support)

## Overview

The application uses PostgreSQL through Supabase with the following key features:

- **Row-Level Security (RLS)**: Fine-grained access control at the database level
- **JSONB Fields**: For multilingual content and flexible data storage
- **Database Triggers**: For automated data consistency and business rules
- **Custom Functions**: For security checks and data manipulation

## Core Tables

### Storage Locations

Represents physical locations where storage items are stored.

```sql
CREATE TABLE storage_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description VARCHAR,
  address VARCHAR NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  image_url VARCHAR
);
```

### Storage Items

Represents individual items available for booking.

```sql
CREATE TABLE storage_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES storage_locations(id) NOT NULL,
  compartment_id UUID REFERENCES storage_compartments(id),
  items_number_total NUMERIC NOT NULL,
  price DECIMAL NOT NULL,
  average_rating DECIMAL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  translations JSONB,
  items_number_currently_in_storage NUMERIC,
  is_deleted BOOLEAN DEFAULT FALSE
);
```

<!-- ### Storage Compartments TODO: to be added later

Represents categories or types of storage items.

```sql
CREATE TABLE storage_compartments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  translations JSONB
);
``` -->

### Tags

Tags for categorizing storage items.

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  translations JSONB
);
```

## User Management

### User Profiles

Extended user information linked to Supabase Auth.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role VARCHAR NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superVera')),
  full_name VARCHAR,
  visible_name VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  saved_lists JSONB,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Addresses

Shipping and billing addresses for users.

```sql
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  address_type VARCHAR NOT NULL CHECK (address_type IN ('billing', 'shipping', 'both')),
  street_address VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  postal_code VARCHAR NOT NULL,
  country VARCHAR NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Order Management

### Orders

Main bookings table.

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('pending', 'confirmed', 'paid', 'completed', 'deleted', 'rejected', 'cancelled', 'cancelled by admin', 'cancelled by user', 'refunded')),
  total_amount DECIMAL,
  discount_amount DECIMAL DEFAULT 0,
  discount_code VARCHAR,
  final_amount DECIMAL,
  payment_status VARCHAR CHECK (payment_status IN ('invoice-sent', 'partial', 'overdue', 'payment-rejected', 'paid', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  payment_details JSONB
);
```

### Order Items

Individual items within a booking.

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) NOT NULL,
  item_id UUID REFERENCES storage_items(id) NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_days INTEGER NOT NULL,
  subtotal DECIMAL,
  status VARCHAR NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'picked_up', 'returned')),
  location_id UUID REFERENCES storage_locations(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

<!-- ### Payments TODO: pass for now

Payment records for orders.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) NOT NULL,
  amount DECIMAL NOT NULL,
  payment_method VARCHAR NOT NULL CHECK (payment_method IN ('credit_card', 'bank_transfer', 'cash', 'paypal')),
  transaction_id VARCHAR,
  status VARCHAR NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);
```-->

## Content Management

### Storage Item Images

Images for individual storage items.

```sql
CREATE TABLE storage_item_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES storage_items(id) NOT NULL,
  image_url VARCHAR NOT NULL,
  image_type VARCHAR NOT NULL CHECK (image_type IN ('main', 'detail')),
  display_order INTEGER NOT NULL,
  alt_text VARCHAR,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  storage_path VARCHAR
);
```

### Other Supporting Tables

- **storage_item_tags**: Links items to tags
- **reviews**: User reviews for storage items
- **notifications**: System notifications for users
- **promotions**: Discount promotions
- **saved_lists**: User-created lists of favorite items
- **saved_list_items**: Items in saved lists
- **audit_logs**: System audit trail

## Relationships

The database uses a relational design with the following key relationships:

1. **User-Centric**:

   - One user can have multiple addresses, orders, and saved lists
   - Users submit reviews for items they've booked

2. **Location-Centric**:

   - Each location has working hours, images, and contains items
   - Items are associated with a specific location

3. **Order-Centric**:

   - Orders belong to a user
   - Orders contain multiple order items
   - Order items reference specific storage items
   - Payments are associated with orders

4. **Content Management**:
   - Items can have multiple images and tags
   - Items belong to compartments (categories)

## Security Model

The database implements Row-Level Security (RLS) with three primary user roles:

### Roles

- **user**: Regular customers who book items
- **admin**: Staff members who manage inventory and bookings
- **superVera**: System administrators with full access

### Access Functions

```sql
-- Check if the current user is superVera
CREATE OR REPLACE FUNCTION is_super_vera()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'superVera'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if the current user is admin (but not superVera)
CREATE OR REPLACE FUNCTION is_admin_only()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has elevated privileges (admin or superVera)
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

### Policy Categories

The database implements different categories of policies:

1. **Public Data Policies**: Allow anonymous users to view certain data (e.g., active storage locations)
2. **User-Specific Policies**: Restrict users to accessing only their own data (e.g., orders, addresses)
3. **Admin Policies**: Allow admins to manage all data except other admin users
4. **SuperVera Policies**: Provide complete access to all data, including admin users

## Automation Features

The database uses triggers and functions to automate common tasks:

### Audit System

A comprehensive audit system tracks changes to critical tables:

```sql
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user from our custom function
  current_user_id := public.get_request_user_id();

  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, user_id, old_values, new_values
    ) VALUES (
      TG_TABLE_NAME::text, NEW.id, 'update', current_user_id,
      to_jsonb(OLD.*), to_jsonb(NEW.*)
    );
    RETURN NEW;
  -- Similar logic for INSERT and DELETE
  -- ...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Automatic Calculations

Triggers automatically update dependent fields:

1. **Average Rating Calculation**: Updates item ratings based on reviews
2. **Order Amount Calculations**: Totals order amounts when items change
3. **Inventory Management**: Updates available quantities when items are booked or returned

```sql
-- Example function for inventory management
CREATE OR REPLACE FUNCTION update_item_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- For status changes to picked_up
 /*  IF NEW.status = 'picked_up' AND (OLD.status IS DISTINCT FROM 'picked_up') THEN
    UPDATE storage_items
    SET items_number_available = items_number_available - NEW.quantity
    WHERE id = NEW.item_id AND items_number_available >= NEW.quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Not enough available items for storage item %', NEW.item_id;
    END IF;
  END IF;

  -- For status changes to returned
  IF NEW.status = 'returned' AND (OLD.status IS DISTINCT FROM 'returned') THEN
    UPDATE storage_items
    SET items_number_available = items_number_available + NEW.quantity
    WHERE id = NEW.item_id;
  END IF; */

  -- Additional logic for DELETE operations
  -- ...

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

## Indexing Strategy

The database includes strategic indexes to optimize common queries:

```sql
-- Primary key indexes (automatically created)
-- Foreign key relationship indexes
CREATE INDEX idx_storage_items_location ON storage_items(location_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);

-- Search optimization indexes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_reviews_item ON reviews(item_id);

-- JSONB field indexes for efficient querying
CREATE INDEX idx_storage_items_translations ON storage_items USING gin (translations);
CREATE INDEX idx_tags_translations ON tags USING gin (translations);
```

## Multilingual Support

The application supports multiple languages through JSONB fields:

### Translation Field Structure

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

### Tables with Translation Support

- **storage_items**: Item names, descriptions, and details
- **storage_compartments**: Compartment names and descriptions
- **tags**: Tag names and descriptions

### Querying Translated Content

Example of querying in a specific language:

```sql
-- Get item data in Finnish
SELECT
  id,
  price,
  translations->'fi' AS finnish_content
FROM
  storage_items
WHERE
  is_active = TRUE;
```

This approach allows:

- Storing translations for all languages in a single field
- Adding new languages without schema changes
- Flexible querying using JSON operators
- Client-side language selection
