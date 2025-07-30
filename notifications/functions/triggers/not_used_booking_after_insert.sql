-- ==============================================================
--  AFTER INSERT ON public.bookings
--  Notifies every active admin in the same organisation.
-- ==============================================================
create or replace function public.trg_booking_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_id uuid;
begin
  for admin_id in
    select uor.user_id
    from public.user_organization_roles uor
    join public.roles r on r.id = uor.role_id
    where uor.organization_id = new.organization_id      -- ⚠️ adjust if column differs
      and uor.is_active      = true
      and r.role             = 'admin'
  loop
    perform public.create_notification(
      admin_id,
      'system',
      'New booking created',
      format('Booking %s was created', new.id),
      'in_app',
      'info',
      jsonb_build_object('booking_id', new.id, 'organization_id', new.organization_id)
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists booking_after_insert on public.bookings;
create trigger booking_after_insert
after insert on public.bookings
for each row execute function public.trg_booking_after_insert();