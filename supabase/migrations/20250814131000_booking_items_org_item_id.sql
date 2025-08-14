-- All sql ran in SQL editor instead of reseting the db
begin;

-- 1) Add column + FK + index (idempotent)
alter table public.booking_items add column if not exists org_item_id uuid;
alter table public.booking_items
  add constraint booking_items_org_item_id_fkey
  foreign key (org_item_id) references public.organization_items (id);
create index if not exists idx_booking_items_org_item_id
  on public.booking_items (org_item_id);

-- 2) Temporarily disable only *user* triggers on booking_items
alter table public.booking_items disable trigger user;

-- 3) Backfill (unambiguous only)
with candidates as (
  select
    bi.id as booking_item_id,
    array_agg(oi.id order by oi.id) filter (
      where oi.storage_item_id = bi.item_id
        and oi.storage_location_id = bi.location_id
        and oi.is_active
    ) as oi_ids
  from public.booking_items bi
  left join public.organization_items oi
    on oi.storage_item_id = bi.item_id
   and oi.storage_location_id = bi.location_id
  where bi.org_item_id is null
  group by bi.id
),
unambiguous as (
  select booking_item_id, (oi_ids)[1] as org_item_id
  from candidates
  where array_length(oi_ids, 1) = 1
)
update public.booking_items bi
set org_item_id = u.org_item_id
from unambiguous u
where bi.id = u.booking_item_id;

-- 4) Re‑enable triggers
alter table public.booking_items enable trigger user;

commit;

-- 3) (Later) Make it NOT NULL once you’ve cleaned all remaining NULLs
-- select count(*) from public.booking_items where org_item_id is null; -- expect 0 before enabling
-- alter table public.booking_items alter column org_item_id set not null;

-- 4) Denorm trigger: keep legacy cols in sync for old queries/reports
create or replace function public.trg_booking_items_sync_denorm()
returns trigger language plpgsql as $$
begin
  -- If org_item_id is set, denormalize the related fields for legacy code/queries
  if new.org_item_id is not null then
    select storage_item_id, storage_location_id, organization_id
      into strict new.item_id, new.location_id, new.provider_organization_id
    from public.organization_items
    where id = new.org_item_id;
  end if;
  return new;
end $$;

drop trigger if exists booking_items_sync_denorm on public.booking_items;
create trigger booking_items_sync_denorm
before insert or update of org_item_id on public.booking_items
for each row execute function public.trg_booking_items_sync_denorm();

-- 5) Guard trigger: require org_item_id on all NEW/UPDATED rows (keeps legacy rows as-is)
create or replace function public.trg_booking_items_require_org_item_id()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT' and new.org_item_id is null) then
    raise exception 'org_item_id is required on new booking_items rows';
  end if;
  if (tg_op = 'UPDATE' and new.org_item_id is null) then
    raise exception 'org_item_id cannot be cleared';
  end if;
  return new;
end $$;

drop trigger if exists booking_items_require_org_item_id on public.booking_items;
create trigger booking_items_require_org_item_id
before insert or update on public.booking_items
for each row execute function public.trg_booking_items_require_org_item_id();

-- 6) (Optional) Quick reports to help you decide when to flip NOT NULL (leave commented)
-- -- Remaining NULLs (investigate or delete if they’re only dev data)
-- select
--   bi.id as booking_item_id,
--   bi.item_id,
--   bi.location_id,
--   count(oi.id) as matching_org_items
-- from public.booking_items bi
-- left join public.organization_items oi
--   on oi.storage_item_id = bi.item_id
--  and oi.storage_location_id = bi.location_id
-- where bi.org_item_id is null
-- group by bi.id, bi.item_id, bi.location_id
-- order by matching_org_items desc;


-- How many booking_items still have NULL org_item_id?
select count(*) from public.booking_items where org_item_id is null;

-- Spot any rows that matched multiple owners (for later manual fix)
select bi.id, bi.item_id, bi.location_id, count(oi.id) as owners
from public.booking_items bi
left join public.organization_items oi
  on oi.storage_item_id = bi.item_id
 and oi.storage_location_id = bi.location_id
where bi.org_item_id is null
group by bi.id, bi.item_id, bi.location_id
order by owners desc;