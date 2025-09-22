ALTER POLICY "Storage managers can read org ban history"
ON "public"."user_ban_history"
TO authenticated
USING (
    ((user_id <> auth.uid())
    AND (organization_id IS NOT NULL)
    AND app.me_has_role(organization_id, 'storage_manager'::roles_type))
);

ALTER POLICY "Tenant admins can create org ban records"
ON "public"."user_ban_history"
TO authenticated
WITH CHECK (
    ((banned_by = auth.uid())
    AND (((organization_id IS NOT NULL)
    AND app.me_has_role(organization_id, 'tenant_admin'::roles_type)
    AND ((ban_type)::text = ANY ((ARRAY['banForOrg'::character varying, 'banForRole'::character varying])::text[])))
    OR ((organization_id IS NULL)
    AND ((ban_type)::text = 'banForApp'::text)
    AND app.is_any_tenant_admin()
    )))
);

ALTER POLICY "Tenant admins can read org ban history"
ON "public"."user_ban_history"
TO authenticated
USING (
    ((user_id <> auth.uid())
    AND (organization_id IS NOT NULL)
    AND app.me_has_role(organization_id, 'tenant_admin'::roles_type))
);

ALTER POLICY "Tenant admins can update ban records"
ON "public"."user_ban_history"
TO authenticated
USING (
     ((((organization_id IS NOT NULL)
     AND
     app.me_has_role(organization_id, 'tenant_admin'::roles_type))
     OR
     ((organization_id IS NULL)
     AND app.me_has_role_anywhere('tenant_admin'::roles_type))))
);

ALTER POLICY "Users can read their own ban history"
ON "public"."user_ban_history"
TO authenticated
USING (
    (user_id = auth.uid())
);