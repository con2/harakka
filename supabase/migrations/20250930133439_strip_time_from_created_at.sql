drop view view_bookings_with_user_info;

-- cast created_at_text as date to strip the time
-- this way booking searches won't include a matching time, but does match dates.
create view public.view_bookings_with_user_info as
select
  b.id,
  b.status,
  b.created_at,
  b.booking_number,
  b.booked_by_org,
  b.created_at::date::text as created_at_text,
  u.full_name,
  u.visible_name,
  u.email,
  u.id as user_id
from
  bookings b
  join user_profiles u on b.user_id = u.id;