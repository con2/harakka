-- Create a view that combines bookings with their booking_items and storage_items details and(got rid of the join so we can use the generated types with the view)
CREATE OR REPLACE VIEW view_bookings_with_details AS
SELECT 
  -- Booking columns
  b.id,
  b.booking_number,
  b.user_id,
  b.status,
  b.notes,
  b.created_at,
  b.updated_at,
  
  -- Aggregated booking_items as JSONB
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', bi.id,
        'status', bi.status,
        'item_id', bi.item_id,
        'end_date', bi.end_date,
        'quantity', bi.quantity,
        'booking_id', bi.booking_id,
        'created_at', bi.created_at,
        'start_date', bi.start_date,
        'total_days', bi.total_days,
        'location_id', bi.location_id,
        'provider_organization_id', bi.provider_organization_id,
        'storage_items', jsonb_build_object(
          'translations', si.translations
        )
      )
    ) FILTER (WHERE bi.id IS NOT NULL),
    '[]'::jsonb
  ) as booking_items

FROM bookings b
LEFT JOIN booking_items bi ON b.id = bi.booking_id
LEFT JOIN storage_items si ON bi.item_id = si.id
GROUP BY b.id, b.booking_number, b.user_id, b.status, b.notes, b.created_at, b.updated_at
ORDER BY b.created_at DESC;
