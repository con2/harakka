-- ===================================
-- 0) Transaction + safety
-- ===================================
begin;

-- Keep search_path predictable in definer functions
set search_path = public;

-- ===================================
-- 1) Schema + helper functions
-- ===================================

create schema if not exists app;

-- Who is acting helper (for auditing)
create or replace function app.actor_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select id from public.user_profiles where id = auth.uid()),
    auth.uid()
  );
$$;

-- ===================================
-- 2) Trigger to auto-log org ban/unban
--    when user_organization_roles.is_active flips
-- ===================================

create or replace function app.trg_log_org_role_ban_unban()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(current_setting('app.skip_ban_trigger', true), 'false') = 'true' then
    return NEW;
  end if;
  if TG_OP = 'UPDATE' and NEW.is_active is distinct from OLD.is_active then
    if NEW.is_active = false then
      insert into public.user_ban_history (
        user_id, banned_by, ban_type, action, ban_reason, is_permanent,
        role_assignment_id, organization_id, affected_assignments
      )
      values (
        NEW.user_id, app.actor_id(), 'banForOrg', 'banned',
        coalesce(current_setting('app.ban_reason', true), null), false,
        NEW.id, NEW.organization_id,
        jsonb_build_object('role_id', NEW.role_id, 'was_active', OLD.is_active, 'now_active', NEW.is_active)
      );
    else
      insert into public.user_ban_history (
        user_id, banned_by, ban_type, action, ban_reason, is_permanent,
        role_assignment_id, organization_id, affected_assignments, unbanned_at
      )
      values (
        NEW.user_id, app.actor_id(), 'banForOrg', 'unbanned',
        coalesce(current_setting('app.ban_reason', true), null), false,
        NEW.id, NEW.organization_id,
        jsonb_build_object('role_id', NEW.role_id, 'was_active', OLD.is_active, 'now_active', NEW.is_active),
        now()
      );
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_log_org_role_ban_unban on public.user_organization_roles;
create trigger trg_log_org_role_ban_unban
after update of is_active on public.user_organization_roles
for each row execute function app.trg_log_org_role_ban_unban();

-- ===================================
-- 3) RLS for user_ban_history
--    (limit exposure, allow admins to read)
-- ===================================

-- ===========================================================
-- DROP all existing policies to start fresh
-- ===========================================================
alter table public.user_ban_history disable row level security;

drop policy if exists "Super admins can read all ban history" on public.user_ban_history;
drop policy if exists "Tenant admins can read all ban history" on public.user_ban_history;
drop policy if exists "Users can read their own ban history" on public.user_ban_history;
drop policy if exists "Tenant admins can read org ban history" on public.user_ban_history;
drop policy if exists "Storage managers can read org ban history" on public.user_ban_history;
drop policy if exists "Tenant admins can create org ban records" on public.user_ban_history;
drop policy if exists "Super admins can create ban records" on public.user_ban_history;
drop policy if exists "Tenant admins can update ban records" on public.user_ban_history;
drop policy if exists "Super admins can update ban records" on public.user_ban_history;

alter table public.user_ban_history enable row level security;
alter table public.user_ban_history force row level security;


-- Users can read their own history
drop policy if exists ubh_select_own on public.user_ban_history;
create policy ubh_select_own
on public.user_ban_history
for select
to authenticated
using ( user_id = auth.uid() );

-- Org admins & super_admins can read org members' history
drop policy if exists ubh_select_admins on public.user_ban_history;
create policy ubh_select_admins
on public.user_ban_history
for select
to authenticated
using (
  app.me_is_super_admin()
  or (
    organization_id is not null and
    app.me_has_role(organization_id, 'tenant_admin'::public.roles_type)
  )
  or (
    organization_id is not null and
    app.me_has_role(organization_id, 'storage_manager'::public.roles_type)
  )
);

-- Writes are via trigger; still lock down direct writes to super_admins
drop policy if exists ubh_admin_write on public.user_ban_history;
create policy ubh_admin_write
on public.user_ban_history
for all
to authenticated
using ( app.me_is_super_admin() )
with check ( app.me_is_super_admin() );

