-- Create user profiles (admin and regular users)
INSERT INTO user_profiles (id, role, full_name, visible_name, phone, preferences)
VALUES
  ('b4a23027-1e6e-4b65-bc76-f4253fb8c39c', 'admin', 'Admin User', 'Admin', '+1234567890', '{"theme": "dark", "notifications": true}'),
  ('2d4e76c9-5ee0-4923-9195-07dc01e48c7d', 'user', 'John Doe', 'John', '+1987654321', '{"theme": "light", "notifications": true}'),
  ('a11b4266-f31b-48f5-8f38-0c19480b7d3f', 'user', 'Jane Smith', 'Jane', '+1122334455', '{"theme": "light", "notifications": false}');

-- Create user addresses
INSERT INTO user_addresses (id, user_id, address_type, street_address, city, state, postal_code, country, is_default)
VALUES
  (uuid_generate_v4(), '2d4e76c9-5ee0-4923-9195-07dc01e48c7d', 'billing', '123 Main St', 'New York', 'NY', '10001', 'USA', true),
  (uuid_generate_v4(), '2d4e76c9-5ee0-4923-9195-07dc01e48c7d', 'shipping', '456 Park Ave', 'New York', 'NY', '10002', 'USA', true),
  (uuid_generate_v4(), 'a11b4266-f31b-48f5-8f38-0c19480b7d3f', 'both', '789 Broadway', 'Boston', 'MA', '02115', 'USA', true);

-- Create storage locations
INSERT INTO storage_locations (id, name, description, address, latitude, longitude, is_active, image_url)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Downtown Storage', 'Premium storage facility in downtown', '100 Main Street, Boston, MA 02108', 42.3601, -71.0589, true, 'https://example.com/images/downtown.jpg'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Suburban Storage', 'Affordable storage outside the city', '200 Elm Road, Cambridge, MA 02139', 42.3736, -71.1097, true, 'https://example.com/images/suburban.jpg'),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Waterfront Facility', 'Secure storage with waterfront access', '300 Harbor Drive, Boston, MA 02210', 42.3519, -71.0464, true, 'https://example.com/images/waterfront.jpg');

-- Create working hours for each location
INSERT INTO storage_working_hours (location_id, day, open_time, close_time)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'monday', '08:00', '20:00'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'tuesday', '08:00', '20:00'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'wednesday', '08:00', '20:00'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'thursday', '08:00', '20:00'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'friday', '08:00', '22:00'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'saturday', '09:00', '18:00'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'sunday', '10:00', '16:00'),
  
  ('550e8400-e29b-41d4-a716-446655440000', 'monday', '07:00', '19:00'),
  ('550e8400-e29b-41d4-a716-446655440000', 'tuesday', '07:00', '19:00'),
  ('550e8400-e29b-41d4-a716-446655440000', 'wednesday', '07:00', '19:00'),
  ('550e8400-e29b-41d4-a716-446655440000', 'thursday', '07:00', '19:00'),
  ('550e8400-e29b-41d4-a716-446655440000', 'friday', '07:00', '19:00'),
  ('550e8400-e29b-41d4-a716-446655440000', 'saturday', '08:00', '17:00'),
  
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'monday', '09:00', '18:00'),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'tuesday', '09:00', '18:00'),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'wednesday', '09:00', '18:00'),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'thursday', '09:00', '18:00'),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'friday', '09:00', '20:00'),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'saturday', '10:00', '16:00');

-- Create location images
INSERT INTO storage_images (location_id, image_url, image_type, display_order, alt_text)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'https://example.com/images/downtown_main.jpg', 'main', 1, 'Downtown Storage Facility Main View'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'https://example.com/images/downtown_thumbnail.jpg', 'thumbnail', 2, 'Downtown Storage Thumbnail'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'https://example.com/images/downtown_detail1.jpg', 'detail', 3, 'Downtown Storage Interior'),
  
  ('550e8400-e29b-41d4-a716-446655440000', 'https://example.com/images/suburban_main.jpg', 'main', 1, 'Suburban Storage Main View'),
  ('550e8400-e29b-41d4-a716-446655440000', 'https://example.com/images/suburban_thumbnail.jpg', 'thumbnail', 2, 'Suburban Storage Thumbnail'),
  
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'https://example.com/images/waterfront_main.jpg', 'main', 1, 'Waterfront Storage Main View'),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'https://example.com/images/waterfront_thumbnail.jpg', 'thumbnail', 2, 'Waterfront Storage Thumbnail');

