-- Function to calculate average rating with error handling
CREATE OR REPLACE FUNCTION calculate_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle DELETE operation differently
  IF TG_OP = 'DELETE' THEN
    UPDATE storage_items
    SET average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE item_id = OLD.item_id
    )
    WHERE id = OLD.item_id;
    RETURN OLD;
  ELSE
    UPDATE storage_items
    SET average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE item_id = NEW.item_id
    )
    WHERE id = NEW.item_id;
    RETURN NEW;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in calculate_average_rating: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reviews
DROP TRIGGER IF EXISTS update_average_rating_trigger ON reviews;
CREATE TRIGGER update_average_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION calculate_average_rating();

-- Function to automatically update storage item availability based on order status changes
CREATE OR REPLACE FUNCTION update_item_availability()
RETURNS TRIGGER AS $$
BEGIN
  RAISE WARNING 'Trigger fired. Operation: %', TG_OP;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    RAISE WARNING 'NEW.status: %, OLD.status: %', NEW.status, OLD.status;

    -- When order is picked up (reducing available inventory)
    IF NEW.status = 'picked_up' AND (OLD.status IS DISTINCT FROM 'picked_up') THEN
      RAISE WARNING 'Confirmed item. Subtracting quantity % from item_id %', NEW.quantity, NEW.item_id;

      UPDATE storage_items
      SET items_number_available = items_number_available - NEW.quantity
      WHERE id = NEW.item_id AND items_number_available >= NEW.quantity;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Not enough available items for storage item %', NEW.item_id;
      END IF;
    END IF;

    -- When item is returned (restoring inventory)
    IF NEW.status = 'returned' AND (OLD.status IS DISTINCT FROM 'returned') THEN
      RAISE WARNING 'Cancelled item. Adding quantity % back to item_id %', NEW.quantity, NEW.item_id;

      UPDATE storage_items
      SET items_number_available = items_number_available + NEW.quantity
      WHERE id = NEW.item_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    RAISE WARNING 'Deleted item. Adding quantity % back to item_id %', OLD.quantity, OLD.item_id;

    UPDATE storage_items
    SET items_number_available = items_number_available + OLD.quantity
    WHERE id = OLD.item_id;
  END IF;

  RETURN COALESCE(NEW, OLD);

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Trigger error: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to manage inventory when order items change status
CREATE TRIGGER manage_inventory_trigger
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION update_item_availability();

-- Function to update order totals with improved error handling
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

-- Trigger for order items
CREATE TRIGGER update_order_amounts_trigger
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION update_order_amounts();