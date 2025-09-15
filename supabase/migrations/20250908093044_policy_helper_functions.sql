-- ===========================================================================
-- SECTION: Policy Helper Functions (schema-aligned, idempotent)
-- Purpose:
--   Reusable helpers for role & organization checks used across RLS policies.
--   Functions are STABLE and rely on auth.uid() for the current user.
--   Tables/enums assumed:
--     • public.user_organization_roles(user_id, organization_id, role_id, is_active)
--     • public.roles(id, role public.roles_type)
--     • public.user_roles(profile_id, role public.role_type)           -- legacy/global
--     • public.user_profiles(id uuid, role text)                       -- legacy/global
-- References:
--   • PostgreSQL COMMENT docs: https://www.postgresql.org/docs/current/sql-comment.html
-- ===========================================================================

create schema if not exists app;
grant usage on schema app to anon, authenticated;
alter schema app owner to postgres;

-- ---------------------------------------------------------------------------
/*
 * @function app.me
 * @summary Returns the current authenticated user's UUID via auth.uid().
 * @returns {uuid} The caller's user id.
 */
create or replace function app.me()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

comment on function app.me() is
'Returns the current authenticated user''s UUID (auth.uid()).';

-- ---------------------------------------------------------------------------
/*
 * @function app.me_has_role
 * @summary Check if the current user has a specific role in a given organization.
 * @param {uuid} p_org_id - Organization id to check.
 * @param {public.roles_type} p_role - Role (enum) to check for.
 * @returns {boolean} True if user holds the role in the org and is active.
 */
create or replace function app.me_has_role(
  p_org_id uuid,
  p_role public.roles_type
)
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

comment on function app.me_has_role(uuid, public.roles_type) is
'True if current user has the specified role in the given organization.';

-- ---------------------------------------------------------------------------
/*
 * @function app.me_has_any_role
 * @summary Check if the current user has ANY of the provided roles in an org.
 * @param {uuid} p_org_id - Organization id to check.
 * @param {public.roles_type[]} p_roles - Array of roles (enum) to check.
 * @returns {boolean} True if any role matches.
 */
create or replace function app.me_has_any_role(
  p_org_id uuid,
  p_roles public.roles_type[]
)
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

comment on function app.me_has_any_role(uuid, public.roles_type[]) is
'True if current user has at least one of the provided roles in the organization.';

-- ---------------------------------------------------------------------------
/*
 * @function app.me_has_any_role_txt
 * @summary Text convenience wrapper: casts text[] into roles_type[] then delegates.
 * @param {uuid} p_org_id - Organization id to check.
 * @param {text[]} p_role_slugs - Array of role names as text.
 * @returns {boolean} True if any role matches after cast.
 */
create or replace function app.me_has_any_role_txt(
  p_org_id uuid,
  p_role_slugs text[]
)
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

comment on function app.me_has_any_role_txt(uuid, text[]) is
'Text wrapper for me_has_any_role: casts text[] to public.roles_type[].';

-- ---------------------------------------------------------------------------
/*
 * @function app.user_has_any_role
 * @summary Check if an arbitrary user has ANY of the provided roles in an org.
 * @param {uuid} p_user_id - User to check.
 * @param {uuid} p_org_id  - Organization id to check.
 * @param {public.roles_type[]} p_roles - Array of roles (enum) to check.
 * @returns {boolean} True if any role matches.
 */
create or replace function app.user_has_any_role(
  p_user_id uuid,
  p_org_id uuid,
  p_roles public.roles_type[]
)
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

comment on function app.user_has_any_role(uuid, uuid, public.roles_type[]) is
'True if the specified user has any of the given roles in the organization.';

-- ---------------------------------------------------------------------------
/*
 * @function app.me_is_org_member
 * @summary Check if the current user is an active member of the organization (any role).
 * @param {uuid} p_org_id - Organization id to check.
 * @returns {boolean} True if the user has any active role in the org.
 */
create or replace function app.me_is_org_member(
  p_org_id uuid
)
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

comment on function app.me_is_org_member(uuid) is
'True if current user has any active role in the given organization.';

