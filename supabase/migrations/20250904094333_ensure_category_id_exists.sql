-- Ensure category_id column exists in storage_items table
-- This fixes deployment issues where the column might not exist

DO $$ 
BEGIN
    -- Check if categories table exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'categories'
    ) THEN
    
        -- Create categories table if it doesn't exist
        CREATE TABLE categories (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            parent_id uuid REFERENCES categories (id) ON DELETE SET NULL,
            translations jsonb NOT NULL,
            created_at timestamptz DEFAULT now() NOT NULL
        );
    END IF;

    -- Check if category_id column exists in storage_items
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'storage_items' 
        AND column_name = 'category_id'
    ) THEN
        -- Add category_id column if it doesn't exist
        ALTER TABLE storage_items
        ADD COLUMN category_id uuid REFERENCES categories(id);
    END IF;
END $$;
