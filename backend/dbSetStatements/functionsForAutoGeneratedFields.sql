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
DROP TRIGGER IF EXISTS update_order_amounts_trigger ON order_items;
CREATE TRIGGER update_order_amounts_trigger
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION update_order_amounts();

-- NEW FUNCTION: Update storage item availability based on orders
CREATE OR REPLACE FUNCTION update_item_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- For new or updated order items
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
  END IF;
  
  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in update_item_availability: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for inventory management
DROP TRIGGER IF EXISTS update_item_availability_trigger ON order_items;
CREATE TRIGGER update_item_availability_trigger
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION update_item_availability();

-- Handles new user creation, syncs Supabase auth and user_profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Removed the problematic "SET LOCAL ROLE postgres;" line
  
  INSERT INTO public.user_profiles (
    id, role, email, phone, created_at
  )
  VALUES (
    NEW.id, 'user', NEW.email, NEW.phone, NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();