-- ============================================================================
-- Booking Items: drop ban policies and allow public SELECT for popularity view
-- Context: tag popularity view (security_invoker=on) needs to aggregate
--          booking_items. Backend tags endpoint is public (anon client), so
--          anon must be able to SELECT booking_items for accurate counts.
--          We drop ban policies for now as requested.
-- ============================================================================

ALTER TABLE IF EXISTS public.booking_items ENABLE ROW LEVEL SECURITY;

-- Drop anonymous deny policy (blocks SELECT by anon)
DROP POLICY IF EXISTS "deny_anonymous_access_booking_items" ON public.booking_items;

-- Drop any ban-enforcement policies on booking_items (all variants)
DROP POLICY IF EXISTS "Ban Enforcement App Bookings" ON public.booking_items; -- safety
DROP POLICY IF EXISTS "ban_enforcement_app_booking_items" ON public.booking_items;
DROP POLICY IF EXISTS "ban_enforcement_app_booking_items (insert)" ON public.booking_items;
DROP POLICY IF EXISTS "ban_enforcement_app_booking_items (update)" ON public.booking_items;
DROP POLICY IF EXISTS "ban_enforcement_app_booking_items (delete)" ON public.booking_items;
DROP POLICY IF EXISTS "Ban Enforcement Org Bookings" ON public.booking_items; -- safety
DROP POLICY IF EXISTS "ban_enforcement_org_booking_items" ON public.booking_items;
DROP POLICY IF EXISTS "ban_enforcement_org_booking_items (insert)" ON public.booking_items;
DROP POLICY IF EXISTS "ban_enforcement_org_booking_items (update)" ON public.booking_items;
DROP POLICY IF EXISTS "ban_enforcement_org_booking_items (delete)" ON public.booking_items;

-- Allow read access for everyone (anon + authenticated) so popularity view works
DROP POLICY IF EXISTS "All users can read booking_items" ON public.booking_items;
CREATE POLICY "All users can read booking_items" ON public.booking_items
  FOR SELECT TO public
  USING (true);

-- Note: keep existing INSERT/UPDATE/DELETE org-role policies if present; they
--       control mutations. If you want to temporarily block mutations too,
--       leave them as-is; this migration only fixes SELECT visibility.

