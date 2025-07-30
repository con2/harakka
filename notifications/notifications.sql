-- === Enums =============================================================
create type notification_channel  as enum ('in_app', 'web_push', 'email');
create type notification_severity as enum ('info', 'warning', 'critical');
create type notification_type     as enum ('comment', 'mention', 'system', 'custom');

-- === Core table ========================================================
create table if not exists public.notifications (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.user_profiles(id)
                        on update cascade on delete cascade,
  created_at       timestamptz not null default now(),
  delivered_at     timestamptz,
  read_at          timestamptz,
  type             notification_type     not null,
  severity         notification_severity not null default 'info',
  title            text                 not null,
  message          text,
  channel          notification_channel  not null default 'in_app',
  metadata         jsonb,

  -- **exactly-once safety valve**
  idempotency_key  text not null default gen_random_uuid(),
  unique(idempotency_key)
);

-- === Fast “unread” badge per-user =====================================
create index if not exists notifications_unread_idx
  on public.notifications(user_id, created_at desc)
  where read_at is null;

-- === Flexible filters on metadata =====================================
create index if not exists notifications_metadata_gin
  on public.notifications using gin(metadata jsonb_path_ops);


-- === RLS: users only see their own rows ===============================
alter table public.notifications enable row level security;

create policy "User can select own notifications"
  on public.notifications
  for select using (user_id = auth.uid());