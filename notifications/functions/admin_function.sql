-- ======================================================================
--  is_admin( p_user_id, p_org_id? ) → boolean
--  • returns TRUE if the user currently holds the “admin” role
--    – in *any* organisation when p_org_id is NULL
--    – in the specified organisation when p_org_id is NOT NULL
-- ======================================================================
create or replace function public.is_admin(
  p_user_id uuid,
  p_org_id  uuid default null        -- nullable on purpose
) returns boolean
language sql
stable                       -- result doesn’t change within the same statement
security definer             -- runs with table-owner privileges (triggers can call it)
set search_path = public
as $$
  select exists (
    select 1
    from public.user_organization_roles uor
    join public.roles r on r.id = uor.role_id
    where uor.user_id   = p_user_id
      and uor.is_active = true
      and r.role        = 'admin'           -- ⚠️ make sure the literal matches your roles_type enum
      and (p_org_id is null or uor.organization_id = p_org_id)
  );
$$;

-- Optional but handy:
-- make it easy for application code to call the function through RLS
grant execute on function public.is_admin(uuid, uuid) to authenticated;