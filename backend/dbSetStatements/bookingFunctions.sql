-- Reserve available quantity for an item
create or replace function reserve_item_quantity(item_id uuid, quantity int)
returns void
language plpgsql
as $$
begin
  update storage_items
  set items_number_available = items_number_available - quantity
  where id = item_id and items_number_available >= quantity;

  if not found then
    raise exception 'Not enough stock or item not found';
  end if;
end;
$$;

-- Release the quantity of an item again (e.g. in case of cancellation)
create or replace function increment_item_quantity(item_id uuid, quantity int)
returns void
language plpgsql
as $$
begin
  update storage_items
  set items_number_available = items_number_available + quantity
  where id = item_id;
end;
$$;

-- not executed yet in the database!!! TODO