-- Ensure view_bookings_with_user_info executes with caller privileges so RLS applies.

drop view if exists public.view_bookings_with_user_info;

create view public.view_bookings_with_user_info
with (security_invoker = on, security_barrier = on) as
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
from public.bookings b
join public.user_profiles u on b.user_id = u.id;

comment on view public.view_bookings_with_user_info is
'Booking summary with user information. Runs with the caller''s privileges (security_invoker=on) and respects RLS of bookings/user_profiles; security_barrier=on prevents planner leaks.';