-- ---------------------------------------------------------------------------
/*
 * @function app.me_is_super_admin
 * @summary Application-level super admin detection (union of supported sources).
 * @details
 *   Returns true if ANY of these are true:
 *     • public.user_roles has role = ''admin'' for auth.uid()            (legacy/global)
 *     • public.user_organization_roles joins to public.roles.role in {super_admin, admin, superVera} and is_active
 *   Adjust the accepted enum values once the final super-admin model is fixed.
 * @returns {boolean}
 */
create or replace function app.me_is_super_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  with
  by_user_roles as (
    select exists (
      select 1
      from public.user_roles
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
        and public.roles.role in (
          'super_admin'::public.roles_type,
          'admin'::public.roles_type,
          'superVera'::public.roles_type
        )
    )
  )
  select (select * from by_user_roles)
      or (select * from by_org_roles);
$$;

comment on function app.me_is_super_admin() is
'Application-level super admin check via user_roles (admin) or any org role in {super_admin, admin, superVera}.';

-- ---------------------------------------------------------------------------
/*
 * @function app.me_has_role_anywhere
 * @summary Check if current user has the specified role in ANY organization.
 * @param {public.roles_type} p_role - Role (enum) to check for.
 * @returns {boolean} True if the user has that role in at least one org.
 */
create or replace function app.me_has_role_anywhere(
  p_role public.roles_type
)
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

comment on function app.me_has_role_anywhere(public.roles_type) is
'True if current user has the given role in any organization.';

-- ---------------------------------------------------------------------------
/*
 * @function app.me_has_org_access
 * @summary Generic check for org-scoped access: super_admin OR any of allowed roles in the org.
 * @param {uuid} p_org_id - Organization id to check.
 * @param {public.roles_type[]} p_allowed - Roles that grant access.
 * @returns {boolean}
 */
create or replace function app.me_has_org_access(
  p_org_id uuid,
  p_allowed public.roles_type[]
)
returns boolean
language sql
stable
set search_path = public
as $$
  select app.me_is_super_admin()
         or app.me_has_any_role(p_org_id, p_allowed);
$$;

comment on function app.me_has_org_access(uuid, public.roles_type[]) is
'True if current user is super_admin or has any allowed role in the organization.';

-- ---------------------------------------------------------------------------
/*
 * @function app.can_manage_storage_item
 * @summary Convenience wrapper for tables with org_id column (storage context).
 * @param {uuid} p_org_id - Organization id that owns the storage item.
 * @returns {boolean}
 */
create or replace function app.can_manage_storage_item(
  p_org_id uuid
)
returns boolean
language sql
stable
as $$
  select app.me_has_org_access(
    p_org_id,
    array['tenant_admin','storage_manager']::public.roles_type[]
  );
$$;

comment on function app.can_manage_storage_item(uuid) is
'True if user is super_admin or has {tenant_admin, storage_manager} for the storage item''s org.';

-- ---------------------------------------------------------------------------
/*
 * @function app.can_manage_booking_item
 * @summary Convenience wrapper for tables with provider_organization_id column (booking context).
 * @param {uuid} p_provider_org_id - Provider organization id tied to booking_items.
 * @returns {boolean}
 */
create or replace function app.can_manage_booking_item(
  p_provider_org_id uuid
)
returns boolean
language sql
stable
as $$
  select app.me_has_org_access(
    p_provider_org_id,
    array['tenant_admin','storage_manager']::public.roles_type[]
  );
$$;

comment on function app.can_manage_booking_item(uuid) is
'True if user is super_admin or has {tenant_admin, storage_manager} in the provider org for the booking item.';

-- ---------------------------------------------------------------------------
/*
 * @function app.can_manage_org_location
 * @summary Convenience wrapper for tables with organization_id column (location context).
 * @param {uuid} p_org_id - Organization id for the location row.
 * @returns {boolean}
 */
create or replace function app.can_manage_org_location(
  p_org_id uuid
)
returns boolean
language sql
stable
as $$
  select app.me_has_org_access(
    p_org_id,
    array['tenant_admin','storage_manager']::public.roles_type[]
  );
$$;

comment on function app.can_manage_org_location(uuid) is
'True if user is super_admin or has {tenant_admin, storage_manager} in the location''s organization.';

-- ---------------------------------------------------------------------------
-- Helpful indexes (idempotent)
-- ---------------------------------------------------------------------------
create index if not exists idx_uor_user_org_active
  on public.user_organization_roles (user_id, organization_id)
  where is_active = true;

create index if not exists idx_roles_role
  on public.roles (role);
