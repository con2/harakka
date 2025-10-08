-- Secure reminder_logs via RLS while keeping service workflows functional.

alter table public.reminder_logs enable row level security;

create policy "Service role full access (reminder_logs)"
  on public.reminder_logs
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
