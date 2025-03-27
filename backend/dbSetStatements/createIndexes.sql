-- Add indexes for frequently queried columns
CREATE INDEX idx_storage_items_location ON storage_items(location_id);
CREATE INDEX idx_storage_items_status ON storage_items(status);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_reviews_item ON reviews(item_id);