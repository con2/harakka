-- Backfill notification metadata with org/role context for role‑aware filtering
--
-- ===============================================================================================
-- NOTE: You need to run this manually in the SQL editor after doing supabase db reset locally.  
-- ===============================================================================================
-- Scope:
-- 1) booking.created → add organization_id + scope='org' (admin recipients)
-- 2) booking.status_(approved|rejected) → add organization_id + scope='org' (admin recipients only)
-- 3) user.created → add audience_roles=['super_admin'] + scope='role' (super_admin recipients)
--
-- Notes:
-- - Owner notifications for booking status changes are left without org context
--   on purpose (they should show in any active context).
-- - The UPDATEs are idempotent: only rows missing the respective keys are updated.

BEGIN;

-- 1) Backfill organization_id for booking.created admin notifications
UPDATE public.notifications n
SET metadata = coalesce(n.metadata, '{}'::jsonb)
             || jsonb_build_object('organization_id', uor.organization_id,
                                   'scope', 'org')
FROM public.booking_items bi
JOIN public.user_organization_roles uor
  ON uor.organization_id = bi.provider_organization_id
JOIN public.roles r
  ON r.id = uor.role_id
WHERE n.type = 'booking.created'
  AND (n.metadata ->> 'organization_id') IS NULL
  AND (n.metadata ->> 'booking_id') IS NOT NULL
  AND (n.metadata ->> 'booking_id')::uuid = bi.booking_id
  AND n.user_id = uor.user_id
  AND uor.is_active = TRUE
  AND r.role IN ('tenant_admin', 'storage_manager');

-- 2) Backfill organization_id for booking status change admin notifications
UPDATE public.notifications n
SET metadata = coalesce(n.metadata, '{}'::jsonb)
             || jsonb_build_object('organization_id', uor.organization_id,
                                   'scope', 'org')
FROM public.booking_items bi
JOIN public.user_organization_roles uor
  ON uor.organization_id = bi.provider_organization_id
JOIN public.roles r
  ON r.id = uor.role_id
WHERE n.type IN ('booking.status_approved', 'booking.status_rejected')
  AND (n.metadata ->> 'organization_id') IS NULL
  AND (n.metadata ->> 'booking_id') IS NOT NULL
  AND (n.metadata ->> 'booking_id')::uuid = bi.booking_id
  AND n.user_id = uor.user_id
  AND uor.is_active = TRUE
  AND r.role IN ('tenant_admin', 'storage_manager');

-- 3) Backfill audience_roles for user.created notifications to super_admins
UPDATE public.notifications n
SET metadata = coalesce(n.metadata, '{}'::jsonb)
             || jsonb_build_object('audience_roles', jsonb_build_array('super_admin'),
                                   'scope', 'role')
FROM public.user_organization_roles uor
JOIN public.roles r
  ON r.id = uor.role_id
WHERE n.type = 'user.created'
  AND (n.metadata ->> 'audience_roles') IS NULL
  AND n.user_id = uor.user_id
  AND uor.is_active = TRUE
  AND r.role = 'super_admin';

COMMIT;

