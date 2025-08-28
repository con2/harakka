CREATE OR REPLACE VIEW public.view_most_popular_items AS
SELECT bi.item_id, COUNT(*) AS times_booked, si.translations->'en'->>'item_name' as name
FROM booking_items bi
JOIN storage_items si ON bi.item_id = si.id
GROUP BY bi.item_id, si.translations
ORDER BY times_booked DESC;

CREATE OR REPLACE VIEW public.view_most_popular_tags AS 
SELECT
    mbi.item_id,
    mbi.times_booked,
    tags.translations->'en'->>'name' as tag
FROM
    view_most_booked_items as mbi
JOIN
    storage_item_tags sit ON mbi.item_id = sit.item_id
JOIN
    tags on tags.id = sit.tag_id
GROUP BY
    mbi.item_id, mbi.times_booked, tags.translations->'en'->>'name'
ORDER BY
    mbi.times_booked DESC;

SELECT cron.schedule(
    'update-popular-tags', -- Job name
    '0 0 * * *', -- Cron syntax for "at 00:00 every day"
    $$
    -- Step 1: Set is_popular to false for all tags
    UPDATE tags
    SET is_popular = false;

    -- Step 2: Find the top 5 most popular tags and set their is_popular status to true
    UPDATE tags
    SET is_popular = true
    WHERE id IN (
        SELECT sit.tag_id
        FROM view_most_popular_tags AS vmp
        JOIN storage_item_tags sit ON vmp.item_id = sit.item_id
        ORDER BY vmp.times_booked DESC
        LIMIT 5
    );
    $$
);