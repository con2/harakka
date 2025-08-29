CREATE OR REPLACE VIEW public.view_most_popular_items AS
SELECT bi.item_id, COUNT(*) AS times_booked, si.translations->'en'->>'item_name' as name
FROM booking_items bi
JOIN storage_items si ON bi.item_id = si.id
GROUP BY bi.item_id, si.translations
ORDER BY times_booked DESC;

CREATE OR REPLACE VIEW public.view_tag_item_count AS 
SELECT
    sit.tag_id,
    tags.translations->'en'->>'name' as tag_name,
    COUNT(sit.item_id) as assigned_to
FROM
    storage_item_tags sit
JOIN
    tags on tags.id = sit.tag_id
GROUP BY
    sit.tag_id, tags.translations->'en'->>'name'
ORDER BY
    assigned_to DESC;

CREATE OR REPLACE VIEW public.view_most_popular_tags AS
SELECT
    t.id AS tag_id,
    t.translations->'en'->>'name' AS tag_name,
    COUNT(bi.booking_id) AS total_bookings,
    t.translations,
    t.created_at
FROM
    tags t
JOIN
    storage_item_tags sit ON t.id = sit.tag_id
JOIN
    booking_items bi ON sit.item_id = bi.item_id
GROUP BY
    t.id, t.translations->'en'->>'name'
ORDER BY
    total_bookings DESC;