CREATE OR REPLACE VIEW public.view_tag_popularity AS
WITH ranked_tags AS (
    SELECT
        t.id,
        t.translations->'en'->>'name' AS tag_name,
        t.translations,
        t.created_at,
        COUNT(DISTINCT sit.item_id) AS assigned_to,
        COUNT(bi.booking_id) AS total_bookings,
        -- Calculate the percentage rank of each tag's total bookings
        PERCENT_RANK() OVER (ORDER BY COUNT(bi.booking_id) DESC) AS rank_percentile
    FROM
        tags t
    LEFT JOIN
        storage_item_tags sit ON t.id = sit.tag_id
    LEFT JOIN
        booking_items bi ON sit.item_id = bi.item_id
    GROUP BY
        t.id, t.translations, t.created_at
)
SELECT
    *,
    CASE
        WHEN rank_percentile <= 0.05 THEN 'very popular'
        WHEN rank_percentile <= 0.25 THEN 'popular'
        ELSE ''
    END AS popularity_rank
FROM
    ranked_tags
ORDER BY
    total_bookings DESC;