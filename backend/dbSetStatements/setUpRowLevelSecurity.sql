-- ==== Enable RLS on all tables ====
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_item_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ==== Helper functions for role-based access ====

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

-- ==== Public Data Policies ====

-- storage_locations - Public can view active locations
CREATE POLICY "Public read access for storage locations"
ON storage_locations FOR SELECT
USING (is_active = TRUE);

-- tags - Public can view tags
CREATE POLICY "Public read access for tags"
ON tags FOR SELECT
USING (TRUE);

-- storage_working_hours - Public can view active hours
CREATE POLICY "Public read access for working hours"
ON storage_working_hours FOR SELECT
USING (is_active = TRUE);

-- storage_images - Public can view active images
CREATE POLICY "Public read access for storage images"
ON storage_images FOR SELECT
USING (is_active = TRUE);

-- storage_item_images - Public can view active item images
CREATE POLICY "Public read access for item images"
ON storage_item_images FOR SELECT
USING (
  is_active = TRUE AND
  EXISTS (
    SELECT 1 FROM storage_items
    WHERE id = storage_item_images.item_id
    AND is_active = TRUE
  )
);

-- promotions - Public can view active promotions
CREATE POLICY "Public read access for active promotions"
ON promotions FOR SELECT
USING (
  is_active = TRUE AND
  starts_at <= NOW() AND
  expires_at > NOW()
);

-- storage_items - Allow anonymous read access
CREATE POLICY "Allow anonymous read access to storage_items"
ON storage_items FOR SELECT
USING (TRUE);

-- user_profiles - Public can create user profiles
CREATE POLICY "Anyone can insert user profiles" ON user_profiles 
FOR INSERT TO authenticated 
WITH CHECK (TRUE);

-- ==== User-specific Data Policies ====

-- user_profiles - Users can view and update their own profiles
CREATE POLICY "Users can view their own profile"
ON user_profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE
USING (id = auth.uid());

-- user_addresses - Users can manage their own addresses
CREATE POLICY "Users can view their own addresses"
ON user_addresses FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own addresses"
ON user_addresses FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own addresses"
ON user_addresses FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own addresses"
ON user_addresses FOR DELETE
USING (user_id = auth.uid());

-- orders - Users can view and create their own orders
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (
  user_id = auth.uid() OR 
  user_id IN (
    SELECT user_profiles.id 
    FROM user_profiles 
    WHERE user_profiles.id = auth.uid()
  )
);

CREATE POLICY "Users can create their own orders"
ON orders FOR INSERT
WITH CHECK ((auth.uid() = user_id) OR (user_id = auth.uid()));

CREATE POLICY "Users can update their pending orders"
ON orders FOR UPDATE
USING (user_id = auth.uid() AND status = 'pending');

-- order_items - Users can manage items in their own orders
CREATE POLICY "Users can view their own order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE id = order_items.order_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert items to their own pending orders"
ON order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE id = order_items.order_id AND user_id = auth.uid() AND status = 'pending'
  )
);

CREATE POLICY "Users can update items in their own pending orders"
ON order_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE id = order_items.order_id AND user_id = auth.uid() AND status = 'pending'
  )
);

CREATE POLICY "Users can delete items from their own pending orders"
ON order_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE id = order_items.order_id AND user_id = auth.uid() AND status = 'pending'
  )
);

-- payments - Users can view their own payments
CREATE POLICY "Users can view their own payments"
ON payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE id = payments.order_id AND user_id = auth.uid()
  )
);

-- reviews - Users can manage their own reviews
CREATE POLICY "Users can view all reviews"
ON reviews FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY "Users can create reviews for items they ordered"
ON reviews FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM order_items JOIN orders ON order_items.order_id = orders.id
    WHERE order_items.item_id = reviews.item_id
    AND orders.user_id = auth.uid()
    AND orders.status IN ('completed', 'paid')
  )
);

CREATE POLICY "Users can update their own reviews"
ON reviews FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reviews"
ON reviews FOR DELETE
USING (user_id = auth.uid());

