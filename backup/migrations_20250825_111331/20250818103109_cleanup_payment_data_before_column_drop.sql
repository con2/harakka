-- Cleanup migration: Clear any existing payment/price data before dropping columns
-- This migration should run BEFORE the column drop migration to prevent data conflicts

-- WARNING: This migration will permanently delete payment and pricing data
-- Only run this if you're certain you want to remove all payment functionality

-- 1. Clear payment-related data from bookings table (if columns exist)
DO $$
BEGIN
    -- Clear payment_status column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'payment_status'
    ) THEN
        UPDATE bookings SET payment_status = NULL;
        RAISE NOTICE 'Cleared payment_status data from bookings table';
    END IF;
    
    -- Clear payment_details column if it exists  
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'payment_details'
    ) THEN
        UPDATE bookings SET payment_details = NULL;
        RAISE NOTICE 'Cleared payment_details data from bookings table';
    END IF;
END $$;

-- 2. Clear pricing data from booking_items table (if columns exist)
DO $$
BEGIN
    -- Clear unit_price column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'booking_items' 
        AND column_name = 'unit_price'
    ) THEN
        UPDATE booking_items SET unit_price = NULL;
        RAISE NOTICE 'Cleared unit_price data from booking_items table';
    END IF;
    
    -- Clear subtotal column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'booking_items' 
        AND column_name = 'subtotal'
    ) THEN
        UPDATE booking_items SET subtotal = NULL;
        RAISE NOTICE 'Cleared subtotal data from booking_items table';
    END IF;
END $$;

-- 3. Clear pricing data from storage_items table (if price column exists)
DO $$
BEGIN
    -- Clear price column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'storage_items' 
        AND column_name = 'price'
    ) THEN
        UPDATE storage_items SET price = NULL;
        RAISE NOTICE 'Cleared price data from storage_items table';
    END IF;
END $$;

-- 4. Delete all data from invoice and payment tables before dropping them
-- (This prevents foreign key constraint issues)

-- Clear invoices table data if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invoices') THEN
        DELETE FROM invoices;
        RAISE NOTICE 'Deleted all data from invoices table';
    END IF;
END $$;

-- Clear payments table data if it exists  
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
        DELETE FROM payments;
        RAISE NOTICE 'Deleted all data from payments table';
    END IF;
END $$;

-- 5. Update any calculated fields that might depend on pricing
-- Reset total_amount and final_amount in bookings to 0 since we're removing pricing
DO $$
BEGIN
    -- Only update if these columns exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name IN ('total_amount', 'final_amount')
    ) THEN
        UPDATE bookings SET 
            total_amount = 0,
            final_amount = 0
        WHERE total_amount IS NOT NULL OR final_amount IS NOT NULL;
        RAISE NOTICE 'Reset total_amount and final_amount to 0 in bookings table';
    END IF;
END $$;

-- 6. Log the cleanup completion
DO $$
BEGIN
    RAISE NOTICE 'Payment and pricing data cleanup completed successfully';
    RAISE NOTICE 'All payment_status, payment_details, unit_price, subtotal, and price data has been cleared';
    RAISE NOTICE 'Invoice and payment tables have been emptied';
    RAISE NOTICE 'Ready for column drop migration';
END $$;
