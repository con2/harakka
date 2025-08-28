----------------------------------------------------------------
-- 2) Create or replace the function (uses uuid[] to match uuid PKs)
----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_popular_tags()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  top_tags uuid[];
BEGIN
  SELECT array_agg(sit.tag_id) INTO top_tags
  FROM (
    SELECT sit.tag_id
    FROM booking_items bi
    JOIN storage_item_tags sit ON bi.item_id = sit.item_id
    GROUP BY sit.tag_id
    ORDER BY COUNT(*) DESC, sit.tag_id
    LIMIT 5
  ) t;

  IF top_tags IS NULL THEN
    top_tags := ARRAY[]::uuid[]; -- change type if needed
  END IF;

  -- single-line log of top tag ids
  RAISE WARNING 'calculate_popular_tags: top_tag_ids = %',
    array_to_string(ARRAY(SELECT unnest(top_tags)::text), ', ');

  -- detailed logs: id + booking count (one warning per tag)
  FOR rec IN
    SELECT sit.tag_id, COUNT(*) AS bookings
    FROM booking_items bi
    JOIN storage_item_tags sit ON bi.item_id = sit.item_id
    GROUP BY sit.tag_id
    ORDER BY bookings DESC, sit.tag_id
    LIMIT 5
  LOOP
    RAISE WARNING 'calculate_popular_tags: tag_id=% bookings=%',
      rec.tag_id::text, rec.bookings;
  END LOOP;

  -- mark top tags TRUE, others FALSE
  UPDATE tags
  SET is_popular = (id = ANY(top_tags));
END;
$$;

----------------------------------------------------------------
-- 3) Unschedule any existing job with this name (safety)
----------------------------------------------------------------
DO $$
DECLARE
  jid int;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'calculate_popular_tags' LIMIT 1;
  IF jid IS NOT NULL THEN
    PERFORM cron.unschedule(jid);
  END IF;
END
$$;


----------------------------------------------------------------
-- 4) Schedule the nightly cron job at midnight
----------------------------------------------------------------
SELECT cron.schedule(
  'calculate_popular_tags',   -- job name
  '0 0 * * *',                -- daily at 00:00
  $$ SELECT public.calculate_popular_tags(); $$  -- SQL to run
);

SELECT public.calculate_popular_tags();