-- Create tags
INSERT INTO tags (id, name, description)
VALUES
  ('b5f8d480-6ad6-4f93-a8cf-3f32cb7f90d7', 'Climate Controlled', 'Temperature and humidity controlled storage'),
  ('c7d7a238-6770-4285-8a7f-78c7ba49960f', 'Drive-Up Access', 'Easily accessible for vehicles'),
  ('a12816f5-1842-41b0-a272-d0e79ec7f342', '24/7 Access', 'Available round the clock'),
  ('f93fe27e-6457-4bf6-97ce-d20ed489a2e5', 'Security Camera', 'Monitored by security cameras'),
  ('e65a3442-eb66-44d0-a107-b9979774b301', 'Small', 'Small-sized storage unit'),
  ('d41c056b-e97a-4a36-bc25-8a250be22e98', 'Medium', 'Medium-sized storage unit'),
  ('f1c2c9b6-8ecd-42e1-9c6d-7e0a0e60b55f', 'Large', 'Large-sized storage unit');

-- Create storage items
INSERT INTO storage_items (id, location_id, items_number, features, status, price_base, price_modifier)
VALUES
  ('e609e371-1d7a-4b8d-a2a8-b4a9f391e994', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 101, '{"size": "5x5", "climate_controlled": true, "floor": "1"}', 'available', 50.00, 1),
  ('a4b7c7d7-35c9-4f75-b8c3-5f9a4c35c4d0', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 102, '{"size": "10x10", "climate_controlled": true, "floor": "1"}', 'available', 100.00, 1),
  ('b2c522e1-e7c8-48a3-b5b6-2e5be1d97b03', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 103, '{"size": "10x15", "climate_controlled": true, "floor": "1"}', 'booked', 150.00, 1),
  
  ('c1d4f7a8-e4c5-4b2a-a0c1-d6e3f8a7b9c0', '550e8400-e29b-41d4-a716-446655440000', 201, '{"size": "5x10", "climate_controlled": false, "floor": "1"}', 'available', 75.00, 0.9),
  
  ('a9b8c7d6-e5f4-4a3b-b2c1-d0e9f8a7b6c5', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 302, '{"size": "10x10", "climate_controlled": true, "floor": "2"}', 'available', 110.00, 1.1),
  ('c4d5e6f7-a8b9-4c0d-e1f2-a3b4c5d6e7f8', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 303, '{"size": "15x20", "climate_controlled": true, "floor": "1"}', 'unavailable', 200.00, 1.2);

-- Connect items with tags
INSERT INTO storage_item_tags (item_id, tag_id)
VALUES
  ('e609e371-1d7a-4b8d-a2a8-b4a9f391e994', 'b5f8d480-6ad6-4f93-a8cf-3f32cb7f90d7'), -- Climate Controlled
  ('e609e371-1d7a-4b8d-a2a8-b4a9f391e994', 'e65a3442-eb66-44d0-a107-b9979774b301'), -- Small
  
  ('a4b7c7d7-35c9-4f75-b8c3-5f9a4c35c4d0', 'b5f8d480-6ad6-4f93-a8cf-3f32cb7f90d7'), -- Climate Controlled
  ('a4b7c7d7-35c9-4f75-b8c3-5f9a4c35c4d0', 'd41c056b-e97a-4a36-bc25-8a250be22e98'), -- Medium
  
  ('b2c522e1-e7c8-48a3-b5b6-2e5be1d97b03', 'b5f8d480-6ad6-4f93-a8cf-3f32cb7f90d7'), -- Climate Controlled
  ('b2c522e1-e7c8-48a3-b5b6-2e5be1d97b03', 'f1c2c9b6-8ecd-42e1-9c6d-7e0a0e60b55f'), -- Large
  
  ('c1d4f7a8-e4c5-4b2a-a0c1-d6e3f8a7b9c0', 'c7d7a238-6770-4285-8a7f-78c7ba49960f'), -- Drive-Up Access
  ('c1d4f7a8-e4c5-4b2a-a0c1-d6e3f8a7b9c0', 'd41c056b-e97a-4a36-bc25-8a250be22e98'), -- Medium
  
  
  ('a9b8c7d6-e5f4-4a3b-b2c1-d0e9f8a7b6c5', 'b5f8d480-6ad6-4f93-a8cf-3f32cb7f90d7'), -- Climate Controlled
  ('a9b8c7d6-e5f4-4a3b-b2c1-d0e9f8a7b6c5', 'd41c056b-e97a-4a36-bc25-8a250be22e98'), -- Medium
  ('a9b8c7d6-e5f4-4a3b-b2c1-d0e9f8a7b6c5', 'a12816f5-1842-41b0-a272-d0e79ec7f342'), -- 24/7 Access
  
  ('c4d5e6f7-a8b9-4c0d-e1f2-a3b4c5d6e7f8', 'b5f8d480-6ad6-4f93-a8cf-3f32cb7f90d7'), -- Climate Controlled
  ('c4d5e6f7-a8b9-4c0d-e1f2-a3b4c5d6e7f8', 'f1c2c9b6-8ecd-42e1-9c6d-7e0a0e60b55f'), -- Large
  ('c4d5e6f7-a8b9-4c0d-e1f2-a3b4c5d6e7f8', 'c7d7a238-6770-4285-8a7f-78c7ba49960f'); -- Drive-Up Access

