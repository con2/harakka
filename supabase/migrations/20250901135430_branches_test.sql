create table test_branches (
  id serial primary key,
  name text not null,
  created_at timestamp with time zone default current_timestamp
);

