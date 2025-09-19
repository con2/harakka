ALTER TABLE bookings
ADD COLUMN booked_by_org UUID DEFAULT NULL;

drop view view_bookings_with_user_info;
create view public.view_bookings_with_user_info as
select
  b.id,
  b.status,
  b.created_at,
  b.booking_number,
  b.booked_by_org,
  b.created_at::text as created_at_text,
  u.full_name,
  u.visible_name,
  u.email,
  u.id as user_id
from
  bookings b
  join user_profiles u on b.user_id = u.id;