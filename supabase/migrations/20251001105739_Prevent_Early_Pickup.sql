-- Prevent setting booking_items.status = 'picked_up' before the item start_date
-- This policy is RESTRICTIVE and combines with existing permissive org-role policies.
-- It will block any update that attempts to set NEW.status to 'picked_up'
-- when NEW.start_date is still in the future (relative to now()).

-- Safety: drop if it exists to allow re-run
drop policy if exists "pickup_not_before_start" on public.booking_items;

create policy "pickup_not_before_start" on public.booking_items
  as restrictive
  for update to authenticated
  using (true)
  with check (
    -- Allow all updates except when setting status to picked_up
    (NEW.status <> 'picked_up') OR (NEW.start_date <= now())
  );

comment on policy "pickup_not_before_start" on public.booking_items is
  'Restrictive guardrail preventing pickup before start_date. Evaluates on NEW row.';

