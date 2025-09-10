-- Ensure category_id column exists in storage_items table
-- This fixes deployment issues where the column might not exist

DO $$ 
BEGIN
    -- Check if categories table exists with correct schema
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
    ELSE
        -- Check if categories table has the wrong schema (name column instead of translations)
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'categories' 
            AND column_name = 'name'
        ) AND NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'categories' 
            AND column_name = 'translations'
        ) THEN
            -- Drop the old table and recreate with correct schema
            DROP TABLE IF EXISTS categories CASCADE;
            CREATE TABLE categories (
                id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
                parent_id uuid REFERENCES categories (id) ON DELETE SET NULL,
                translations jsonb NOT NULL,
                created_at timestamptz DEFAULT now() NOT NULL
            );
        END IF;
        
        -- Ensure translations column exists if table was created differently
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'categories' 
            AND column_name = 'translations'
        ) THEN
            ALTER TABLE categories ADD COLUMN translations jsonb NOT NULL DEFAULT '{}';
        END IF;
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