-- ===================================
-- 4) Accessor functions for ban status (optional)
--    These expect your existing public.view_user_ban_status
-- ===================================

-- Current user's status (safe for UI)
create or replace function app.get_my_ban_status()
returns table (
  id uuid, email text, full_name text, visible_name text,
  user_created_at timestamptz,
  active_roles_count bigint, inactive_roles_count bigint,
  ban_status text, latest_ban_type text, latest_action text,
  ban_reason text, is_permanent boolean, banned_by uuid,
  banned_at timestamptz, unbanned_at timestamptz,
  banned_by_name text, banned_by_email text
)
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.view_user_ban_status v
  where v.id = auth.uid();
$$;

-- Org view for admins (read-only lens)
create or replace function app.get_org_ban_status(p_org uuid)
returns setof public.view_user_ban_status
language sql
stable
security definer
set search_path = public
as $$
  select v.*
  from public.view_user_ban_status v
  where app.me_is_super_admin()
     or app.me_has_role(p_org, 'tenant_admin'::public.roles_type)
     or app.me_has_role(p_org, 'storage_manager'::public.roles_type);
$$;

-- ===================================
-- 5) Controlled RPCs for ban/unban operations (multi-tenant aware)
-- ===================================

create or replace function app.ban_user_for_role(
  p_target_user uuid,
  p_organization_id uuid,
  p_role_id uuid,
  p_reason text default null,
  p_is_permanent boolean default false,
  p_notes text default null
)
returns public.user_ban_history
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := app.actor_id();
  v_assignment public.user_organization_roles%rowtype;
  v_ban public.user_ban_history%rowtype;
  v_payload jsonb;
  v_reason text := nullif(trim(p_reason), '');
  v_notes text := nullif(trim(p_notes), '');
begin
  if not app.me_is_super_admin() then
    if not app.me_has_role(p_organization_id, 'tenant_admin'::public.roles_type) then
      raise exception using errcode = '42501', message = 'Not authorised to ban users outside your organisation.';
    end if;
  end if;

  select *
    into v_assignment
  from public.user_organization_roles
  where user_id = p_target_user
    and organization_id = p_organization_id
    and role_id = p_role_id
  order by created_at desc
  limit 1
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Role assignment not found for the specified user.';
  end if;

  if v_assignment.is_active = false then
    raise exception using errcode = '22023', message = 'Role assignment already inactive.';
  end if;

  begin
    perform set_config('app.skip_ban_trigger', 'true', true);

    update public.user_organization_roles
    set is_active = false,
        updated_at = now()
    where id = v_assignment.id;

    v_payload := jsonb_build_object(
      'assignments',
      jsonb_build_array(
        jsonb_build_object(
          'role_assignment_id', v_assignment.id,
          'organization_id', v_assignment.organization_id,
          'role_id', v_assignment.role_id,
          'was_active', true,
          'now_active', false
        )
      )
    );

    insert into public.user_ban_history (
      user_id,
      banned_by,
      ban_type,
      action,
      ban_reason,
      is_permanent,
      role_assignment_id,
      organization_id,
      affected_assignments,
      notes
    )
    values (
      p_target_user,
      v_actor,
      'banForRole',
      'banned',
      v_reason,
      coalesce(p_is_permanent, false),
      v_assignment.id,
      p_organization_id,
      v_payload,
      v_notes
    )
    returning * into v_ban;

  exception
    when others then
      perform set_config('app.skip_ban_trigger', 'false', true);
      raise;
  end;

  perform set_config('app.skip_ban_trigger', 'false', true);

  return v_ban;
end;
$$;

create or replace function app.ban_user_for_org(
  p_target_user uuid,
  p_organization_id uuid,
  p_reason text default null,
  p_is_permanent boolean default false,
  p_notes text default null
)
returns public.user_ban_history
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := app.actor_id();
  v_payload jsonb;
  v_ban public.user_ban_history%rowtype;
  v_reason text := nullif(trim(p_reason), '');
  v_notes text := nullif(trim(p_notes), '');
