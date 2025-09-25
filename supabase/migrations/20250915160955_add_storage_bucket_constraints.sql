-- Ensure columns exist on storage.buckets (older storage versions may miss these)
alter table if exists storage.buckets
  add column if not exists file_size_limit bigint,
  add column if not exists allowed_mime_types text[];

-- Update constraints for organization-logo-picture bucket
UPDATE storage.buckets
SET file_size_limit = 5242880, -- 5MB in bytes
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE name = 'organization-logo-picture';

-- Update constraints for profile-pictures bucket
UPDATE storage.buckets
SET file_size_limit = 5242880, -- 5MB in bytes
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE name = 'profile-pictures';

-- Update constraints for item-images bucket
UPDATE storage.buckets
SET file_size_limit = 5242880, -- 5MB in bytes
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE name = 'item-images';
