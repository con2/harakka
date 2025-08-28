-- Delete all current null rows
delete from public.booking_items where provider_organization_id is null;

-- Update booking_items
-- Do not allow null values for provider_organization_id
alter table booking_items
  alter column provider_organization_id set not null;