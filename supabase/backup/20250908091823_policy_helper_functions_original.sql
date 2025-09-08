-- Create a dedicated schema for helpers (optional but tidy)
create schema if not exists app;

-- For safety in SECURITY DEFINER functions
grant usage on schema app to anon, authenticated;
alter schema app owner to postgres;

-- 🔧 Core: does *this* user (auth.uid) have a role in this org?
create or replace function app.me_has_role(p_org_id uuid, p_role_slug text)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from user_organization_roles uor
    join roles r on r.id = uor.role_id
    where uor.user_id = auth.uid()
      and uor.organization_id = p_org_id
      and r.slug = p_role_slug
      and coalesce(uor.is_active, true)
      and uor.deleted_at is null
  );
$$;

-- 🔧 Core (any of a set): does *this* user have ANY of these roles in this org?
create or replace function app.me_has_any_role(p_org_id uuid, p_role_slugs text[])
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from user_organization_roles uor
    join roles r on r.id = uor.role_id
    where uor.user_id = auth.uid()
      and uor.organization_id = p_org_id
      and r.slug = any (p_role_slugs)
      and coalesce(uor.is_active, true)
      and uor.deleted_at is null
  );
$$;

-- 🔧 Variant: check an arbitrary user (handy in admin tools or triggers)
create or replace function app.user_has_any_role(p_user_id uuid, p_org_id uuid, p_role_slugs text[])
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from user_organization_roles uor
    join roles r on r.id = uor.role_id
    where uor.user_id = p_user_id
      and uor.organization_id = p_org_id
      and r.slug = any (p_role_slugs)
      and coalesce(uor.is_active, true)
      and uor.deleted_at is null
  );
$$;

-- 🔧 Convenience: “super admin” (application-wide), adapt to your source of truth.
-- Option A: special global role stored with organization_id IS NULL in user_organization_roles
create or replace function app.me_is_super_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from user_organization_roles uor
    join roles r on r.id = uor.role_id
    where uor.user_id = auth.uid()
      and uor.organization_id is null
      and r.slug = 'super_admin'
      and coalesce(uor.is_active, true)
      and uor.deleted_at is null
  );
$$;

-- If instead you keep a boolean in user_profiles (is_app_admin), swap to:
-- create or replace function app.me_is_super_admin()
-- returns boolean language sql stable set search_path=public as $$
--   select coalesce(up.is_app_admin, false)
--   from user_profiles up
--   where up.id = auth.uid();
-- $$;

-- 🔧 Generic helper for rows that carry an org column (pass the column value)
-- Example use in USING/WITH CHECK: app.me_has_org_access(organization_id, '{tenant_admin,storage_manager}')
create or replace function app.me_has_org_access(p_org_id uuid, p_allowed_role_slugs text[])
returns boolean
language sql
stable
set search_path = public
as $$
  select app.me_is_super_admin()
         or app.me_has_any_role(p_org_id, p_allowed_role_slugs);
$$;

-- (Optional) JWT acceleration: if your JWT contains an array claim of org_ids
-- and/or roles by org, you can add fast-path checks here. Keep the database
-- lookups as a safe fallback.
-- Example claim shape (customize as you wish):
--   org_ids: uuid[]
--   roles_by_org: { "<org-uuid>": ["tenant_admin","storage_manager"] }
create or replace function app.me_has_any_role_jwt_first(p_org_id uuid, p_role_slugs text[])
returns boolean
language plpgsql
stable
set search_path = public
as $$
declare
  jwt jsonb := try_cast(current_setting('request.jwt.claims', true) as jsonb);
  roles jsonb;
begin
  -- If roles_by_org exists and contains p_org_id with any intersecting role, short-circuit true
  if jwt ? 'roles_by_org' then
    roles := jwt->'roles_by_org'->to_char(p_org_id::uuid, 'FM99999999'); -- force key as text
    -- Fallback: many teams store keys as the uuid::text; if your format differs, adjust.
    if roles is null then
      roles := (jwt->'roles_by_org')->(p_org_id::text);
    end if;
    if roles is not null and exists (
      select 1
      where array_length(p_role_slugs, 1) is not null
        and array(
              select jsonb_array_elements_text(roles)
            ) && p_role_slugs
    ) then
      return true;
    end if;
  end if;

  -- Fallback to DB lookup
  return app.me_has_any_role(p_org_id, p_role_slugs);
end;
$$;

-- ⚡ Helpful indexes (if you don’t already have them)
create index if not exists idx_uor_user_org on user_organization_roles (user_id, organization_id);
create index if not exists idx_roles_slug on roles (slug);
-- === Helper functions tailored to CURRENT schema ===
-- Schema facts this file assumes (from /remote_schema.sql):
--   roles(id uuid, role public.roles_type)
--   user_organization_roles(id uuid, user_id uuid, organization_id uuid, role_id uuid, is_active bool, ... )
--   user_profiles(id uuid, role text)           -- legacy
--   user_roles(profile_id uuid, role public.role_type) -- legacy alt
-- Notes:
--   • We use the enum `public.roles_type` from `roles.role`.
--   • No `deleted_at` column in user_organization_roles.
--   • Organization-specific roles only (organization_id is NOT NULL).
--   • We keep functions STABLE and rely on auth.uid().

