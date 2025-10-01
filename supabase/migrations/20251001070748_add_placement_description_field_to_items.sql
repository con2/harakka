
ALTER TABLE storage_items 
ADD placement_description text NOT NULL DEFAULT 'N/A';

drop view view_manage_storage_items;
create view public.view_manage_storage_items as
select
  (s.translations -> 'fi'::text) ->> 'item_name'::text as fi_item_name,
  (s.translations -> 'fi'::text) ->> 'item_type'::text as fi_item_type,
  (s.translations -> 'en'::text) ->> 'item_name'::text as en_item_name,
  (s.translations -> 'en'::text) ->> 'item_type'::text as en_item_type,
  s.translations,
  s.id,
  s.quantity,
  s.created_at,
  s.is_active,
  s.location_id,
  l.name as location_name,
  array_agg(distinct t.tag_id) as tag_ids,
  array_agg(distinct g.translations) as tag_translations,
  s.available_quantity,
  s.is_deleted,
  s.org_id as organization_id,
  s.category_id,
  c.translations ->> 'en'::text as category_en_name,
  c.translations ->> 'fi'::text as category_fi_name,
  s.updated_at,
  s.placement_description
from
  storage_items s
  join storage_locations l on s.location_id = l.id
  left join storage_item_tags t on s.id = t.item_id
  left join tags g on t.tag_id = g.id
  left join categories c on c.id = s.category_id
group by
  s.id,
  s.translations,
  s.quantity,
  s.created_at,
  s.is_active,
  s.location_id,
  l.name,
  s.available_quantity,
  s.is_deleted,
  s.org_id,
  c.translations;