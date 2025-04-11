-- Create user profiles (admin and regular users)
INSERT INTO user_profiles (id, role, full_name, visible_name, phone, email, preferences)
VALUES
  ('b4a23027-1e6e-4b65-bc76-f4253fb8c39c', 'superVera', 'Super Vera', 'Vera', '+1234567890', 'some@mail.com', '{"theme": "dark", "notifications": true}'),
  ('2d4e76c9-5ee0-4923-9195-07dc01e48c7d', 'admin', 'John Doe', 'John', '+1987654321', 'some2@mail.com','{"theme": "light", "notifications": true}'),
  ('a11b4266-f31b-48f5-8f38-0c19480b7d3f', 'user', 'Jane Smith', 'Jane', '+1122334455', 'some3@mail.com','{"theme": "light", "notifications": false}');

-- Create user addresses
INSERT INTO user_addresses (id, user_id, address_type, street_address, city, postal_code, country, is_default)
VALUES
  (uuid_generate_v4(), '2d4e76c9-5ee0-4923-9195-07dc01e48c7d', 'billing', '123 Main St', 'Espoo', '10001', 'Finland', true),
  (uuid_generate_v4(), '2d4e76c9-5ee0-4923-9195-07dc01e48c7d', 'shipping', '456 Park Ave', 'Salo', '10002', 'Finland', true),
  (uuid_generate_v4(), 'a11b4266-f31b-48f5-8f38-0c19480b7d3f', 'both', '789 Broadway', 'Tampere', '02115', 'Finland', true);

-- Create storage locations
INSERT INTO storage_locations (id, name, description, address, latitude, longitude, is_active, image_url)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Main Storage', 'Premium storage facility in downtown', '100 Main Street, Salo, 02108', 42.3601, -71.0589, true, 'https://example.com/images/downtown.jpg');

-- Create working hours for each location
INSERT INTO storage_working_hours (location_id, day, open_time, close_time)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'monday', '08:00', '20:00'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'tuesday', '08:00', '20:00'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'wednesday', '08:00', '20:00'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'thursday', '08:00', '20:00'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'friday', '08:00', '22:00'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'saturday', '09:00', '18:00'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'sunday', '10:00', '16:00');

-- Create location images
INSERT INTO storage_images (location_id, image_url, image_type, display_order, alt_text)
VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'https://example.com/images/downtown_main.jpg', 'main', 1, 'Downtown Storage Facility Main View'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'https://example.com/images/downtown_thumbnail.jpg', 'thumbnail', 2, 'Downtown Storage Thumbnail'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'https://example.com/images/downtown_detail1.jpg', 'detail', 3, 'Downtown Storage Interior');

INSERT INTO storage_compartments (id, translations)
VALUES
('e13a9076-1ea1-440a-910b-8808c0ca587a','{"fi":{"compartment_type":"varastolaatikko", "compartment_side":"", "compartment_location":"", "box_type":""},"en":{"compartment_type":"storage box", "compartment_side":"", "compartment_location":"", "box_type":""}}'),
('0ffa5562-82a9-4352-b804-1adebbb7d80c','{"fi":{"compartment_type":"varastolaatikko", "compartment_side":"varastohyllyt", "compartment_location":"sisäänkäynnin puolella", "box_type":""},"en":{"compartment_type":"storage box", "compartment_side":"warehouse shelves", "compartment_location":"on the entrance side", "box_type":""}}'),
('f7e8fa56-1c0a-4f5a-a7b1-d042caf4ff71','{"fi":{"compartment_type":"", "compartment_side":"takavaraston", "compartment_location":"keskellä", "box_type":""},"en":{"compartment_type":"", "compartment_side":"back warehouse", "compartment_location":"in the middle", "box_type":""}}');

