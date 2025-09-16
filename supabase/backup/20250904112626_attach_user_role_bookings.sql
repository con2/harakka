DROP VIEW IF EXISTS public.view_bookings_with_details;

CREATE VIEW public.view_bookings_with_details AS
SELECT
  b.id,
  b.booking_number,
  b.user_id,
  uor.id AS user_role_id,
  uor.role_id,
  r.role AS role_name,
  uor.organization_id AS requester_org_id,
  b.status,
  b.notes,
  b.created_at,
  b.updated_at,
  (
    SELECT json_agg(bi.*)
    FROM booking_items bi
    WHERE bi.booking_id = b.id
  ) AS booking_items
FROM bookings b
LEFT JOIN user_organization_roles uor
  ON uor.user_id = b.user_id
  AND uor.is_active = true
LEFT JOIN roles r
  ON r.id = uor.role_id;
