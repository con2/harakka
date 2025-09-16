-- Fix categories table schema by ensuring it has the correct structure
-- This migration will recreate the categories table if needed to ensure proper schema

-- First create the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $trigger$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$trigger$ language 'plpgsql';

-- Now handle the categories table
DO $main$
DECLARE
    has_translations_column boolean;
    has_name_column boolean;
    has_sort_order_column boolean;
    table_exists boolean;
BEGIN
    -- Check if categories table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'categories'
    ) INTO table_exists;
    
    RAISE NOTICE 'Categories table exists: %', table_exists;
    
    IF table_exists THEN
        -- Check if translations column exists
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'categories' 
            AND column_name = 'translations'
        ) INTO has_translations_column;
        
        -- Check if old name column exists
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'categories' 
            AND column_name = 'name'
        ) INTO has_name_column;
        
        -- Check if sort_order column exists
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'categories' 
            AND column_name = 'sort_order'
        ) INTO has_sort_order_column;
        
        RAISE NOTICE 'Has translations column: %', has_translations_column;
        RAISE NOTICE 'Has name column: %', has_name_column;
        RAISE NOTICE 'Has sort_order column: %', has_sort_order_column;
        
        -- If we have name but not translations, we need to migrate the data
        IF has_name_column AND NOT has_translations_column THEN
            RAISE NOTICE 'Migrating from name column to translations column';
            
            -- Add translations column
            ALTER TABLE categories ADD COLUMN translations jsonb DEFAULT '{}';
            
            -- Migrate existing data from name to translations
            UPDATE categories 
            SET translations = jsonb_build_object('en', name, 'sv', name)
            WHERE name IS NOT NULL;
            
            -- Drop the old name column
            ALTER TABLE categories DROP COLUMN IF EXISTS name;
            
            -- Make translations column NOT NULL
            ALTER TABLE categories ALTER COLUMN translations SET NOT NULL;
            
        ELSIF NOT has_translations_column THEN
            RAISE NOTICE 'Adding translations column to existing table';
            
            -- Just add translations column if it doesn't exist
            ALTER TABLE categories ADD COLUMN translations jsonb NOT NULL DEFAULT '{}';
        END IF;
        
        -- Add sort_order if it doesn't exist
        IF NOT has_sort_order_column THEN
            RAISE NOTICE 'Adding sort_order column';
            ALTER TABLE categories ADD COLUMN sort_order integer DEFAULT 0;
        END IF;
        
        -- Add other missing columns
        ALTER TABLE categories ADD COLUMN IF NOT EXISTS description text;
        ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon text;
        ALTER TABLE categories ADD COLUMN IF NOT EXISTS color text;
        
    ELSE
        RAISE NOTICE 'Creating categories table from scratch';
        
        -- Create the table with proper schema
        CREATE TABLE categories (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            translations jsonb NOT NULL DEFAULT '{}'::jsonb,
            description text,
            icon text,
            color text,
            sort_order integer DEFAULT 0
        );
        
        -- Enable RLS
        ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Categories are viewable by everyone" ON categories
            FOR SELECT USING (true);
            
        CREATE POLICY "Categories are editable by admins" ON categories
            FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
    END IF;
    
    -- Ensure we have proper indexes
    CREATE INDEX IF NOT EXISTS idx_categories_translations ON categories USING GIN (translations);
    
    -- Only create sort_order index if column exists
    IF has_sort_order_column OR NOT table_exists THEN
        CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories (sort_order);
    END IF;
    
    -- Update the trigger
    DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
    CREATE TRIGGER update_categories_updated_at
        BEFORE UPDATE ON categories
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
        
    RAISE NOTICE 'Categories table schema fix completed successfully';
END $main$;

