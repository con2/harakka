alter table categories
add column updated_at timestamptz default null;
alter table tags
add column updated_at timestamptz default null;