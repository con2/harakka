-- Fix booking notifications to handle both creation and status changes
-- This addresses the issue where new bookings didn't generate notifications

-- 1) Status change notifications (booking owner + admins)
CREATE OR REPLACE FUNCTION "public"."trg_booking_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Only handle real status changes on UPDATE
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    -- Notify the booking owner
    PERFORM public.create_notification(
      NEW.user_id,
      CASE
        WHEN NEW.status = 'confirmed' THEN 'booking.status_approved'::notification_type
        WHEN NEW.status = 'rejected'  THEN 'booking.status_rejected'::notification_type
      END,
      'Booking Status Update', -- title
      CASE
        WHEN NEW.status = 'confirmed' THEN 'Your booking has been confirmed'
        WHEN NEW.status = 'rejected'  THEN 'Your booking has been rejected'
        ELSE 'Booking status updated'
      END, -- message
      'in_app'::notification_channel,
      CASE WHEN NEW.status = 'confirmed' THEN 'info'::notification_severity ELSE 'warning'::notification_severity END,
      jsonb_build_object('booking_id', NEW.id,
                         'booking_number', NEW.booking_number,
                         'status', NEW.status),
      format('booking.status:%s:%s:%s', NEW.id, NEW.status, NEW.user_id) -- idempotent per user/status
    );

    -- Notify organization admins (tenant_admin, storage_manager)
    FOR admin_user_id IN
      SELECT DISTINCT uor.user_id
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
        'Booking Status Update', -- title
        CASE
          WHEN NEW.status = 'confirmed' THEN 'A booking has been confirmed'
          WHEN NEW.status = 'rejected'  THEN 'A booking has been rejected'
          ELSE 'Booking status updated'
        END, -- message
        'in_app'::notification_channel,
        CASE WHEN NEW.status = 'confirmed' THEN 'info'::notification_severity ELSE 'warning'::notification_severity END,
        jsonb_build_object('booking_id', NEW.id,
                           'booking_number', NEW.booking_number,
                           'status', NEW.status),
        format('booking.status.admin:%s:%s:%s', NEW.id, NEW.status, admin_user_id)
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure the bookings trigger fires on UPDATE (status changes)
DROP TRIGGER IF EXISTS "booking_after_insert_or_update" ON "public"."bookings";
DROP TRIGGER IF EXISTS "booking_after_update" ON "public"."bookings";
CREATE TRIGGER "booking_after_update"
  AFTER UPDATE ON "public"."bookings"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."trg_booking_status_change"();

-- 2) New booking notifications to provider org admins via booking_items
-- Rationale: at the time a booking row is inserted, booking_items often
-- aren't present yet. Hook into booking_items inserts instead.
CREATE OR REPLACE FUNCTION public.trg_booking_items_after_insert() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  admin_user_id uuid;
  b_user_id uuid;
  b_number text;
BEGIN
  -- Lookup booking metadata and owner once
  SELECT user_id, booking_number INTO b_user_id, b_number
  FROM public.bookings
  WHERE id = NEW.booking_id;

  IF b_user_id IS NULL THEN
    RETURN NEW; -- safety guard
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
      'New Booking Created', -- title
      'A new booking has been created in your organization', -- message
      'in_app'::notification_channel,
      'info'::notification_severity,
      jsonb_build_object('booking_id', NEW.booking_id,
                         'booking_number', b_number,
                         'status', (SELECT status FROM public.bookings WHERE id = NEW.booking_id)),
      format('booking.created:%s:%s', NEW.booking_id, admin_user_id) -- once per booking/admin
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS booking_items_after_insert ON public.booking_items;
CREATE TRIGGER booking_items_after_insert
  AFTER INSERT ON public.booking_items
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_booking_items_after_insert();

-- 3) Notify all super_admins when a new user is created
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
      'New User Registered', -- title
      'A new user has registered in the system', -- message
      'in_app'::notification_channel,
      'info'::notification_severity,
      jsonb_build_object('new_user_id', NEW.id,
                         'email', NEW.email,
                         'auth_table', true),
      format('user.created:%s:%s', NEW.id, admin_id)
    );
  END LOOP;
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists on auth.users (not public.user_profiles)
DROP TRIGGER IF EXISTS user_after_insert ON auth.users;
DROP TRIGGER IF EXISTS user_profiles_after_insert ON public.user_profiles;
CREATE TRIGGER user_after_insert
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_user_after_insert();
