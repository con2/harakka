-- ============================================================
-- RLS TEST HARNESS
-- - Simulates authenticated users by setting request.jwt.claim.sub
-- - Runs SELECT / INSERT / UPDATE / DELETE against a target table
-- - Captures pass/fail and any error messages
-- - You only change the CONFIG in the "Usage" block
-- ============================================================

-- 1) Helper to run a statement "as user"
create or replace function app._run_as_user(
  p_user_id uuid,
  p_sql text
) returns table(ok bool, err text)
language plpgsql
as $$
begin
  -- Simulate "authenticated" + set JWT sub so auth.uid() works
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', coalesce(p_user_id::text, ''), true);

  begin
    execute p_sql;
    return query select true, null::text;
  exception when others then
    return query select false, sqlerrm;
  end;
end;
$$;

-- 2) Tiny formatter for consistent labels
create or replace function app._label(p text) returns text
language sql immutable as $$ select '['||p||']' $$;

-- 3) Build DML statements from JSONB columns -> values
--    Example: jsonb '{"name":"ACME","slug":"acme","is_active":true}'
--    becomes: (name,slug,is_active) VALUES ('ACME','acme',true)
create or replace function app._jsonb_to_cols_vals(p jsonb)
returns text
language sql
as $$
  with kv as (
    select key, value
    from jsonb_each(p)
  )
  select '('||string_agg(quote_ident(key), ', ')||') VALUES ('||
         string_agg(
           case
             when value ? 'f' then to_jsonb(value)::text -- keep bool/null/json
             when jsonb_typeof(value) = 'number' then (value::text)
             when jsonb_typeof(value) = 'boolean' then (value::text)
             when jsonb_typeof(value) = 'null' then 'NULL'
             else quote_literal(value::text::jsonb #>> '{}')
           end, ', '
         )||')'
  from kv;
$$;

-- 4) Main driver
create or replace function app.test_table_rls(
  p_table regclass,          -- table to test (e.g. 'public.organizations')
  p_pk_col text,             -- primary key column name (e.g. 'id')
  p_example_pk uuid,         -- an existing row's PK to test UPDATE/DELETE
  p_insert jsonb,            -- JSON for an INSERT row
  p_update jsonb,            -- JSON for an UPDATE set clause (only keys used)
  p_users uuid[]             -- users to test (auth.users.id values)
)
returns table(
  user_id uuid,
  op text,
  ok bool,
  err text
)
language plpgsql
as $$
declare
  v_insert_sql text;
  v_update_sql text;
  v_select_sql text;
  v_delete_sql text;
  v_set_sql   text;
  u uuid;
begin
  -- Build statements dynamically
  v_select_sql := format('select 1 from %s limit 1', p_table);

  v_insert_sql := format(
    'insert into %s %s',
    p_table,
    app._jsonb_to_cols_vals(p_insert)
  );

  -- Build UPDATE SET list from JSONB
  select string_agg(format('%I = %s', key,
           case
             when jsonb_typeof(value) = 'number'  then (value::text)
             when jsonb_typeof(value) = 'boolean' then (value::text)
             when jsonb_typeof(value) = 'null'    then 'NULL'
             else quote_literal(value::text::jsonb #>> '{}')
           end), ', ')
  into v_set_sql
  from jsonb_each(p_update);

  v_update_sql := format(
    'update %s set %s where %I = %L',
    p_table, coalesce(v_set_sql, '/* no-op */'), p_pk_col, p_example_pk
  );

  v_delete_sql := format(
    'delete from %s where %I = %L',
    p_table, p_pk_col, p_example_pk
  );

  -- Run for each user
  foreach u in array p_users loop
    -- SELECT
    return query
      select u, 'SELECT', r.ok, r.err
      from app._run_as_user(u, v_select_sql) r;

    -- INSERT
    return query
      select u, 'INSERT', r.ok, r.err
      from app._run_as_user(u, v_insert_sql) r;

    -- UPDATE
    return query
      select u, 'UPDATE', r.ok, r.err
      from app._run_as_user(u, v_update_sql) r;

    -- DELETE
    return query
      select u, 'DELETE', r.ok, r.err
      from app._run_as_user(u, v_delete_sql) r;
  end loop;
end;
$$;

-- ============================================================
-- USAGE EXAMPLES (EDIT ONLY THIS CONFIG PER TABLE)
-- ============================================================

-- Example A) storage_items table
-- Assumes you already inserted your fixed test users & some storage items.
-- Users from your test_users_guide.md:
--   super_admin@test.com      -> b8339c44-8410-49e0-8bb6-b74876120185
--   tenant_admin@test.com     -> b08ed477-8100-4ee8-8ff8-84e1bcba1550
--   storage_manager@test.com  -> 1e647a27-717f-4aee-a2da-f2c1737349c1
--   requester@test.com        -> 0efaafbf-29c4-48cd-8dc9-954dd924f553
--   user@test.com             -> 6e2686aa-7164-4a10-8852-177c56dd3d5f

-- Replace ONLY the values in the SELECT below when testing a different table.
-- For storage_items:
select *
from app.test_table_rls(
  p_table      => 'public.storage_items',
  p_pk_col     => 'id',
  p_example_pk => (select id from public.storage_items limit 1), -- get any existing storage item
  p_insert     => jsonb_build_object(
                    'name', 'Test Item '||to_char(now(), 'YYYYMMDDHH24MISS'),
                    'description', 'Inserted by RLS harness',
                    'org_id', '2a42d333-a550-493f-876e-a2cea3c80d26', -- org 1
                    'quantity', 1,
                    'unit', 'each',
                    'value', 100.00,
                    'is_active', true
                  ),
  p_update     => jsonb_build_object(
                    'description', 'Updated by RLS harness at '||now()::text
                  ),
  p_users      => array[
                    'b8339c44-8410-49e0-8bb6-b74876120185'::uuid, -- super admin (should only SELECT, no CUD)
                    'b08ed477-8100-4ee8-8ff8-84e1bcba1550'::uuid, -- tenant admin (can create any, update/delete own org)
                    '1e647a27-717f-4aee-a2da-f2c1737349c1'::uuid, -- storage manager (can create any, update/delete own org)
                    '0efaafbf-29c4-48cd-8dc9-954dd924f553'::uuid, -- requester (no CUD access)
                    '6e2686aa-7164-4a10-8852-177c56dd3d5f'::uuid  -- regular user (no CUD access)
                  ]
);

-- Example B) organization_locations table
-- Just change the CONFIG below for the table name, pk, and JSON data.
-- (Assumes your policies use organization_id checks)
-- select *
-- from app.test_table_rls(
--   p_table      => 'public.organization_locations',
--   p_pk_col     => 'id',
--   p_example_pk => '<an existing org_location id>',
--   p_insert     => jsonb_build_object(
--                     'organization_id','2a42d333-a550-493f-876e-a2cea3c80d26', -- org 1
--                     'location_id', '<some existing storage location uuid>',
--                     'is_active', true
--                   ),
--   p_update     => jsonb_build_object(
--                     'is_active', false
--                   ),
--   p_users      => array[
--                     'b8339c44-8410-49e0-8bb6-b74876120185'::uuid, -- super admin
--                     'b08ed477-8100-4ee8-8ff8-84e1bcba1550'::uuid, -- tenant admin
--                     '1e647a27-717f-4aee-a2da-f2c1737349c1'::uuid, -- storage manager
--                     '0efaafbf-29c4-48cd-8dc9-954dd924f553'::uuid, -- requester
--                     '6e2686aa-7164-4a10-8852-177c56dd3d5f'::uuid  -- user
--                   ]
-- );