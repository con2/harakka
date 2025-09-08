-- === Policy Helper Functions (schema-aligned, idempotent) ===

-- One tidy schema for helpers
create schema if not exists app;
grant usage on schema app to anon, authenticated;
alter schema app owner to postgres;

-- Who am I?
create or replace function app.me()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

-- Current user has a specific role in org? (enum-aware)
create or replace function app.me_has_role(p_org_id uuid, p_role public.roles_type)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.user_organization_roles
    join public.roles on public.roles.id = public.user_organization_roles.role_id
    where public.user_organization_roles.user_id = auth.uid()
      and public.user_organization_roles.organization_id = p_org_id
      and public.user_organization_roles.is_active = true
      and public.roles.role = p_role
  );
$$;

-- Current user has ANY of roles in org?
create or replace function app.me_has_any_role(p_org_id uuid, p_roles public.roles_type[])
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.user_organization_roles
    join public.roles on public.roles.id = public.user_organization_roles.role_id
    where public.user_organization_roles.user_id = auth.uid()
      and public.user_organization_roles.organization_id = p_org_id
      and public.user_organization_roles.is_active = true
      and public.roles.role = any (p_roles)
  );
$$;

-- Same but accept text[] and cast to enum (with explicit array handling)
create or replace function app.me_has_any_role_txt(p_org_id uuid, p_role_slugs text[])
returns boolean
language sql
stable
set search_path = public
as $$
  select app.me_has_any_role(
    p_org_id,
    (select array_agg(role_slug::public.roles_type) 
     from unnest(p_role_slugs::text[]) as role_slug)
  );
$$;

-- Check a specific user
create or replace function app.user_has_any_role(p_user_id uuid, p_org_id uuid, p_roles public.roles_type[])
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.user_organization_roles
    join public.roles on public.roles.id = public.user_organization_roles.role_id
    where public.user_organization_roles.user_id = p_user_id
      and public.user_organization_roles.organization_id = p_org_id
      and public.user_organization_roles.is_active = true
      and public.roles.role = any (p_roles)
  );
$$;

-- Is current user an active member of org (any role)?
create or replace function app.me_is_org_member(p_org_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.user_organization_roles
    where public.user_organization_roles.user_id = auth.uid()
      and public.user_organization_roles.organization_id = p_org_id
      and public.user_organization_roles.is_active = true
  );
$$;

-- Application/Super Admin (avoiding circular dependency with user_profiles RLS)
create or replace function app.me_is_super_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  with
  by_user_roles as (
    select exists (
      select 1 from public.user_roles
      where public.user_roles.profile_id = auth.uid()
        and public.user_roles.role = 'admin'::public.role_type
    )
  ),
  by_org_roles as (
    select exists (
      select 1
      from public.user_organization_roles
      join public.roles on public.roles.id = public.user_organization_roles.role_id
      where public.user_organization_roles.user_id = auth.uid()
        and public.user_organization_roles.is_active = true
        and public.roles.role in ('super_admin'::public.roles_type, 'admin'::public.roles_type, 'superVera'::public.roles_type)
    )
  )
  select (select * from by_user_roles)
      or (select * from by_org_roles);
$$;

-- Check if current user has a specific role in ANY organization  
create or replace function app.me_has_role_anywhere(p_role public.roles_type)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.user_organization_roles
    join public.roles on public.roles.id = public.user_organization_roles.role_id
    where public.user_organization_roles.user_id = auth.uid()
      and public.user_organization_roles.is_active = true
      and public.roles.role = p_role
  );
$$;

-- Generic helper for tables with an org column
create or replace function app.me_has_org_access(p_org_id uuid, p_allowed public.roles_type[])
returns boolean
language sql
stable
set search_path = public
as $$
  select app.me_is_super_admin()
      or app.me_has_any_role(p_org_id, p_allowed);
$$;

-- Convenience wrappers for your common columns
create or replace function app.can_manage_storage_item(p_org_id uuid)
returns boolean
language sql
stable
as $$
  select app.me_has_org_access(p_org_id, ARRAY['tenant_admin','storage_manager']::public.roles_type[]);
$$;

create or replace function app.can_manage_booking_item(p_provider_org_id uuid)
returns boolean
language sql
stable
as $$
  select app.me_has_org_access(p_provider_org_id, ARRAY['tenant_admin','storage_manager']::public.roles_type[]);
$$;

create or replace function app.can_manage_org_location(p_org_id uuid)
returns boolean
language sql
stable
as $$
  select app.me_has_org_access(p_org_id, ARRAY['tenant_admin','storage_manager']::public.roles_type[]);
$$;

-- Helpful indexes
create index if not exists idx_uor_user_org_active on public.user_organization_roles (user_id, organization_id) where is_active = true;
create index if not exists idx_roles_role on public.roles (role);