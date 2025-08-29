-- Drop current view
drop view if exists view_bookings_with_details;

-- Add view with org_name column
create or replace view public.view_bookings_with_details as
select
  b.id,
  b.booking_number,
  b.user_id,
  b.status,
  b.notes,
  b.created_at,
  b.updated_at,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id',                      bi.id,
        'status',                  bi.status,
        'item_id',                 bi.item_id,
        'end_date',                bi.end_date,
        'quantity',                bi.quantity,
        'booking_id',              bi.booking_id,
        'created_at',              bi.created_at,
        'start_date',              bi.start_date,
        'total_days',              bi.total_days,
        'location_id',             bi.location_id,
        'provider_organization_id',bi.provider_organization_id,
        'org_name',                org.name,
        'storage_items',           jsonb_build_object('translations', si.translations)
      )
    ) filter ( where bi.id is not null ),
    '[]'::jsonb
  ) as booking_items
from
  bookings b
  left join booking_items bi on b.id = bi.booking_id
  left join storage_items si on bi.item_id = si.id
  left join organizations org on bi.provider_organization_id = org.id
group by
  b.id,
  b.booking_number,
  b.user_id,
  b.status,
  b.notes,
  b.created_at,
  b.updated_at
order by
  b.created_at desc;
