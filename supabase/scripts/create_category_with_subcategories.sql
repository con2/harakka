-- Optional: override the base category name before running the DO block.
-- Example:
--   SET LOCAL app.category_base_name = 'UI Demo Category';

DO $$
DECLARE
  base_name text;
  parent_translations jsonb;
  parent_id uuid := gen_random_uuid();
BEGIN
  base_name := COALESCE(
    current_setting('app.category_base_name', true),
    'Demo Category ' || to_char(NOW(), 'YYYYMMDDHH24MISS')
  );

  parent_translations := jsonb_build_object(
    'en', base_name,
    'fi', base_name || ' (FI)'
  );

  INSERT INTO public.categories (id, parent_id, translations)
  VALUES (parent_id, NULL, parent_translations);

  FOR idx IN 1..10 LOOP
    INSERT INTO public.categories (id, parent_id, translations)
    VALUES (
      gen_random_uuid(),
      parent_id,
      jsonb_build_object(
        'en', base_name || ' Sub ' || idx,
        'fi', base_name || ' Sub ' || idx || ' (FI)'
      )
    );
  END LOOP;

  RAISE NOTICE 'Created category % with id % and % subcategories', base_name, parent_id, 10;
END $$;
