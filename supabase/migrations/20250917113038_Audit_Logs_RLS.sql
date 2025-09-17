-- =============================================
-- RLS Policies for public.audit_logs
-- =============================================

-- Enable row-level security
alter table public.audit_logs enable row level security;

-- Policy: disallow DELETEs entirely
create policy "Disallow deletes on audit_logs"
on public.audit_logs
as restrictive
for delete
to public
using (false);

-- Policy: disallow UPDATEs entirely
create policy "Disallow updates on audit_logs"
on public.audit_logs
as restrictive
for update
to public
using (false)
with check (false);

-- Policy: allow SELECT only to super_admins and tenant_admins
create policy "Allow select for super_admins and tenant_admins"
on public.audit_logs
for select
to authenticated
using (
  app.is_super_admin()
  or app.is_any_tenant_admin()
);