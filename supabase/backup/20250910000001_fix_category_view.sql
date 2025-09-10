-- Fix the view_category_details view with proper GROUP BY clause
CREATE OR REPLACE VIEW public.view_category_details AS
SELECT
  c.id,
  c.parent_id,
  c.translations,
  c.created_at,
  COALESCE(COUNT(si.id), 0) AS assigned_to
FROM public.categories c
LEFT JOIN public.storage_items si ON si.category_id = c.id
GROUP BY c.id, c.parent_id, c.translations, c.created_at;
