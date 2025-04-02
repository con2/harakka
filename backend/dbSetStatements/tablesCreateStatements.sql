-- Create locations table
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

-- Create storage compartments table
CREATE TABLE storage_compartments (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 translations JSONB
);

-- Create storage items table
CREATE TABLE storage_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES storage_locations(id) NOT NULL,
  compartment_id UUID REFERENCES storage_compartments(id),
  items_number_total NUMERIC NOT NULL,
  items_number_available NUMERIC NOT NULL,
  price DECIMAL NOT NULL,
  average_rating DECIMAL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  translations JSONB
);

-- Create working hours table
CREATE TABLE storage_working_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES storage_locations(id) NOT NULL,
  day VARCHAR NOT NULL CHECK (day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create location images table
CREATE TABLE storage_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES storage_locations(id) NOT NULL,
  image_url VARCHAR NOT NULL,
  image_type VARCHAR NOT NULL CHECK (image_type IN ('main', 'thumbnail', 'detail')),
  display_order INTEGER NOT NULL,
  alt_text VARCHAR,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create item images table
CREATE TABLE storage_item_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES storage_items(id) NOT NULL,
  image_url VARCHAR NOT NULL,
  image_type VARCHAR NOT NULL CHECK (image_type IN ('main', 'thumbnail', 'detail')),
  display_order INTEGER NOT NULL,
  alt_text VARCHAR,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  translations JSONB
);

-- Create item-tags table
CREATE TABLE storage_item_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES storage_items(id) NOT NULL,
  tag_id UUID REFERENCES tags(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  translations JSONB
);

-- Create user profiles table 
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

-- Create user addresses table
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

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('pending', 'confirmed', 'paid', 'completed', 'cancelled', 'refunded')),
  total_amount DECIMAL NOT NULL,
  discount_amount DECIMAL DEFAULT 0,
  discount_code VARCHAR,
  final_amount DECIMAL NOT NULL,
  payment_status VARCHAR NOT NULL CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  payment_details JSONB
);

-- Create order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) NOT NULL,
  item_id UUID REFERENCES storage_items(id) NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_days INTEGER NOT NULL,
  subtotal DECIMAL NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  location_id UUID REFERENCES storage_locations(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
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

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  item_id UUID REFERENCES storage_items(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type VARCHAR NOT NULL CHECK (type IN ('order_confirmation', 'payment_reminder', 'status_update')),
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  order_id UUID REFERENCES orders(id),
  item_id UUID REFERENCES storage_items(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create promotions table
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR UNIQUE NOT NULL,
  description VARCHAR NOT NULL,
  discount_type VARCHAR NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL NOT NULL,
  min_order_amount DECIMAL,
  max_discount DECIMAL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_limit INTEGER,
  times_used INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved lists table
CREATE TABLE saved_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved list items table
CREATE TABLE saved_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID REFERENCES saved_lists(id) NOT NULL,
  item_id UUID REFERENCES storage_items(id) NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Create audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
  user_id UUID REFERENCES auth.users(id),
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);