-- Create item images
INSERT INTO storage_item_images (item_id, image_url, image_type, display_order, alt_text)
VALUES
  ('e609e371-1d7a-4b8d-a2a8-b4a9f391e994', 'https://example.com/images/item101_main.jpg', 'main', 1, 'Small storage unit main photo'),
  ('e609e371-1d7a-4b8d-a2a8-b4a9f391e994', 'https://example.com/images/item101_thumb.jpg', 'thumbnail', 2, 'Small storage unit thumbnail'),
  
  ('a4b7c7d7-35c9-4f75-b8c3-5f9a4c35c4d0', 'https://example.com/images/item102_main.jpg', 'main', 1, 'Medium storage unit main photo'),
  ('a4b7c7d7-35c9-4f75-b8c3-5f9a4c35c4d0', 'https://example.com/images/item102_thumb.jpg', 'thumbnail', 2, 'Medium storage unit thumbnail'),
  
  ('c4d5e6f7-a8b9-4c0d-e1f2-a3b4c5d6e7f8', 'https://example.com/images/item303_main.jpg', 'main', 1, 'Large storage unit main photo'),
  ('c4d5e6f7-a8b9-4c0d-e1f2-a3b4c5d6e7f8', 'https://example.com/images/item303_thumb.jpg', 'thumbnail', 2, 'Large storage unit thumbnail');

-- Create orders
INSERT INTO orders (id, order_number, user_id, status, total_amount, discount_amount, final_amount, payment_status)
VALUES
  ('98f6b6d1-c6c2-4308-8c45-39494c52a5a7', 'ORD-2025-001', '2d4e76c9-5ee0-4923-9195-07dc01e48c7d', 'completed', 150.00, 0.00, 150.00, 'paid'),
  ('f47b9dbc-c9fd-46a8-a4ea-6b4a39008d2a', 'ORD-2025-002', '2d4e76c9-5ee0-4923-9195-07dc01e48c7d', 'confirmed', 300.00, 30.00, 270.00, 'partial'),
  ('db4c5e85-48f9-4f45-b016-38e4f6346bd4', 'ORD-2025-003', 'a11b4266-f31b-48f5-8f38-0c19480b7d3f', 'pending', 110.00, 0.00, 110.00, 'pending');

