create function public.test_branch()
returns void as $$
begin
  raise notice 'This is a test function for branching';
end;
$$ language plpgsql;