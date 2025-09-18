-- ==================================================
-- TABLES: storage_item_images, storage_locations
-- ==================================================
-- Purpose: Update RLS policies to allow any role to READ
--          but restrict mutations to non-banned users only.
-- ==================================================
-- Drop the old policy and create mutation-only versions:


-- ==================================================
-- Table: storage_item_images
-- ==================================================
DROP POLICY IF EXISTS "Ban Enforcement Org Storage Item Images (mutations)" ON public.storage_item_images;
DROP POLICY IF EXISTS "Ban Enforcement Org Storage Item Images (insert)" ON public.storage_item_images;
DROP POLICY IF EXISTS "Ban Enforcement Org Storage Item Images (update)" ON public.storage_item_images;
DROP POLICY IF EXISTS "Ban Enforcement Org Storage Item Images (delete)" ON public.storage_item_images;

CREATE POLICY "Ban Enforcement Org Storage Item Images (insert)" ON public.storage_item_images
AS RESTRICTIVE
FOR INSERT TO authenticated
WITH CHECK (
EXISTS (
SELECT 1 FROM public.storage_items si
WHERE si.id = storage_item_images.item_id
AND app.me_is_not_banned_for_org(si.org_id)
)
);

CREATE POLICY "Ban Enforcement Org Storage Item Images (update)" ON public.storage_item_images
AS RESTRICTIVE
FOR UPDATE TO authenticated
USING (
EXISTS (
SELECT 1 FROM public.storage_items si
WHERE si.id = storage_item_images.item_id
AND app.me_is_not_banned_for_org(si.org_id)
)
)
WITH CHECK (
EXISTS (
SELECT 1 FROM public.storage_items si
WHERE si.id = storage_item_images.item_id
AND app.me_is_not_banned_for_org(si.org_id)
)
);

CREATE POLICY "Ban Enforcement Org Storage Item Images (delete)" ON public.storage_item_images
AS RESTRICTIVE
FOR DELETE TO authenticated
USING (
EXISTS (
SELECT 1 FROM public.storage_items si
WHERE si.id = storage_item_images.item_id
AND app.me_is_not_banned_for_org(si.org_id)
)
);

DO $$
BEGIN
  IF NOT EXISTS (
	SELECT 1
	FROM pg_policies
	WHERE schemaname = 'public'
	  AND tablename = 'storage_item_images'
	  AND policyname = 'All users can read storage_item_images'
  ) THEN
	EXECUTE 'CREATE POLICY "All users can read storage_item_images"
	  ON public.storage_item_images FOR SELECT USING (true);';
  END IF;
END
$$;

-- ==================================================
-- Table: Storage Locations
-- ==================================================

-- Ensure RLS is enabled and forced (idempotent)
ALTER TABLE IF EXISTS public.storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.storage_locations FORCE ROW LEVEL SECURITY;

-- Make sure a permissive read policy exists for everyone
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'storage_locations'
      AND policyname = 'All users can read storage_locations'
  ) THEN
    EXECUTE 'CREATE POLICY "All users can read storage_locations" ON public.storage_locations FOR SELECT USING (true);';
  END IF;
END
$$;

-- Drop any prior ban policies that applied to ALL commands
DROP POLICY IF EXISTS "Ban Enforcement Org Storage Locations" ON public.storage_locations;
DROP POLICY IF EXISTS "Ban Enforcement Org Storage Locations (mutations)" ON public.storage_locations;
DROP POLICY IF EXISTS "Ban Enforcement Org Storage Locations (insert)" ON public.storage_locations;
DROP POLICY IF EXISTS "Ban Enforcement Org Storage Locations (update)" ON public.storage_locations;
DROP POLICY IF EXISTS "Ban Enforcement Org Storage Locations (delete)" ON public.storage_locations;

-- Recreate ban enforcement as mutation-only policies
CREATE POLICY "Ban Enforcement Org Storage Locations (insert)" ON public.storage_locations
  AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_locations ol
      WHERE ol.storage_location_id = storage_locations.id
        AND app.me_is_not_banned_for_org(ol.organization_id)
    )
  );

CREATE POLICY "Ban Enforcement Org Storage Locations (update)" ON public.storage_locations
  AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_locations ol
      WHERE ol.storage_location_id = storage_locations.id
        AND app.me_is_not_banned_for_org(ol.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_locations ol
      WHERE ol.storage_location_id = storage_locations.id
        AND app.me_is_not_banned_for_org(ol.organization_id)
    )
  );

CREATE POLICY "Ban Enforcement Org Storage Locations (delete)" ON public.storage_locations
  AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_locations ol
      WHERE ol.storage_location_id = storage_locations.id
        AND app.me_is_not_banned_for_org(ol.organization_id)
    )
  );
