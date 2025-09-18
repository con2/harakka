-- ===========================================================================
-- MIGRATION: Set security_invoker = on for all views
-- Purpose:
--   Ensure all views run with the caller's permissions and respect RLS from 
--   base tables. Combined with security_barrier = on for defense-in-depth.
--   
--   security_invoker = on: View queries run as the calling user, not view owner
--   security_barrier = on: Prevents query planner optimizations that could leak data
-- 
-- Requires: PostgreSQL 15+ (available in Supabase)
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- STEP 1: Set security_invoker = on and security_barrier = on for all views
-- ---------------------------------------------------------------------------

-- Private views (should be restricted by base table RLS)
ALTER VIEW public.view_bookings_with_details SET (security_invoker = on);
ALTER VIEW public.view_bookings_with_details SET (security_barrier = on);

ALTER VIEW public.view_bookings_with_user_info SET (security_invoker = on);
ALTER VIEW public.view_bookings_with_user_info SET (security_barrier = on);

ALTER VIEW public.view_user_ban_status SET (security_invoker = on);
ALTER VIEW public.view_user_ban_status SET (security_barrier = on);

ALTER VIEW public.view_user_roles_with_details SET (security_invoker = on);
ALTER VIEW public.view_user_roles_with_details SET (security_barrier = on);

-- Public catalog views (still benefit from security settings)
ALTER VIEW public.view_item_location_summary SET (security_invoker = on);
ALTER VIEW public.view_item_location_summary SET (security_barrier = on);

ALTER VIEW public.view_item_ownership_summary SET (security_invoker = on);
ALTER VIEW public.view_item_ownership_summary SET (security_barrier = on);

ALTER VIEW public.view_manage_storage_items SET (security_invoker = on);
ALTER VIEW public.view_manage_storage_items SET (security_barrier = on);

ALTER VIEW public.view_tag_popularity SET (security_invoker = on);
ALTER VIEW public.view_tag_popularity SET (security_barrier = on);

ALTER VIEW public.view_category_details SET (security_invoker = on);
ALTER VIEW public.view_category_details SET (security_barrier = on);

-- ---------------------------------------------------------------------------
-- STEP 2: Verify view security options are set
-- ---------------------------------------------------------------------------

-- Show view options in migration logs
SELECT 
  n.nspname AS schema_name,
  c.relname AS view_name,
  c.reloptions AS options
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relkind = 'v' 
  AND c.relname LIKE 'view_%'
ORDER BY c.relname;

-- ---------------------------------------------------------------------------
-- STEP 3: Add explanatory comments
-- ---------------------------------------------------------------------------

COMMENT ON VIEW public.view_bookings_with_details IS 
'Booking details with items and organizations. Security: security_invoker=on ensures RLS from base tables (bookings, booking_items, storage_items, organizations) is respected for the calling user. security_barrier=on prevents query optimization leaks.';

COMMENT ON VIEW public.view_bookings_with_user_info IS
'Booking summary with user information. Security: security_invoker=on ensures RLS from base tables (bookings, user_profiles) is respected for the calling user. security_barrier=on prevents query optimization leaks.';

COMMENT ON VIEW public.view_user_ban_status IS
'User ban status with role counts and latest ban information. Security: security_invoker=on ensures RLS from base tables and SECURITY DEFINER function get_latest_ban_record() (which respects FORCE RLS on user_ban_history) is evaluated as the calling user. security_barrier=on prevents query optimization leaks.';

COMMENT ON VIEW public.view_user_roles_with_details IS
'User role assignments with organization and user details. Security: security_invoker=on ensures RLS from base tables (user_organization_roles, user_profiles, roles, organizations) is respected for the calling user. security_barrier=on prevents query optimization leaks.';

COMMENT ON VIEW public.view_item_location_summary IS
'Public catalog view of storage items by location. Security: security_invoker=on ensures any RLS from base tables (storage_items, storage_locations) is respected for the calling user. Generally accessible to anonymous users for catalog browsing.';

COMMENT ON VIEW public.view_item_ownership_summary IS
'Public catalog view of item ownership across locations. Security: security_invoker=on ensures any RLS from base tables (storage_items, storage_locations) is respected for the calling user. Generally accessible to anonymous users for catalog browsing.';

COMMENT ON VIEW public.view_manage_storage_items IS
'Comprehensive storage item management view with tags and translations. Security: security_invoker=on ensures RLS from base tables (storage_items, storage_locations, storage_item_tags, tags) is respected for the calling user. Generally accessible to anonymous users for catalog browsing but RLS may filter by organization.';

COMMENT ON VIEW public.view_tag_popularity IS
'Tag usage statistics and popularity rankings. Security: security_invoker=on ensures any RLS from base tables (tags) is respected for the calling user. Generally accessible to anonymous users for public tag browsing.';

COMMENT ON VIEW public.view_category_details IS
'Category information with details. Security: security_invoker=on ensures any RLS from base tables (categories) is respected for the calling user. Generally accessible to anonymous users for public category browsing.';
