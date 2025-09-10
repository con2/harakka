create or replace function get_category_descendants(category_uuid uuid)
returns table(id uuid)
language sql
stable
as $$
  with recursive category_tree as (
    select id
    from categories
    where id = category_uuid

    union all

    select c.id
    from categories c
    inner join category_tree ct on ct.id = c.parent_id
  )
  select id from category_tree;
$$;
