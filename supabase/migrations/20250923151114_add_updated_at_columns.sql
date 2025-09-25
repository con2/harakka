alter table storage_items add updated_at timestamptz default null;

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
  s.updated_at
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

drop view view_tag_popularity;
create view public.view_tag_popularity as
with
  ranked_tags as (
    select
      t.id,
      (t.translations -> 'en'::text) ->> 'name'::text as tag_name,
      t.translations,
      t.created_at,
      t.updated_at,
      count(distinct sit.item_id) as assigned_to,
      count(bi.booking_id) as total_bookings,
      percent_rank() over (
        order by
          (count(bi.booking_id)) desc
      ) as rank_percentile
    from
      tags t
      left join storage_item_tags sit on t.id = sit.tag_id
      left join booking_items bi on sit.item_id = bi.item_id
    group by
      t.id,
      t.translations,
      t.created_at
  )
select
  ranked_tags.id,
  ranked_tags.tag_name,
  ranked_tags.translations,
  ranked_tags.created_at,
  ranked_tags.assigned_to,
  ranked_tags.total_bookings,
  ranked_tags.rank_percentile,
  case
    when ranked_tags.rank_percentile <= 0.05::double precision then 'very popular'::text
    when ranked_tags.rank_percentile <= 0.25::double precision then 'popular'::text
    else ''::text
  end as popularity_rank
from
  ranked_tags
order by
  ranked_tags.total_bookings desc;

CREATE TRIGGER update_storage_items_updated_at
BEFORE UPDATE ON public.storage_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
BEFORE UPDATE ON public.tags
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();