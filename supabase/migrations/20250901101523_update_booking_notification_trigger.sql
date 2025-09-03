-- Update booking status change trigger to notify organization-specific admins only
-- and ensure booking_id is included in metadata

CREATE OR REPLACE FUNCTION "public"."trg_booking_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Only proceed if status actually changed
  IF new.status IS DISTINCT FROM old.status THEN
    
    -- 1. Notify the booking owner
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

    -- 2. Notify organization-specific admins only
    -- Find all admins from organizations that provide items in this booking
    FOR admin_user_id IN
      SELECT DISTINCT uor.user_id
      FROM booking_items bi
      JOIN user_organization_roles uor ON bi.provider_organization_id = uor.organization_id
      JOIN roles r ON uor.role_id = r.id
      WHERE bi.booking_id = new.id 
        AND r.role IN ('tenant_admin', 'storage_manager')
        AND uor.is_active = true
        AND uor.user_id != new.user_id  -- Don't notify booking owner twice
    LOOP
      PERFORM public.create_notification(
        admin_user_id,
        CASE
          WHEN new.status = 'confirmed'
            THEN 'booking.status_approved'::notification_type
          WHEN new.status = 'rejected'
            THEN 'booking.status_rejected'::notification_type
        END,
        '', '',                              -- titles/messages from UI
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
    END LOOP;
    
  END IF;
  
  RETURN new;
END;
$$;
