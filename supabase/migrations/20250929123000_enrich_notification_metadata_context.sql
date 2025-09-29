-- Enrich notification metadata with org/role context for better client filtering
-- - Add organization_id to booking-created/admin and booking-status/admin notifications
-- - Add audience_roles + scope to user-created notifications for super_admins

-- 1) New booking notifications via booking_items: include provider org context
CREATE OR REPLACE FUNCTION public.trg_booking_items_after_insert() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  admin_user_id uuid;
  b_user_id uuid;
  b_number text;
BEGIN
  SELECT user_id, booking_number INTO b_user_id, b_number
  FROM public.bookings
  WHERE id = NEW.booking_id;

  IF b_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  FOR admin_user_id IN
    SELECT DISTINCT uor.user_id
    FROM public.user_organization_roles uor
    JOIN public.roles r ON uor.role_id = r.id
    WHERE uor.organization_id = NEW.provider_organization_id
      AND r.role IN ('tenant_admin', 'storage_manager')
      AND uor.is_active = true
      AND uor.user_id != b_user_id
  LOOP
    PERFORM public.create_notification(
      admin_user_id,
      'booking.created'::notification_type,
      'New Booking Created',
      'A new booking has been created in your organization',
      'in_app'::notification_channel,
      'info'::notification_severity,
      jsonb_build_object(
        'booking_id', NEW.booking_id,
        'booking_number', b_number,
        'status', (SELECT status FROM public.bookings WHERE id = NEW.booking_id),
        'organization_id', NEW.provider_organization_id,
        'scope', 'org'
      ),
      format('booking.created:%s:%s', NEW.booking_id, admin_user_id)
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- 2) Booking status change notifications: include org context for admin recipients
CREATE OR REPLACE FUNCTION public.trg_booking_status_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  admin_user_id uuid;
  admin_org_id uuid;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    -- Booking owner (no org scoping: shows in any context)
    PERFORM public.create_notification(
      NEW.user_id,
      CASE
        WHEN NEW.status = 'confirmed' THEN 'booking.status_approved'::notification_type
        WHEN NEW.status = 'rejected'  THEN 'booking.status_rejected'::notification_type
      END,
      'Booking Status Update',
      CASE
        WHEN NEW.status = 'confirmed' THEN 'Your booking has been confirmed'
        WHEN NEW.status = 'rejected'  THEN 'Your booking has been rejected'
        ELSE 'Booking status updated'
      END,
      'in_app'::notification_channel,
      CASE WHEN NEW.status = 'confirmed' THEN 'info'::notification_severity ELSE 'warning'::notification_severity END,
      jsonb_build_object(
        'booking_id', NEW.id,
        'booking_number', NEW.booking_number,
        'status', NEW.status
      ),
      format('booking.status:%s:%s:%s', NEW.id, NEW.status, NEW.user_id)
    );

    -- Admins for provider organizations with org context
    FOR admin_user_id, admin_org_id IN
      SELECT DISTINCT uor.user_id, uor.organization_id
      FROM public.booking_items bi
      JOIN public.user_organization_roles uor ON bi.provider_organization_id = uor.organization_id
      JOIN public.roles r ON uor.role_id = r.id
      WHERE bi.booking_id = NEW.id
        AND r.role IN ('tenant_admin', 'storage_manager')
        AND uor.is_active = true
        AND uor.user_id != NEW.user_id
    LOOP
      PERFORM public.create_notification(
        admin_user_id,
        CASE
          WHEN NEW.status = 'confirmed' THEN 'booking.status_approved'::notification_type
          WHEN NEW.status = 'rejected'  THEN 'booking.status_rejected'::notification_type
        END,
        'Booking Status Update',
        CASE
          WHEN NEW.status = 'confirmed' THEN 'A booking has been confirmed'
          WHEN NEW.status = 'rejected'  THEN 'A booking has been rejected'
          ELSE 'Booking status updated'
        END,
        'in_app'::notification_channel,
        CASE WHEN NEW.status = 'confirmed' THEN 'info'::notification_severity ELSE 'warning'::notification_severity END,
        jsonb_build_object(
          'booking_id', NEW.id,
          'booking_number', NEW.booking_number,
          'status', NEW.status,
          'organization_id', admin_org_id,
          'scope', 'org'
        ),
        format('booking.status.admin:%s:%s:%s', NEW.id, NEW.status, admin_user_id)
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- 3) User created -> super_admins: include audience_roles + scope
CREATE OR REPLACE FUNCTION public.trg_user_after_insert() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  admin_id uuid;
BEGIN
  FOR admin_id IN
    SELECT DISTINCT uor.user_id
    FROM public.user_organization_roles uor
    JOIN public.roles r ON r.id = uor.role_id
    WHERE r.role = 'super_admin' AND uor.is_active
  LOOP
    PERFORM public.create_notification(
      admin_id,
      'user.created'::notification_type,
      'New User Registered',
      'A new user has registered in the system',
      'in_app'::notification_channel,
      'info'::notification_severity,
      jsonb_build_object(
        'new_user_id', NEW.id,
        'email', NEW.email,
        'auth_table', true,
        'audience_roles', jsonb_build_array('super_admin'),
        'scope', 'role'
      ),
      format('user.created:%s:%s', NEW.id, admin_id)
    );
  END LOOP;
  RETURN NEW;
END;
$$;

