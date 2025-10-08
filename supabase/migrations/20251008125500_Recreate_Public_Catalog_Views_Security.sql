-- Recreate catalog views with security_invoker so base-table RLS applies.

drop view if exists public.view_manage_storage_items;

create view public.view_manage_storage_items
with (security_invoker = on, security_barrier = on) as
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
from public.storage_items s
join public.storage_locations l on s.location_id = l.id
left join public.storage_item_tags t on s.id = t.item_id
left join public.tags g on t.tag_id = g.id
left join public.categories c on c.id = s.category_id
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
  c.translations,
  s.updated_at,
  s.placement_description;

comment on view public.view_manage_storage_items is
'Catalog view for storage items. Runs with caller privileges (security_invoker=on) so storage_items RLS limits results per organization.';

drop view if exists public.view_tag_popularity;

create view public.view_tag_popularity with (security_invoker = on) as
 WITH ranked_tags AS (
         SELECT t.id,
            (t.translations -> 'en'::text) ->> 'name'::text AS tag_name,
            t.translations,
            t.created_at,
            t.updated_at,
            count(DISTINCT sit.item_id) AS assigned_to,
            count(bi.booking_id) AS total_bookings,
            percent_rank() OVER (ORDER BY (count(bi.booking_id)) DESC) AS rank_percentile
           FROM tags t
             LEFT JOIN storage_item_tags sit ON t.id = sit.tag_id
             LEFT JOIN booking_items bi ON sit.item_id = bi.item_id
          GROUP BY t.id, t.translations, t.created_at
        )
 SELECT ranked_tags.id,
    ranked_tags.tag_name,
    ranked_tags.translations,
    ranked_tags.created_at,
    ranked_tags.assigned_to,
    ranked_tags.total_bookings,
    ranked_tags.rank_percentile,
        CASE
            WHEN ranked_tags.rank_percentile <= 0.05::double precision THEN 'very popular'::text
            WHEN ranked_tags.rank_percentile <= 0.25::double precision THEN 'popular'::text
            ELSE ''::text
        END AS popularity_rank
   FROM ranked_tags
  ORDER BY ranked_tags.total_bookings DESC;

comment on view public.view_tag_popularity is
'Tag usage statistics. Runs with caller privileges so base-table RLS applies.';
