-- 20250827120000_create_workflow_test_table.sql
-- A simple test table to validate workflow execution

create table if not exists workflow_test (
  id serial primary key,
  name text not null default 'test',
  created_at timestamp with time zone not null default now()
);

comment on table workflow_test is 'Used for validating CI/CD and migrations workflow';