begin
  if not app.me_is_super_admin() then
    if not app.me_has_role(p_organization_id, 'tenant_admin'::public.roles_type) then
      raise exception using errcode = '42501', message = 'Not authorised to ban users outside your organisation.';
    end if;
  end if;

  begin
    perform set_config('app.skip_ban_trigger', 'true', true);

    with affected as (
      update public.user_organization_roles
      set is_active = false,
          updated_at = now()
      where user_id = p_target_user
        and organization_id = p_organization_id
        and is_active = true
      returning id, organization_id, role_id
    )
    select jsonb_build_object(
             'assignments',
             jsonb_agg(
               jsonb_build_object(
                 'role_assignment_id', id,
                 'organization_id', organization_id,
                 'role_id', role_id,
                 'was_active', true,
                 'now_active', false
               )
             )
           )
      into v_payload
    from affected;

    if v_payload is null then
      raise exception using errcode = 'P0002', message = 'No active roles found for user in organisation.';
    end if;

    insert into public.user_ban_history (
      user_id,
      banned_by,
      ban_type,
      action,
      ban_reason,
      is_permanent,
      organization_id,
      affected_assignments,
      notes
    )
    values (
      p_target_user,
      v_actor,
      'banForOrg',
      'banned',
      v_reason,
      coalesce(p_is_permanent, false),
      p_organization_id,
      v_payload,
      v_notes
    )
    returning * into v_ban;

  exception
    when others then
      perform set_config('app.skip_ban_trigger', 'false', true);
      raise;
  end;

  perform set_config('app.skip_ban_trigger', 'false', true);

  return v_ban;
end;
$$;

create or replace function app.ban_user_for_app(
  p_target_user uuid,
  p_reason text default null,
  p_is_permanent boolean default false,
  p_notes text default null
)
returns public.user_ban_history
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := app.actor_id();
  v_payload jsonb;
  v_ban public.user_ban_history%rowtype;
  v_reason text := nullif(trim(p_reason), '');
  v_notes text := nullif(trim(p_notes), '');
begin
  if not app.me_is_super_admin() then
    raise exception using errcode = '42501', message = 'Only super admins can ban a user from the entire application.';
  end if;

  begin
    perform set_config('app.skip_ban_trigger', 'true', true);

    with affected as (
      update public.user_organization_roles
      set is_active = false,
          updated_at = now()
      where user_id = p_target_user
        and is_active = true
      returning id, organization_id, role_id
    )
    select jsonb_build_object(
             'assignments',
             jsonb_agg(
               jsonb_build_object(
                 'role_assignment_id', id,
                 'organization_id', organization_id,
                 'role_id', role_id,
                 'was_active', true,
                 'now_active', false
               )
             )
           )
      into v_payload
    from affected;

    if v_payload is null then
      raise exception using errcode = 'P0002', message = 'No active roles found for user.';
    end if;

    insert into public.user_ban_history (
      user_id,
      banned_by,
      ban_type,
      action,
      ban_reason,
      is_permanent,
      affected_assignments,
      notes
    )
    values (
      p_target_user,
      v_actor,
      'banForApp',
      'banned',
      v_reason,
      coalesce(p_is_permanent, false),
      v_payload,
      v_notes
    )
    returning * into v_ban;

  exception
    when others then
      perform set_config('app.skip_ban_trigger', 'false', true);
      raise;
  end;

  perform set_config('app.skip_ban_trigger', 'false', true);

  return v_ban;
end;
$$;

create or replace function app.unban_user(
  p_target_user uuid,
  p_ban_type text,
  p_organization_id uuid default null,
  p_role_id uuid default null,
  p_notes text default null
)
returns setof public.user_ban_history
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := app.actor_id();
  v_payload jsonb;
  v_notes text := nullif(trim(p_notes), '');
  v_rows integer;
  v_updated public.user_ban_history%rowtype;
