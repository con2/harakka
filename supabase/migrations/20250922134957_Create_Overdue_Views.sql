-- View(s) to compute due status per booking based on active items
-- Uses Europe/Helsinki day boundary

create or replace view public.view_bookings_due_status as
select
  b.id as booking_id,
  b.booking_number,
  up.id as user_id,
  up.full_name,
  up.email as user_email,
  ai.earliest_due_date,
  case
    when ai.earliest_due_date < (now() at time zone 'Europe/Helsinki')::date then 'overdue'
    when ai.earliest_due_date = (now() at time zone 'Europe/Helsinki')::date then 'due_today'
    else 'future'
  end as due_status,
  GREATEST(((now() at time zone 'Europe/Helsinki')::date - ai.earliest_due_date), 0) as days_overdue
from public.bookings b
join (
  select
    bi.booking_id,
    (min(bi.end_date) at time zone 'Europe/Helsinki')::date as earliest_due_date
  from public.booking_items bi
  where bi.status in ('confirmed','picked_up')
  group by bi.booking_id
) ai on ai.booking_id = b.id
join public.user_profiles up on up.id = b.user_id;

create or replace view public.view_bookings_overdue as
  select * from public.view_bookings_due_status where due_status = 'overdue';

create or replace view public.view_bookings_due_today as
  select * from public.view_bookings_due_status where due_status = 'due_today';

alter view public.view_bookings_due_status set (security_invoker = on, security_barrier = on);
alter view public.view_bookings_overdue set (security_invoker = on, security_barrier = on);
alter view public.view_bookings_due_today set (security_invoker = on, security_barrier = on);

-- Helpful index to aid scans by status/date
create index if not exists ix_booking_items_status_end_date on public.booking_items (status, end_date);

grant select on public.view_bookings_due_status to anon, authenticated, service_role;
grant select on public.view_bookings_overdue to anon, authenticated, service_role;
grant select on public.view_bookings_due_today to anon, authenticated, service_role;
