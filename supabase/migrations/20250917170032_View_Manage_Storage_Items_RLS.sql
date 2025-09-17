drop view if exists public.view_manage_storage_items;
-- Nothing changed in the view definition; just resetting security_invoker
create view public.view_manage_storage_items with (security_invoker = on) as
 SELECT (s.translations -> 'fi'::text) ->> 'item_name'::text AS fi_item_name,
    (s.translations -> 'fi'::text) ->> 'item_type'::text AS fi_item_type,
    (s.translations -> 'en'::text) ->> 'item_name'::text AS en_item_name,
    (s.translations -> 'en'::text) ->> 'item_type'::text AS en_item_type,
    s.translations,
    s.id,
    s.quantity,
    s.created_at,
    s.is_active,
    s.location_id,
    l.name AS location_name,
    array_agg(DISTINCT t.tag_id) AS tag_ids,
    array_agg(DISTINCT g.translations) AS tag_translations,
    s.available_quantity,
    s.is_deleted,
    s.org_id AS organization_id,
    s.category_id,
    c.translations ->> 'en'::text AS category_en_name,
    c.translations ->> 'fi'::text AS category_fi_name
   FROM storage_items s
     JOIN storage_locations l ON s.location_id = l.id
     LEFT JOIN storage_item_tags t ON s.id = t.item_id
     LEFT JOIN tags g ON t.tag_id = g.id
     LEFT JOIN categories c ON c.id = s.category_id
  GROUP BY s.id, s.translations, s.quantity, s.created_at, s.is_active, s.location_id, l.name, s.available_quantity, s.is_deleted, s.org_id, c.translations;