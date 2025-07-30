-- ==============================================================
--  public.create_notification( … )
--  Inserts one row into public.notifications
--  • "idempotency_key" guarantees exactly-once delivery
-- ==============================================================
create or replace function public.create_notification(
  p_user_id         uuid,
  p_type            notification_type,
  p_title           text,
  p_message         text          default null,
  p_channel         notification_channel  default 'in_app',
  p_severity        notification_severity default 'info',
  p_metadata        jsonb         default '{}'::jsonb,
  p_idempotency_key text          default gen_random_uuid()
) returns void
language plpgsql
security definer                             -- ⇐ let triggers call it
set search_path = public
as $$
begin
  insert into public.notifications (
    user_id,      type,      title,     message,
    channel,      severity,  metadata,  idempotency_key
  )
  values (
    p_user_id,    p_type,    p_title,   p_message,
    p_channel,    p_severity,p_metadata,p_idempotency_key
  )
  on conflict (idempotency_key) do nothing;  -- exactly-once
end;
$$;