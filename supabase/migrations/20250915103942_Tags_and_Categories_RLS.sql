-- ==========================================================================
-- TAGS & CATEGORIES - ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================================
-- Based on the schema analysis:
--   • Tags table has: id, created_at, translations
--   • Categories table has: id, created_at, updated_at, translations, description, icon, color, sort_order
--   • Both are global entities (no organization_id or created_by columns)
--   • Policy requirements:
--     - All users can READ tags and categories (public data)
--     - Only authenticated users with storage roles can CREATE/UPDATE/DELETE
--     - Super admins are excluded from modifications (read-only)
-- ==========================================================================

-- --------------------------------------------------------------------------
-- TAGS TABLE
-- --------------------------------------------------------------------------
alter table public.tags enable row level security;
alter table public.tags force row level security;

-- READ: All users (including anonymous) can read tags (public data)
create policy "All users can read tags"
  on public.tags
  for select
  using (true);

-- CREATE: Only storage managers and tenant admins can create tags
create policy "Storage roles can create tags"
  on public.tags
  for insert
  to authenticated
  with check (
    not app.me_is_super_admin()
    and (
      app.me_has_role_anywhere('storage_manager'::public.roles_type)
      or app.me_has_role_anywhere('tenant_admin'::public.roles_type)
    )
  );

-- UPDATE: Only storage managers and tenant admins can update tags
create policy "Storage roles can update tags"
  on public.tags
  for update
  to authenticated
  using (
    not app.me_is_super_admin()
    and (
      app.me_has_role_anywhere('storage_manager'::public.roles_type)
      or app.me_has_role_anywhere('tenant_admin'::public.roles_type)
    )
  )
  with check (
    not app.me_is_super_admin()
    and (
      app.me_has_role_anywhere('storage_manager'::public.roles_type)
      or app.me_has_role_anywhere('tenant_admin'::public.roles_type)
    )
  );

-- DELETE: Only storage managers and tenant admins can delete tags
create policy "Storage roles can delete tags"
  on public.tags
  for delete
  to authenticated
  using (
    not app.me_is_super_admin()
    and (
      app.me_has_role_anywhere('storage_manager'::public.roles_type)
      or app.me_has_role_anywhere('tenant_admin'::public.roles_type)
    )
  );

-- --------------------------------------------------------------------------
-- CATEGORIES TABLE
-- --------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.categories force row level security;

-- READ: All users (including anonymous) can read categories (public data)
create policy "All users can read categories"
  on public.categories
  for select
  using (true);

-- CREATE: Only storage managers and tenant admins can create categories
create policy "Storage roles can create categories"
  on public.categories
  for insert
  to authenticated
  with check (
    not app.me_is_super_admin()
    and (
      app.me_has_role_anywhere('storage_manager'::public.roles_type)
      or app.me_has_role_anywhere('tenant_admin'::public.roles_type)
    )
  );

-- UPDATE: Only storage managers and tenant admins can update categories
create policy "Storage roles can update categories"
  on public.categories
  for update
  to authenticated
  using (
    not app.me_is_super_admin()
    and (
      app.me_has_role_anywhere('storage_manager'::public.roles_type)
      or app.me_has_role_anywhere('tenant_admin'::public.roles_type)
    )
  )
  with check (
    not app.me_is_super_admin()
    and (
      app.me_has_role_anywhere('storage_manager'::public.roles_type)
      or app.me_has_role_anywhere('tenant_admin'::public.roles_type)
    )
  );

-- DELETE: Only storage managers and tenant admins can delete categories
create policy "Storage roles can delete categories"
  on public.categories
  for delete
  to authenticated
  using (
    not app.me_is_super_admin()
    and (
      app.me_has_role_anywhere('storage_manager'::public.roles_type)
      or app.me_has_role_anywhere('tenant_admin'::public.roles_type)
    )
  );