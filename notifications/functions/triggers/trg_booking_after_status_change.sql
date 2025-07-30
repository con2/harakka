-- ======================================================================
--  AFTER UPDATE ON public.bookings
--  (notify owner when status flips to confirmed / rejected)
-- ======================================================================
create or replace function public.trg_booking_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status
     and new.status in ('confirmed','rejected') then

    perform public.create_notification( -- create a notification
      new.user_id, -- owner of the booking
      'system'::notification_type,        -- type

      -- Title and message depend on the new status
      (case
         when new.status = 'confirmed' then 'Booking confirmed'
         when new.status = 'rejected'  then 'Booking rejected'
         else format('Booking %s status changed', new.booking_number)
       end),
      (case
         when new.status = 'confirmed'
         then format('Your booking %s has been confirmed.', new.booking_number)
         when new.status = 'rejected'
         then format('Unfortunately, your booking %s was rejected.', new.booking_number)
         else format('Your booking %s is now %s.', new.booking_number, new.status)
       end),
      'in_app'::notification_channel,         -- channel
      (case                                    -- severity
         when new.status = 'confirmed'
         then 'info'::notification_severity
         else 'warning'::notification_severity
       end),
      jsonb_build_object('booking_id', new.id, 'status', new.status)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists booking_after_update on public.bookings;
create trigger booking_after_update
after update on public.bookings
for each row execute function public.trg_booking_status_change();