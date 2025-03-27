-- Function to calculate average rating
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

-- Trigger for reviews
CREATE TRIGGER update_average_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION calculate_average_rating();

-- Function to update order totals
CREATE OR REPLACE FUNCTION update_order_amounts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET total_amount = (
    SELECT SUM(subtotal)
    FROM order_items
    WHERE order_id = NEW.order_id
  ),
  final_amount = (
    SELECT SUM(subtotal)
    FROM order_items
    WHERE order_id = NEW.order_id
  ) - discount_amount
  WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for order items
CREATE TRIGGER update_order_amounts_trigger
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION update_order_amounts();