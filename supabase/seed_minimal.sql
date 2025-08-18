-- Essential seed data for local development
-- This contains only the minimum data needed for login and basic functionality

-- Insert default organization
INSERT INTO organizations (id, name, slug, description, is_active, created_by) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'Global', 'global', 'Default global organization', true, '123e4567-e89b-12d3-a456-426614174001')
ON CONFLICT (id) DO NOTHING;

-- Insert essential roles
INSERT INTO roles (id, name, description, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'Administrator role', true),
('550e8400-e29b-41d4-a716-446655440002', 'user', 'Regular user role', true),
('550e8400-e29b-41d4-a716-446655440003', 'main_admin', 'Main administrator role', true),
('550e8400-e29b-41d4-a716-446655440004', 'super_admin', 'Super administrator role', true),
('550e8400-e29b-41d4-a716-446655440005', 'storage_manager', 'Storage manager role', true),
('550e8400-e29b-41d4-a716-446655440006', 'requester', 'Requester role', true)
ON CONFLICT (id) DO NOTHING;

-- Insert a default storage location
INSERT INTO storage_locations (id, name, description, address, is_active) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Default Location', 'Default storage location for testing', '123 Test Street', true)
ON CONFLICT (id) DO NOTHING;

-- Insert some basic storage items for testing (without price!)
INSERT INTO storage_items (
    id, 
    translations, 
    items_number_total, 
    items_number_currently_in_storage, 
    location_id, 
    is_active, 
    org_id
) VALUES
(
    '7121df6a-7caf-4926-bd3c-f2619e492153',
    '{"fi": {"item_name": "Testituoli", "item_type": "Kaluste", "item_description": "Testikäyttöön tarkoitettu tuoli"}, "en": {"item_name": "Test Chair", "item_type": "Furniture", "item_description": "Chair for testing purposes"}}'::jsonb,
    10,
    10,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    true,
    '123e4567-e89b-12d3-a456-426614174000'
),
(
    '702f1207-82f5-412b-89e3-1a013776dec6',
    '{"fi": {"item_name": "Testipöytä", "item_type": "Kaluste", "item_description": "Testikäyttöön tarkoitettu pöytä"}, "en": {"item_name": "Test Table", "item_type": "Furniture", "item_description": "Table for testing purposes"}}'::jsonb,
    5,
    5,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    true,
    '123e4567-e89b-12d3-a456-426614174000'
)
ON CONFLICT (id) DO NOTHING;

-- Link organization items
INSERT INTO organization_items (
    storage_item_id,
    organization_id,
    storage_location_id,
    owned_quantity,
    is_active,
    created_by
) VALUES
(
    '7121df6a-7caf-4926-bd3c-f2619e492153',
    '123e4567-e89b-12d3-a456-426614174000',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    10,
    true,
    '123e4567-e89b-12d3-a456-426614174001'
),
(
    '702f1207-82f5-412b-89e3-1a013776dec6',
    '123e4567-e89b-12d3-a456-426614174000',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    5,
    true,
    '123e4567-e89b-12d3-a456-426614174001'
)
ON CONFLICT (storage_item_id, organization_id) DO NOTHING;