begin
  if p_ban_type not in ('banForRole', 'banForOrg', 'banForApp') then
    raise exception using errcode = '22023', message = 'Unsupported ban type.';
  end if;

  if p_ban_type = 'banForApp' then
    if not app.me_is_super_admin() then
      raise exception using errcode = '42501', message = 'Only super admins can unban application-wide bans.';
    end if;
  elsif not app.me_is_super_admin() then
    if p_organization_id is null then
      raise exception using errcode = '22023', message = 'Organization id is required for this operation.';
    end if;
    if not app.me_has_role(p_organization_id, 'tenant_admin'::public.roles_type) then
      raise exception using errcode = '42501', message = 'Not authorised to unban users outside your organisation.';
    end if;
  end if;

  begin
    perform set_config('app.skip_ban_trigger', 'true', true);

    if p_ban_type = 'banForRole' then
      if p_organization_id is null then
        raise exception using errcode = '22023', message = 'Organization id is required for role unban.';
      end if;

      with affected as (
        update public.user_organization_roles
        set is_active = true,
            updated_at = now()
        where user_id = p_target_user
          and organization_id = p_organization_id
          and is_active = false
          and (p_role_id is null or role_id = p_role_id)
        returning id, organization_id, role_id
      )
      select jsonb_build_object(
               'assignments',
               jsonb_agg(
                 jsonb_build_object(
                   'role_assignment_id', id,
                   'organization_id', organization_id,
                   'role_id', role_id,
                   'was_active', false,
                   'now_active', true
                 )
               )
             )
        into v_payload
      from affected;

    elsif p_ban_type = 'banForOrg' then
      if p_organization_id is null then
        raise exception using errcode = '22023', message = 'Organization id is required for org unban.';
      end if;

      with affected as (
        update public.user_organization_roles
        set is_active = true,
            updated_at = now()
        where user_id = p_target_user
          and organization_id = p_organization_id
          and is_active = false
        returning id, organization_id, role_id
      )
      select jsonb_build_object(
               'assignments',
               jsonb_agg(
                 jsonb_build_object(
                   'role_assignment_id', id,
                   'organization_id', organization_id,
                   'role_id', role_id,
                   'was_active', false,
                   'now_active', true
                 )
               )
             )
        into v_payload
      from affected;

    else
      with affected as (
        update public.user_organization_roles
        set is_active = true,
            updated_at = now()
        where user_id = p_target_user
          and is_active = false
        returning id, organization_id, role_id
      )
      select jsonb_build_object(
               'assignments',
               jsonb_agg(
                 jsonb_build_object(
                   'role_assignment_id', id,
                   'organization_id', organization_id,
                   'role_id', role_id,
                   'was_active', false,
                   'now_active', true
                 )
               )
             )
        into v_payload
      from affected;
    end if;

    if v_payload is null then
      raise exception using errcode = 'P0002', message = 'No inactive assignments matched the unban criteria.';
    end if;

    v_rows := 0;

    for v_updated in
      update public.user_ban_history
      set unbanned_at = now(),
          notes = case
            when v_notes is null then notes
            when notes is null then concat('[Unban] ', v_notes)
            else notes || '\n[Unban] ' || v_notes
          end,
          affected_assignments = v_payload
      where user_id = p_target_user
        and ban_type = p_ban_type
        and action = 'banned'
        and unbanned_at is null
        and (
          case
            when p_ban_type = 'banForRole' then organization_id = p_organization_id
            when p_ban_type = 'banForOrg' then organization_id = p_organization_id
            else true
          end
        )
      returning *
    loop
      v_rows := v_rows + 1;
      return next v_updated;
    end loop;

    if v_rows = 0 then
      raise exception using errcode = 'P0002', message = 'No matching ban records found to unban.';
    end if;

  exception
    when others then
      perform set_config('app.skip_ban_trigger', 'false', true);
      raise;
  end;

  perform set_config('app.skip_ban_trigger', 'false', true);
end;
$$;

