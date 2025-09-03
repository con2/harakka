create table pippi2pippi (
  id serial primary key,
  name text not null,
  created_at timestamp with time zone default current_timestamp
);