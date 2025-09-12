-- Add missing enum values to booking_status
-- The TypeScript types expect these values but they're missing from the database

-- Add 'picked_up' to booking_status enum
ALTER TYPE public.booking_status ADD VALUE 'picked_up';

-- Add 'returned' to booking_status enum  
ALTER TYPE public.booking_status ADD VALUE 'returned';

-- Add 'completed' to booking_status enum
ALTER TYPE public.booking_status ADD VALUE 'completed';