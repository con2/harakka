-- Prevent old remote_schema pulls from re-creating these:
do $$
begin
  execute 'drop function if exists auth.custom_access_token2(jsonb)';
  execute 'drop function if exists auth.new_custom_access_token(jsonb)';
  execute 'drop function if exists auth.new_custom_access_token_v2(jsonb)';
  execute 'drop function if exists auth.new_custom_access_token_v3(jsonb)';
  execute 'drop function if exists auth.new_custom_access_token_v4(jsonb)';
  execute 'drop function if exists auth.test_hook(jsonb)';
exception when others then
  raise notice 'Skipping drop of legacy auth hooks: %', sqlerrm;
end$$;