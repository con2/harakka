-- Availability overview RPC for fast, aggregate availability checks per item
-- Defaults to "now" when no timestamps are provided.
--
-- Parameters:
--   org_uuid      UUID of the organization to scope items
--   start_ts      Start of the window (defaults to now())
--   end_ts        End of the window (defaults to now())
--   location_ids  Optional list of location UUIDs to filter
--   item_ids      Optional list of item UUIDs to filter
--   category_ids  Optional list of category UUIDs to filter
--
-- Returns one row per item with total, booked and available quantities for the window.

create or replace function availability_overview(
  org_uuid uuid,
  start_ts timestamptz default now(),
  end_ts   timestamptz default now(),
  location_ids uuid[] default null,
  item_ids uuid[] default null,
  category_ids uuid[] default null
)
returns table (
  item_id uuid,
  total_quantity integer,
  already_booked_quantity integer,
  available_quantity integer
)
language sql
stable
as $$
  with items as (
    select s.id, s.quantity
    from public.storage_items s
    where s.org_id = org_uuid
      and s.is_deleted = false
      and (
        location_ids is null
        or coalesce(array_length(location_ids::uuid[], 1), 0) = 0
        or s.location_id = any(location_ids::uuid[])
      )
      and (
        item_ids is null
        or coalesce(array_length(item_ids::uuid[], 1), 0) = 0
        or s.id = any(item_ids::uuid[])
      )
      and (
        category_ids is null
        or coalesce(array_length(category_ids::uuid[], 1), 0) = 0
        or s.category_id = any(category_ids::uuid[])
      )
  ),
  booked as (
    select bi.item_id, coalesce(sum(bi.quantity), 0)::integer as booked
    from public.booking_items bi
    where bi.item_id in (select id from items)
      and bi.status in ('pending','confirmed','picked_up')
      and bi.start_date <= end_ts
      and bi.end_date   >= start_ts
    group by 1
  )
  select
    i.id as item_id,
    i.quantity as total_quantity,
    coalesce(b.booked, 0) as already_booked_quantity,
    i.quantity - coalesce(b.booked, 0) as available_quantity
  from items i
  left join booked b on b.item_id = i.id
  order by i.id;
$$;

-- Helpful indexes to support the aggregate efficiently.
-- Safe to run repeatedly during migrations.
create index if not exists idx_booking_items_item_status_dates
  on public.booking_items (item_id, status, start_date, end_date);

create index if not exists idx_storage_items_org_deleted
  on public.storage_items (org_id, is_deleted);