-- Create storage items
INSERT INTO storage_items (id, location_id, compartment_id, items_number_total, items_number_available, price, is_active, translations)
VALUES
  ('e609e371-1d7a-4b8d-a2a8-b4a9f391e994', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'e13a9076-1ea1-440a-910b-8808c0ca587a', 6, 3, 50, true, '{"fi": {"item_type": "kypäriä", "item_name":"sotilaskypärä", "item_description":"sotilaskypärä musta, iso"}, "en":{"item_type": "helmets", "item_name":"military helmet", "item_description":"military helmet black, large"}}'),
  ('a4b7c7d7-35c9-4f75-b8c3-5f9a4c35c4d0', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '0ffa5562-82a9-4352-b804-1adebbb7d80c', 6, 2, 60, true,'{"fi": {"item_type": "kypäriä", "item_name":"sotilaskypärä", "item_description":"sotilaskypärä musta, pieni + pehmusteita"}, "en":{"item_type": "helmets", "item_name":"military helmet", "item_description":"military helmet black, small + padding"}}'),
  ('702f1207-82f5-412b-89e3-1a013776dec6', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f7e8fa56-1c0a-4f5a-a7b1-d042caf4ff71', 29, 14, 100, true,'{"fi": {"item_type": "vaahtomuovipatjat", "item_name":"taahtomuovipatja 90x200", "item_description":"vaahtomuovipatjat 90x200"}, "en":{"item_type": "foam mattresses", "item_name":"foam mattress 90x200", "item_description":"foam mattress 90x200"}}');

-- Create tags
INSERT INTO tags (id, translations)
VALUES
  ('b5f8d480-6ad6-4f93-a8cf-3f32cb7f90d7', '{"fi": {"name": "jotain 1"}, "en": {"name": "something 1"}}'), -- Some tag 1
  ('c7d7a238-6770-4285-8a7f-78c7ba49960f', '{"fi": {"name": "jotain 2"}, "en": {"name": "something 2"}}'), -- Some tag 2
  ('d41c056b-e97a-4a36-bc25-8a250be22e98', '{"fi": {"name": "jotain 3"}, "en": {"name": "something 3"}}'); -- Some tag 3

-- Connect items with tags
INSERT INTO storage_item_tags (item_id, tag_id)
VALUES
  ('e609e371-1d7a-4b8d-a2a8-b4a9f391e994', 'b5f8d480-6ad6-4f93-a8cf-3f32cb7f90d7'), -- Some tag 1
  ('e609e371-1d7a-4b8d-a2a8-b4a9f391e994', 'c7d7a238-6770-4285-8a7f-78c7ba49960f'), -- Some tag 2
  
  ('a4b7c7d7-35c9-4f75-b8c3-5f9a4c35c4d0', 'c7d7a238-6770-4285-8a7f-78c7ba49960f'), -- Some tag 2
  
  ('702f1207-82f5-412b-89e3-1a013776dec6', 'b5f8d480-6ad6-4f93-a8cf-3f32cb7f90d7'), -- Some tag 1
  ('702f1207-82f5-412b-89e3-1a013776dec6', 'd41c056b-e97a-4a36-bc25-8a250be22e98'); --  Some tag 3

-- Create item images
INSERT INTO storage_item_images (item_id, image_url, image_type, display_order, alt_text)
VALUES
  ('e609e371-1d7a-4b8d-a2a8-b4a9f391e994', 'https://example.com/images/item101_main.jpg', 'main', 1, 'Military helmet main photo'),
  ('e609e371-1d7a-4b8d-a2a8-b4a9f391e994', 'https://example.com/images/item101_thumb.jpg', 'thumbnail', 2, 'Military helmet thumbnail'),
  
  ('a4b7c7d7-35c9-4f75-b8c3-5f9a4c35c4d0', 'https://example.com/images/item102_main.jpg', 'main', 1, 'Military helmet main photo'),
  ('a4b7c7d7-35c9-4f75-b8c3-5f9a4c35c4d0', 'https://example.com/images/item102_thumb.jpg', 'thumbnail', 2, 'Military helmet thumbnail'),
  
  ('702f1207-82f5-412b-89e3-1a013776dec6', 'https://example.com/images/item303_main.jpg', 'main', 1, 'Foam mattresses 90x200 main photo'),
  ('702f1207-82f5-412b-89e3-1a013776dec6', 'https://example.com/images/item303_thumb.jpg', 'thumbnail', 2, 'Foam mattresses 90x200 thumbnail');

-- Create orders
INSERT INTO orders (id, order_number, user_id, status, total_amount, discount_amount, final_amount, payment_status)
VALUES
  ('98f6b6d1-c6c2-4308-8c45-39494c52a5a7', 'ORD-2025-001', '2d4e76c9-5ee0-4923-9195-07dc01e48c7d', 'completed', 150.00, 0.00, 150.00, 'paid'),
  ('f47b9dbc-c9fd-46a8-a4ea-6b4a39008d2a', 'ORD-2025-002', '2d4e76c9-5ee0-4923-9195-07dc01e48c7d', 'confirmed', 2480.00, 0.00, 2480.00, 'partial'),
  ('db4c5e85-48f9-4f45-b016-38e4f6346bd4', 'ORD-2025-003', 'a11b4266-f31b-48f5-8f38-0c19480b7d3f', 'pending', 500.00, 0.00, 500.00, 'pending');

-- Create order items
INSERT INTO order_items (order_id, item_id, quantity, unit_price, start_date, end_date, total_days, subtotal, status, location_id)
VALUES
  ('98f6b6d1-c6c2-4308-8c45-39494c52a5a7', 'e609e371-1d7a-4b8d-a2a8-b4a9f391e994', 3, 50.00, '2025-05-01', '2025-05-02', 1, 150.00, 'confirmed', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),

  ('f47b9dbc-c9fd-46a8-a4ea-6b4a39008d2a', 'a4b7c7d7-35c9-4f75-b8c3-5f9a4c35c4d0', 4, 60.00, '2025-05-02', '2025-05-04', 2, 480.00, 'confirmed', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
  ('f47b9dbc-c9fd-46a8-a4ea-6b4a39008d2a', '702f1207-82f5-412b-89e3-1a013776dec6', 10, 100.00, '2025-05-02', '2025-05-04', 2, 2000.00, 'confirmed', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
  
  ('db4c5e85-48f9-4f45-b016-38e4f6346bd4', '702f1207-82f5-412b-89e3-1a013776dec6', 5, 100.00, '2025-05-20', '2025-05-21', 1, 500.00, 'pending', 'f47ac10b-58cc-4372-a567-0e02b2c3d479');

-- Create payments
INSERT INTO payments (order_id, amount, payment_method, transaction_id, status, payment_date)
VALUES
  ('98f6b6d1-c6c2-4308-8c45-39494c52a5a7', 150.00, 'credit_card', 'TXN123456789', 'completed', '2025-01-01'),
  ('f47b9dbc-c9fd-46a8-a4ea-6b4a39008d2a', 2480.00, 'bank_transfer', 'TXN987654321', 'completed', '2025-02-01'),
  ('db4c5e85-48f9-4f45-b016-38e4f6346bd4', 500.00, 'credit_card', 'TXN567891234', 'completed', '2025-03-05');

-- Create reviews
INSERT INTO reviews (user_id, item_id, rating, review_text, is_verified)
VALUES
  ('2d4e76c9-5ee0-4923-9195-07dc01e48c7d', 'e609e371-1d7a-4b8d-a2a8-b4a9f391e994', 5, 'Great thing!', true),
  ('a11b4266-f31b-48f5-8f38-0c19480b7d3f', 'a4b7c7d7-35c9-4f75-b8c3-5f9a4c35c4d0', 4, 'It is fine', true),
  ('a11b4266-f31b-48f5-8f38-0c19480b7d3f', 'e609e371-1d7a-4b8d-a2a8-b4a9f391e994', 3, 'It could be better...', true);

-- Create promotions
INSERT INTO promotions (code, description, discount_type, discount_value, min_order_amount, max_discount, starts_at, expires_at, usage_limit, times_used, is_active)
VALUES
  ('WELCOME10', 'Get 10% off your first booking', 'percentage', 10.00, 50.00, 100.00, '2025-01-01', '2025-12-31', 100, 12, true),
  ('SUMMER25', 'Summer special: 25% off all bookings', 'percentage', 25.00, 75.00, 200.00, '2025-05-01', '2025-08-31', 50, 0, true),
  ('FLAT20', 'Flat 20 EUR off on bookings above 100 EUR', 'fixed_amount', 20.00, 100.00, 20.00, '2025-03-01', '2025-04-30', 30, 5, true);

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
  ('6ce7f550-f41e-4015-b887-4ea4e895fb68', 'a11b4266-f31b-48f5-8f38-0c19480b7d3f', 'Wish List', 'Units I want to book in the future');

-- Create saved list items - Fixed the incomplete entry
INSERT INTO saved_list_items (list_id, item_id)
VALUES
  ('a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', 'e609e371-1d7a-4b8d-a2a8-b4a9f391e994'),
  ('a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', 'a4b7c7d7-35c9-4f75-b8c3-5f9a4c35c4d0'),
  ('6ce7f550-f41e-4015-b887-4ea4e895fb68', '702f1207-82f5-412b-89e3-1a013776dec6'),
  ('6ce7f550-f41e-4015-b887-4ea4e895fb68', 'e609e371-1d7a-4b8d-a2a8-b4a9f391e994');