-- Reminder e-mail logging for due/overdue bookings
-- Helsinki timezone is handled in application logic; we store UTC timestamps and local date keys here.

-- Ensure pgcrypto is available for gen_random_uuid()
create extension if not exists pgcrypto;

create table if not exists public.reminder_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  recipient_email text not null,
  -- Logical day (in business timezone) when this reminder is considered; used for idempotency
  reminder_date date not null,
  -- 'due_day' = due today; 'overdue' = after due date
  type text not null check (type in ('due_day','overdue')),

  -- Process metadata
  status text not null default 'claimed' check (status in ('claimed','sent','failed')),
  claimed_at timestamptz null,
  sent_at timestamptz null,
  error text null,
  created_at timestamptz not null default now()
);

-- Prevent multiple sends for the same booking/recipient/day/type
create unique index if not exists ux_reminder_logs_unique_per_day
  on public.reminder_logs (booking_id, recipient_email, reminder_date, type);

-- Helpful indexes for operational queries
create index if not exists ix_reminder_logs_status on public.reminder_logs (status);
create index if not exists ix_reminder_logs_booking on public.reminder_logs (booking_id);

comment on table public.reminder_logs is 'Tracks daily due/overdue reminder e-mails per booking and recipient to ensure idempotency.';
comment on column public.reminder_logs.reminder_date is 'Business-day key (e.g., Europe/Helsinki) for idempotent sends.';
