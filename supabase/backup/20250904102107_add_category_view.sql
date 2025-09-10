CREATE OR REPLACE VIEW public.view_category_details AS
SELECT
  c.id,
  c.parent_id,
  c.translations,
  c.created_at,
  COALESCE(si_counts.assigned_to, 0) AS assigned_to
FROM public.categories c
LEFT JOIN (
  SELECT category_id, COUNT(id) AS assigned_to
  FROM public.storage_items
  GROUP BY category_id
) si_counts ON si_counts.category_id = c.id;