-- notifications - Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- notifications - Users can update only specific fields on their notifications
CREATE POLICY "Users can mark their own notifications as read"
ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() AND 
  is_read = TRUE AND
  read_at IS NOT NULL
);

-- saved_lists - Users can manage their own lists
CREATE POLICY "Users can view their own saved lists"
ON saved_lists FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own saved lists"
ON saved_lists FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own saved lists"
ON saved_lists FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own saved lists"
ON saved_lists FOR DELETE
USING (user_id = auth.uid());

-- saved_list_items - Users can manage items in their own lists
CREATE POLICY "Users can view items in their own saved lists"
ON saved_list_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM saved_lists
    WHERE id = saved_list_items.list_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can add items to their own saved lists"
ON saved_list_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM saved_lists
    WHERE id = saved_list_items.list_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update items in their own saved lists"
ON saved_list_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM saved_lists
    WHERE id = saved_list_items.list_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove items from their own saved lists"
ON saved_list_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM saved_lists
    WHERE id = saved_list_items.list_id AND user_id = auth.uid()
  )
);

-- ==== superVera Policies ====

-- Create specific superVera policy for user_profiles
CREATE POLICY "SuperVera has full access to user_profiles"
ON user_profiles FOR ALL
USING (is_super_vera());

-- ==== Admin Policies ====

-- Create new admin policies for user_profiles
CREATE POLICY "Admins can view all user profiles"
ON user_profiles FOR SELECT
USING (is_admin_only());

CREATE POLICY "Admins can modify regular user profiles"
ON user_profiles FOR UPDATE
USING (
  is_admin_only() AND 
  role = 'user'
);

CREATE POLICY "Admins can delete regular user profiles"
ON user_profiles FOR DELETE
USING (
  is_admin_only() AND 
  role = 'user'
);

-- Admin can do everything on all tables
CREATE POLICY "Admins have full access to storage_locations"
ON storage_locations FOR ALL
USING (is_admin());

CREATE POLICY "Admins have full access to storage_items"
ON storage_items FOR ALL
USING (is_admin());

CREATE POLICY "Admins have full access to tags"
ON tags FOR ALL
USING (is_admin());

CREATE POLICY "Admins have full access to working_hours"
ON storage_working_hours FOR ALL
USING (is_admin());

CREATE POLICY "Admins have full access to storage_images"
ON storage_images FOR ALL
USING (is_admin());

CREATE POLICY "Admins have full access to item_images"
ON storage_item_images FOR ALL
USING (is_admin());

CREATE POLICY "Admins have full access to item_tags"
ON storage_item_tags FOR ALL
USING (is_admin());

CREATE POLICY "Admins have full access to user_addresses"
ON user_addresses FOR ALL
USING (is_admin());

CREATE POLICY "Admins have full access to orders"
ON orders FOR ALL
USING (is_admin());

CREATE POLICY "Admins have full access to order_items"
ON order_items FOR ALL
USING (is_admin());

CREATE POLICY "Admins have full access to payments"
ON payments FOR ALL
USING (is_admin());

CREATE POLICY "Admins have full access to reviews"
ON reviews FOR ALL
USING (is_admin());

CREATE POLICY "Admins have full access to notifications"
ON notifications FOR ALL
USING (is_admin());

CREATE POLICY "Admins have full access to promotions"
ON promotions FOR ALL
USING (is_admin());

CREATE POLICY "Admins have full access to saved_lists"
ON saved_lists FOR ALL
USING (is_admin());

CREATE POLICY "Admins have full access to saved_list_items"
ON saved_list_items FOR ALL
USING (is_admin());

CREATE POLICY "Admins have full access to audit_logs"
ON audit_logs FOR ALL
USING (is_admin());

-- ==== Special Cases ====

-- Allow the system to insert audit logs
CREATE POLICY "System can insert audit logs"
ON audit_logs FOR INSERT
WITH CHECK (TRUE);

-- Allow the system to insert notifications
CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (TRUE);