create schema if not exists app;
grant usage on schema app to anon, authenticated;
alter schema app owner to postgres;

-- Small helper to coalesce current user id via JWT
create or replace function app.me()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

-- 🔹 Core: does current user have a specific role in an org? (enum-friendly)
create or replace function app.me_has_role(p_org_id uuid, p_role public.roles_type)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from user_organization_roles uor
    join roles r on r.id = uor.role_id
    where uor.user_id = auth.uid()
      and uor.organization_id = p_org_id
      and uor.is_active = true
      and r.role = p_role
  );
$$;

-- 🔹 Any-of: does current user have ANY of these roles in the org? (enum array)
create or replace function app.me_has_any_role(p_org_id uuid, p_roles public.roles_type[])
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from user_organization_roles uor
    join roles r on r.id = uor.role_id
    where uor.user_id = auth.uid()
      and uor.organization_id = p_org_id
      and uor.is_active = true
      and r.role = any (p_roles)
  );
$$;

-- 🔹 Text convenience wrapper (casts text[] to enum)
create or replace function app.me_has_any_role_txt(p_org_id uuid, p_role_slugs text[])
returns boolean
language sql
stable
set search_path = public
as $$
  select app.me_has_any_role(
    p_org_id,
    array(
      select unnest(p_role_slugs)::public.roles_type
    )
  );
$$;

-- 🔹 Arbitrary user variant
create or replace function app.user_has_any_role(p_user_id uuid, p_org_id uuid, p_roles public.roles_type[])
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from user_organization_roles uor
    join roles r on r.id = uor.role_id
    where uor.user_id = p_user_id
      and uor.organization_id = p_org_id
      and uor.is_active = true
      and r.role = any (p_roles)
  );
$$;

-- 🔹 Org membership check (any active role)
create or replace function app.me_is_org_member(p_org_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from user_organization_roles uor
    where uor.user_id = auth.uid()
      and uor.organization_id = p_org_id
      and uor.is_active = true
  );
$$;

-- 🔹 Application/Super Admin
-- Two sources of truth are supported:
--   1) Legacy: user_profiles.role = 'admin' (text)
--   2) Org-agnostic assignment via user_roles (role_type) OR presence of ANY 'admin' role in any org
-- Adjust to your final model later; this is a tolerant union.
create or replace function app.me_is_super_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  with
  by_profile as (
    select coalesce( (select lower(up.role) = 'admin' from user_profiles up where up.id = auth.uid()), false )
  ),
  by_user_roles as (
    select exists (
      select 1 from user_roles ur
      where ur.profile_id = auth.uid()
        and ur.role = 'admin'::public.role_type
    )
  ),
  by_org_roles as (
    select exists (
      select 1
      from user_organization_roles uor
      join roles r on r.id = uor.role_id
      where uor.user_id = auth.uid()
        and uor.is_active = true
        and r.role = 'admin'::public.roles_type
    )
  )
  select (select * from by_profile)
      or (select * from by_user_roles)
      or (select * from by_org_roles);
$$;

-- 🔹 Generic helper for tables that store an org column (organization_id, org_id, provider_organization_id, ...)
-- Example in policy: USING ( app.me_has_org_access(organization_id, ARRAY['tenant_admin','storage_manager']::public.roles_type[]) )
create or replace function app.me_has_org_access(p_org_id uuid, p_allowed public.roles_type[])
returns boolean
language sql
stable
set search_path = public
as $$
  select app.me_is_super_admin()
      or app.me_has_any_role(p_org_id, p_allowed);
$$;

-- 🔹 Convenience wrappers for common tables/columns you use a lot
-- storage_items.org_id
create or replace function app.can_manage_storage_item(p_org_id uuid)
returns boolean
language sql
stable
as $$
  select app.me_has_org_access(p_org_id, ARRAY['tenant_admin','storage_manager']::public.roles_type[]);
$$;

-- booking_items.provider_organization_id
create or replace function app.can_manage_booking_item(p_provider_org_id uuid)
returns boolean
language sql
stable
as $$
  select app.me_has_org_access(p_provider_org_id, ARRAY['tenant_admin','storage_manager']::public.roles_type[]);
$$;

-- organization_locations.organization_id
create or replace function app.can_manage_org_location(p_org_id uuid)
returns boolean
language sql
stable
as $$
  select app.me_has_org_access(p_org_id, ARRAY['tenant_admin','storage_manager']::public.roles_type[]);
$$;

-- 🔹 Helpful indexes (idempotent)
create index if not exists idx_uor_user_org_active on public.user_organization_roles (user_id, organization_id) where is_active = true;
create index if not exists idx_roles_role on public.roles (role);