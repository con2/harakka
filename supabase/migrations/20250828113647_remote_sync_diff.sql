

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_item_availability()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  RAISE WARNING 'Trigger fired function: update_item_availability. Operation: %', TG_OP;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    RAISE WARNING 'NEW.status: %, OLD.status: %', NEW.status, OLD.status;

    IF NEW.status = 'picked_up' AND (OLD.status IS DISTINCT FROM 'picked_up') THEN
      RAISE WARNING 'Confirmed item. Subtracting quantity % from item_id %', NEW.quantity, NEW.item_id;

      UPDATE storage_items
      SET available_quantity = available_quantity - NEW.quantity
      WHERE id = NEW.item_id AND available_quantity >= NEW.quantity;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Not enough available items for storage item %', NEW.item_id;
      END IF;
    END IF;

    IF NEW.status = 'returned' AND (OLD.status IS DISTINCT FROM 'returned') THEN
      RAISE WARNING 'Cancelled item. Adding quantity % back to item_id %', NEW.quantity, NEW.item_id;

      UPDATE storage_items
      SET available_quantity = available_quantity + NEW.quantity
      WHERE id = NEW.item_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    RAISE WARNING 'Deleted item. Adding quantity % back to item_id %', OLD.quantity, OLD.item_id;

    UPDATE storage_items
    SET available_quantity = available_quantity + OLD.quantity
    WHERE id = OLD.item_id;
  END IF;

  RETURN COALESCE(NEW, OLD);

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Trigger error: %', SQLERRM;
    RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_storage_item_totals()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.storage_items
    SET quantity = calculate_storage_item_total(NEW.storage_item_id)
    WHERE id = NEW.storage_item_id;
  END IF;

  -- Handle DELETE and UPDATE (when storage_item_id changes)
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.storage_item_id != NEW.storage_item_id) THEN
    UPDATE public.storage_items
    SET quantity = calculate_storage_item_total(OLD.storage_item_id)
    WHERE id = OLD.storage_item_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$
;


