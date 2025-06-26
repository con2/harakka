-- Example queries for your Storage and Booking App database
-- Run these in Supabase Studio or through psql

-- 1. Check all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. View all storage locations
SELECT id, name, address, is_active 
FROM storage_locations;

-- 3. View all storage items with their locations
SELECT 
    si.id,
    si.items_number_total,
    si.items_number_available,
    si.price,
    si.average_rating,
    sl.name as location_name,
    sl.address as location_address
FROM storage_items si
JOIN storage_locations sl ON si.location_id = sl.id
WHERE si.is_active = true AND si.is_deleted = false;

-- 4. View all orders with user information
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.total_amount,
    o.payment_status,
    o.created_at,
    up.full_name,
    up.email
FROM orders o
JOIN user_profiles up ON o.user_id = up.id
ORDER BY o.created_at DESC;

-- 5. View order items with details
SELECT 
    oi.id,
    o.order_number,
    si.translations->>'name' as item_name,
    oi.quantity,
    oi.unit_price,
    oi.start_date,
    oi.end_date,
    oi.total_days,
    oi.subtotal,
    oi.status,
    sl.name as location_name
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN storage_items si ON oi.item_id = si.id
JOIN storage_locations sl ON oi.location_id = sl.id
ORDER BY oi.created_at DESC;

-- 6. Check inventory status
SELECT 
    si.id,
    si.translations->>'name' as item_name,
    si.items_number_total,
    si.items_number_available,
    si.items_number_currently_in_storage,
    si.price,
    si.average_rating,
    sl.name as location_name
FROM storage_items si
JOIN storage_locations sl ON si.location_id = sl.id
WHERE si.is_active = true AND si.is_deleted = false
ORDER BY sl.name, si.translations->>'name';

-- 7. View reviews and ratings
SELECT 
    r.id,
    r.rating,
    r.review_text,
    r.is_verified,
    r.created_at,
    up.visible_name as reviewer_name,
    si.translations->>'name' as item_name
FROM reviews r
JOIN user_profiles up ON r.user_id = up.id
JOIN storage_items si ON r.item_id = si.id
ORDER BY r.created_at DESC;

-- 8. Check payment status
SELECT 
    p.id,
    o.order_number,
    p.amount,
    p.payment_method,
    p.status,
    p.payment_date,
    p.transaction_id
FROM payments p
JOIN orders o ON p.order_id = o.id
ORDER BY p.payment_date DESC;

-- 9. View audit logs (recent activities)
SELECT 
    al.id,
    al.table_name,
    al.action,
    al.created_at,
    up.visible_name as user_name,
    al.new_values
FROM audit_logs al
LEFT JOIN user_profiles up ON al.user_id = up.id
ORDER BY al.created_at DESC
LIMIT 20;

-- 10. Insert sample data examples

-- Insert a new storage location
-- INSERT INTO storage_locations (name, description, address, latitude, longitude) 
-- VALUES ('Downtown Storage', 'Main city storage facility', '123 Main St, City, State', 40.7128, -74.0060);

-- Insert a new storage item
-- INSERT INTO storage_items (location_id, items_number_total, items_number_available, price, translations)
-- VALUES (
--     (SELECT id FROM storage_locations WHERE name = 'Downtown Storage'),
--     10,
--     10,
--     25.00,
--     '{"name": "Small Storage Box", "description": "Perfect for small items"}'
-- );

-- Insert a user profile
-- INSERT INTO user_profiles (id, role, full_name, visible_name, email)
-- VALUES (
--     gen_random_uuid(),
--     'user',
--     'John Doe',
--     'John D.',
--     'john.doe@example.com'
-- );
