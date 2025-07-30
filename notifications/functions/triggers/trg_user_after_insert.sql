-- ==============================================================
--  AFTER INSERT ON auth.users
--  Notifies every active admin (any organisation).
-- ==============================================================
create or replace function public.trg_user_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_id uuid;
begin
  for admin_id in
    select distinct uor.user_id
    from public.user_organization_roles uor
    join public.roles r on r.id = uor.role_id
    where uor.is_active = true
      and r.role        = 'admin'
  loop
    perform public.create_notification(
      admin_id,
      'system',
      'A new user joined',
      format('User %s just registered', new.email),
      'in_app',
      'info',
      jsonb_build_object('new_user_id', new.id)
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists user_after_insert on auth.users;
create trigger user_after_insert
after insert on auth.users
for each row execute function public.trg_user_after_insert();