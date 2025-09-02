-- Fix booking notifications to handle both creation and status changes
-- This addresses the issue where new bookings don't generate notifications

-- Update the trigger function to handle both INSERT and UPDATE events
CREATE OR REPLACE FUNCTION "public"."trg_booking_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  admin_user_id uuid;
  is_new_booking boolean;
  is_status_change boolean;
BEGIN
  -- Determine if this is a new booking or status change
  is_new_booking := (TG_OP = 'INSERT');
  is_status_change := (TG_OP = 'UPDATE' AND new.status IS DISTINCT FROM old.status);
  
  -- Only proceed if this is a new booking OR if status actually changed
  IF is_new_booking OR is_status_change THEN
    
    -- 1. Notify the booking owner for status changes (not for new bookings)
    IF is_status_change THEN
      PERFORM public.create_notification(
        new.user_id,
        CASE
          WHEN new.status = 'confirmed'
            THEN 'booking.status_approved'::notification_type
          WHEN new.status = 'rejected'
            THEN 'booking.status_rejected'::notification_type
        END,
        '', '',                                -- titles/messages from UI
        'in_app'::notification_channel,
        (CASE
           WHEN new.status = 'confirmed'
           THEN 'info'::notification_severity
           ELSE 'warning'::notification_severity
         END),
        jsonb_build_object(
          'booking_id',     new.id,
          'booking_number', new.booking_number,
          'status',         new.status
        )
      );
    END IF;

    -- 2. Notify organization-specific admins for both new bookings and status changes
    -- Find all admins from organizations that provide items in this booking
    FOR admin_user_id IN
      SELECT DISTINCT uor.user_id
      FROM booking_items bi
      JOIN user_organization_roles uor ON bi.provider_organization_id = uor.organization_id
      JOIN roles r ON uor.role_id = r.id
      WHERE bi.booking_id = new.id 
        AND r.role IN ('tenant_admin', 'storage_manager')
        AND uor.is_active = true
        AND uor.user_id != new.user_id  -- Don't notify booking owner
    LOOP
      PERFORM public.create_notification(
        admin_user_id,
        CASE
          WHEN is_new_booking THEN 'booking.status_approved'::notification_type  -- Use approved type for new bookings to admins
          WHEN new.status = 'confirmed'
            THEN 'booking.status_approved'::notification_type
          WHEN new.status = 'rejected'
            THEN 'booking.status_rejected'::notification_type
        END,
        '', '',                              -- titles/messages from UI
        'in_app'::notification_channel,
        (CASE
           WHEN is_new_booking OR new.status = 'confirmed'
           THEN 'info'::notification_severity
           ELSE 'warning'::notification_severity
         END),
        jsonb_build_object(
          'booking_id',     new.id,
          'booking_number', new.booking_number,
          'status',         new.status
        )
      );
    END LOOP;
    
  END IF;
  
  RETURN new;
END;
$$;

-- Update the existing trigger to handle both INSERT and UPDATE
DROP TRIGGER IF EXISTS "booking_after_update" ON "public"."bookings";

-- Create a new trigger that fires on both INSERT and UPDATE
CREATE OR REPLACE TRIGGER "booking_after_insert_or_update" 
  AFTER INSERT OR UPDATE ON "public"."bookings" 
  FOR EACH ROW 
  EXECUTE FUNCTION "public"."trg_booking_status_change"();