-- Create order items
INSERT INTO order_items (order_id, item_id, quantity, unit_price, start_date, end_date, total_days, subtotal, status, location_id)
VALUES
  ('98f6b6d1-c6c2-4308-8c45-39494c52a5a7', 'e609e371-1d7a-4b8d-a2a8-b4a9f391e994', 1, 50.00, '2025-01-01', '2025-01-31', 30, 150.00, 'confirmed', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
  
  ('f47b9dbc-c9fd-46a8-a4ea-6b4a39008d2a', 'a4b7c7d7-35c9-4f75-b8c3-5f9a4c35c4d0', 1, 100.00, '2025-02-01', '2025-02-28', 28, 280.00, 'confirmed', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
  ('f47b9dbc-c9fd-46a8-a4ea-6b4a39008d2a', 'c1d4f7a8-e4c5-4b2a-a0c1-d6e3f8a7b9c0', 1, 75.00, '2025-02-10', '2025-02-15', 5, 20.00, 'confirmed', '550e8400-e29b-41d4-a716-446655440000'),
  
  ('db4c5e85-48f9-4f45-b016-38e4f6346bd4', 'a9b8c7d6-e5f4-4a3b-b2c1-d0e9f8a7b6c5', 1, 110.00, '2025-03-01', '2025-03-31', 31, 110.00, 'pending', '6ba7b810-9dad-11d1-80b4-00c04fd430c8');

-- Create payments
INSERT INTO payments (order_id, amount, payment_method, transaction_id, status, payment_date)
VALUES
  ('98f6b6d1-c6c2-4308-8c45-39494c52a5a7', 150.00, 'credit_card', 'TXN123456789', 'completed', '2025-01-01'),
  
  ('f47b9dbc-c9fd-46a8-a4ea-6b4a39008d2a', 100.00, 'bank_transfer', 'TXN987654321', 'completed', '2025-02-01'),
  ('f47b9dbc-c9fd-46a8-a4ea-6b4a39008d2a', 50.00, 'credit_card', 'TXN567891234', 'completed', '2025-02-05');

-- Create reviews
INSERT INTO reviews (user_id, item_id, rating, review_text, is_verified)
VALUES
  ('2d4e76c9-5ee0-4923-9195-07dc01e48c7d', 'e609e371-1d7a-4b8d-a2a8-b4a9f391e994', 5, 'Excellent storage unit, very clean and secure!', true),
  ('2d4e76c9-5ee0-4923-9195-07dc01e48c7d', 'a4b7c7d7-35c9-4f75-b8c3-5f9a4c35c4d0', 4, 'Great storage, but a bit difficult to access during peak hours.', true);

-- Create promotions
INSERT INTO promotions (code, description, discount_type, discount_value, min_order_amount, max_discount, starts_at, expires_at, usage_limit, times_used, is_active)
VALUES
  ('WELCOME10', 'Get 10% off your first booking', 'percentage', 10.00, 50.00, 100.00, '2025-01-01', '2025-12-31', 100, 12, true),
  ('SUMMER25', 'Summer special: 25% off all bookings', 'percentage', 25.00, 75.00, 200.00, '2025-05-01', '2025-08-31', 50, 0, true),
  ('FLAT20', 'Flat $20 off on bookings above $100', 'fixed_amount', 20.00, 100.00, 20.00, '2025-03-01', '2025-04-30', 30, 5, true);

-- Create notifications
INSERT INTO notifications (user_id, type, title, message, order_id, is_read)
VALUES
  ('2d4e76c9-5ee0-4923-9195-07dc01e48c7d', 'order_confirmation', 'Order Confirmed', 'Your order ORD-2025-001 has been confirmed.', '98f6b6d1-c6c2-4308-8c45-39494c52a5a7', true),
  ('2d4e76c9-5ee0-4923-9195-07dc01e48c7d', 'payment_reminder', 'Payment Due', 'You have a pending payment for order ORD-2025-002.', 'f47b9dbc-c9fd-46a8-a4ea-6b4a39008d2a', false),
  ('a11b4266-f31b-48f5-8f38-0c19480b7d3f', 'status_update', 'Order Status Update', 'Your order ORD-2025-003 is pending confirmation.', 'db4c5e85-48f9-4f45-b016-38e4f6346bd4', false);

-- Create saved lists - Using uuid_generate_v4() for the problematic UUID
INSERT INTO saved_lists (id, user_id, name, description)
VALUES
  ('a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', '2d4e76c9-5ee0-4923-9195-07dc01e48c7d', 'Favorite Units', 'My preferred storage units'),
  (uuid_generate_v4(), 'a11b4266-f31b-48f5-8f38-0c19480b7d3f', 'Wish List', 'Units I want to book in the future');

-- Create saved list items - Fixed the incomplete entry
INSERT INTO saved_list_items (list_id, item_id)
VALUES
  ('a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', 'e609e371-1d7a-4b8d-a2a8-b4a9f391e994'),
  ('a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', 'a4b7c7d7-35c9-4f75-b8c3-5f9a4c35c4d0');

-- This will add another item to the Wish List after it's created
INSERT INTO saved_list_items (list_id, item_id)
SELECT 
  id, 
  'a9b8c7d6-e5f4-4a3b-b2c1-d0e9f8a7b6c5' -- This is a valid storage item ID
FROM saved_lists 
WHERE user_id = 'a11b4266-f31b-48f5-8f38-0c19480b7d3f' AND name = 'Wish List';