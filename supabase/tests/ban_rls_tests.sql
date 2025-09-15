-- ============================================================================
-- Ban/RLS End-to-End Smoke Tests
-- Usage: Run this whole file in Supabase SQL editor or psql.
-- It prints NOTICES for OK and WARNINGS for failures. No permanent changes.
-- ============================================================================

DO $$
DECLARE
  v_user_tenant uuid := '20309789-792f-4755-b8ad-e94dbb4961e3'; -- your account
  v_super_admin uuid;
  v_cnt int;
  v_bad int;
  v_new_org_id uuid;
BEGIN
  -- Locate any super admin from seed
  SELECT uor.user_id
  INTO v_super_admin
  FROM public.user_organization_roles uor
  JOIN public.roles r ON r.id = uor.role_id
  WHERE r.role = 'super_admin'::public.roles_type
    AND uor.is_active = true
  LIMIT 1;

  RAISE NOTICE 'Super admin for tests: %', v_super_admin;

  -- ------------------------------------------------------------------------
  -- 1) Org visibility is limited to orgs where user has an active role
  -- ------------------------------------------------------------------------
  PERFORM set_config('request.jwt.claim.sub', v_user_tenant::text, true);
  RAISE NOTICE 'Testing as tenant-admin user: %', v_user_tenant;

  SELECT count(*) INTO v_bad
  FROM public.organizations o
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_organization_roles uor
    WHERE uor.user_id = v_user_tenant
      AND uor.is_active = true
      AND uor.organization_id = o.id
  );

  IF v_bad = 0 THEN
    RAISE NOTICE 'OK: organizations filtered to user''s memberships';
  ELSE
    RAISE WARNING 'FAIL: saw % organization(s) without membership', v_bad;
  END IF;

  -- ------------------------------------------------------------------------
  -- 2) storage_items visibility is limited to the user''s org memberships
  -- ------------------------------------------------------------------------
  SELECT count(*) INTO v_bad
  FROM public.storage_items si
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_organization_roles uor
    WHERE uor.user_id = v_user_tenant
      AND uor.is_active = true
      AND uor.organization_id = si.org_id
  );

  IF v_bad = 0 THEN
    RAISE NOTICE 'OK: storage_items filtered by org membership';
  ELSE
    RAISE WARNING 'FAIL: storage_items shows % row(s) from non-member orgs', v_bad;
  END IF;

  -- ------------------------------------------------------------------------
  -- 3) bookings visibility is limited by provider org on booking_items
  -- ------------------------------------------------------------------------
  SELECT count(*) INTO v_bad
  FROM public.bookings b
  WHERE EXISTS (
    SELECT 1
    FROM public.booking_items bi
    WHERE bi.booking_id = b.id
      AND NOT EXISTS (
        SELECT 1 FROM public.user_organization_roles uor
        WHERE uor.user_id = v_user_tenant
          AND uor.is_active = true
          AND uor.organization_id = bi.provider_organization_id
      )
  );

  IF v_bad = 0 THEN
    RAISE NOTICE 'OK: bookings filtered by provider org memberships';
  ELSE
    RAISE WARNING 'FAIL: bookings shows % row(s) from non-member orgs', v_bad;
  END IF;

  -- ------------------------------------------------------------------------
  -- 4) Globally banned user (no roles) should see 0 rows for key tables
  -- ------------------------------------------------------------------------
  PERFORM set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
  SELECT count(*) INTO v_cnt FROM public.organizations;
  IF v_cnt = 0 THEN RAISE NOTICE 'OK: banned user sees 0 organizations';
  ELSE RAISE WARNING 'FAIL: banned user sees % organizations', v_cnt; END IF;

  SELECT count(*) INTO v_cnt FROM public.storage_items;
  IF v_cnt = 0 THEN RAISE NOTICE 'OK: banned user sees 0 storage_items';
  ELSE RAISE WARNING 'FAIL: banned user sees % storage_items', v_cnt; END IF;

  -- ------------------------------------------------------------------------
  -- 5) Organizations INSERT allowed for super_admin, blocked for tenant_admin
  -- ------------------------------------------------------------------------
  PERFORM set_config('request.jwt.claim.sub', v_super_admin::text, true);
  INSERT INTO public.organizations (name, description)
  VALUES ('RLS Test Org ' || substr(gen_random_uuid()::text,1,8), 'temp test')
  RETURNING id INTO v_new_org_id;

  RAISE NOTICE 'OK: super_admin inserted organization %', v_new_org_id;

  -- Clean up inserted org
  DELETE FROM public.organizations WHERE id = v_new_org_id;

  PERFORM set_config('request.jwt.claim.sub', v_user_tenant::text, true);
  BEGIN
    INSERT INTO public.organizations (name, description)
    VALUES ('Should Fail ' || substr(gen_random_uuid()::text,1,8), 'temp');
    RAISE WARNING 'FAIL: tenant_admin insert into organizations unexpectedly succeeded';
    -- best-effort cleanup if it did succeed
    DELETE FROM public.organizations WHERE name LIKE 'Should Fail %';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'OK: tenant_admin insert blocked (% %)', SQLSTATE, SQLERRM;
  END;

  -- ------------------------------------------------------------------------
  -- 6) Org-scoped storage tables are filtered by org bans (spot checks)
  -- ------------------------------------------------------------------------
  SELECT count(*) INTO v_bad
  FROM public.storage_item_images sii
  WHERE EXISTS (
    SELECT 1 FROM public.storage_items si
    WHERE si.id = sii.item_id
      AND NOT EXISTS (
        SELECT 1 FROM public.user_organization_roles uor
        WHERE uor.user_id = v_user_tenant
          AND uor.is_active = true
          AND uor.organization_id = si.org_id
      )
  );
  IF v_bad = 0 THEN
    RAISE NOTICE 'OK: storage_item_images filtered by org membership';
  ELSE
    RAISE WARNING 'FAIL: storage_item_images shows % row(s) from non-member orgs', v_bad;
  END IF;

  SELECT count(*) INTO v_bad
  FROM public.storage_images simg
  WHERE EXISTS (
    SELECT 1 FROM public.organization_locations ol
    WHERE ol.storage_location_id = simg.location_id
      AND NOT EXISTS (
        SELECT 1 FROM public.user_organization_roles uor
        WHERE uor.user_id = v_user_tenant
          AND uor.is_active = true
          AND uor.organization_id = ol.organization_id
      )
  );
  IF v_bad = 0 THEN
    RAISE NOTICE 'OK: storage_images filtered by org membership';
  ELSE
    RAISE WARNING 'FAIL: storage_images shows % row(s) from non-member orgs', v_bad;
  END IF;

END $$;

-- Quick ad‑hoc insert you can run manually in the SQL editor:
-- 1) Impersonate a super admin for the session
--    select set_config('request.jwt.claim.sub', '<super_admin_user_id>', true);
-- 2) Insert (slug auto-generated by trigger)
--    insert into public.organizations (name, description)
--    values ('CLI Test Org', 'created via SQL editor') returning *;

