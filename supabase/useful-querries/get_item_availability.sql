-- Spot any org-items whose reserved > owned in the window (shouldn't happen with GREATEST(...,0))
WITH avail AS (
  SELECT *
  FROM public.get_item_availability(
    now(), now() + interval '7 days',
    NULL, NULL, NULL, NULL, true, NULL
  )
)
SELECT *
FROM avail
WHERE reserved_quantity > owned_quantity;

-- Compare counts when excluding 'pending'
SELECT
  (SELECT count(*) FROM public.get_item_availability(now(), now() + interval '7 days', NULL, NULL, NULL, NULL, true,  NULL)) AS with_pending,
  (SELECT count(*) FROM public.get_item_availability(now(), now() + interval '7 days', NULL, NULL, NULL, NULL, false, NULL)) AS without_pending;