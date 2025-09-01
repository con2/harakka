create table branches (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    location text not null,
    created_at timestamp with time zone default current_timestamp
);