grant execute on function app.ban_user_for_role(uuid, uuid, uuid, text, boolean, text) to authenticated;
grant execute on function app.ban_user_for_org(uuid, uuid, text, boolean, text) to authenticated;
grant execute on function app.ban_user_for_app(uuid, text, boolean, text) to authenticated;
grant execute on function app.unban_user(uuid, text, uuid, uuid, text) to authenticated;

-- Public schema wrappers (for RPC clients bound to 'public')
create or replace function public.ban_user_for_role(
  p_target_user uuid,
  p_organization_id uuid,
  p_role_id uuid,
  p_reason text default null,
  p_is_permanent boolean default false,
  p_notes text default null
)
returns public.user_ban_history
language sql
security definer
set search_path = public
as $$
  select app.ban_user_for_role(
    p_target_user,
    p_organization_id,
    p_role_id,
    p_reason,
    p_is_permanent,
    p_notes
  );
$$;

create or replace function public.ban_user_for_org(
  p_target_user uuid,
  p_organization_id uuid,
  p_reason text default null,
  p_is_permanent boolean default false,
  p_notes text default null
)
returns public.user_ban_history
language sql
security definer
set search_path = public
as $$
  select app.ban_user_for_org(
    p_target_user,
    p_organization_id,
    p_reason,
    p_is_permanent,
    p_notes
  );
$$;

create or replace function public.ban_user_for_app(
  p_target_user uuid,
  p_reason text default null,
  p_is_permanent boolean default false,
  p_notes text default null
)
returns public.user_ban_history
language sql
security definer
set search_path = public
as $$
  select app.ban_user_for_app(
    p_target_user,
    p_reason,
    p_is_permanent,
    p_notes
  );
$$;

create or replace function public.unban_user(
  p_target_user uuid,
  p_ban_type text,
  p_organization_id uuid default null,
  p_role_id uuid default null,
  p_notes text default null
)
returns setof public.user_ban_history
language sql
security definer
set search_path = public
as $$
  select *
  from app.unban_user(
    p_target_user,
    p_ban_type,
    p_organization_id,
    p_role_id,
    p_notes
  );
$$;

grant execute on function public.ban_user_for_role(uuid, uuid, uuid, text, boolean, text) to authenticated;
grant execute on function public.ban_user_for_org(uuid, uuid, text, boolean, text) to authenticated;
grant execute on function public.ban_user_for_app(uuid, text, boolean, text) to authenticated;
grant execute on function public.unban_user(uuid, text, uuid, uuid, text) to authenticated;

-- ===================================
-- 6) RLS templates for org-scoped tables
--    Apply per table that has an organization column (e.g., org_id, organization_id, provider_organization_id)
--    (example: storage_items)
-- ===================================

-- Example shown for public.storage_items

do $$
begin
  if exists (
    select 1
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'storage_items'
  ) then
    execute $SQL$
      alter table public.storage_items enable row level security;

      drop policy if exists org_read_if_active_role on public.storage_items;
      create policy org_read_if_active_role
      on public.storage_items
      for select to authenticated
      using ( app.me_is_org_member(org_id) );

      drop policy if exists org_insert_if_active_role on public.storage_items;
      create policy org_insert_if_active_role
      on public.storage_items
      for insert to authenticated
      with check ( app.me_is_org_member(org_id) );

      drop policy if exists org_update_if_active_role on public.storage_items;
      create policy org_update_if_active_role
      on public.storage_items
      for update to authenticated
      using ( app.me_is_org_member(org_id) )
      with check ( app.me_is_org_member(org_id) );

      drop policy if exists org_delete_if_active_role on public.storage_items;
      create policy org_delete_if_active_role
      on public.storage_items
      for delete to authenticated
      using ( app.me_is_org_member(org_id) );
    $SQL$;
  end if;
end;
$$;

-- Repeat the above DO $$...$$ block for each org-scoped table you want to protect.
-- Make sure the table actually has a column named organization_id,
-- or adapt the policy to the correct column (e.g., provider_organization_id).

commit;
