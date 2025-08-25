-- Drop views that depend on organization_items table
DROP VIEW IF EXISTS view_item_location_summary;
DROP VIEW IF EXISTS view_item_ownership_summary;

-- Drop the organization_items table
DROP TABLE IF EXISTS organization_items;

-- Recreate view_item_location_summary using storage_items directly
CREATE OR REPLACE VIEW "public"."view_item_location_summary" AS
 SELECT "si"."id" AS "storage_item_id",
    (("si"."translations" -> 'en'::"text") ->> 'item_name'::"text") AS "item_name",
    "sl"."name" AS "location_name",
    "si"."items_number_total" AS "total_at_location",
    1 AS "organizations_count",
    'Total items' AS "organization_breakdown"
   FROM ("public"."storage_items" "si"
     CROSS JOIN "public"."storage_locations" "sl")
  WHERE "si"."items_number_total" > 0
  ORDER BY (("si"."translations" -> 'en'::"text") ->> 'item_name'::"text"), "sl"."name";

-- Recreate view_item_ownership_summary using storage_items directly
CREATE OR REPLACE VIEW "public"."view_item_ownership_summary" AS
 SELECT "si"."id" AS "storage_item_id",
    (("si"."translations" -> 'en'::"text") ->> 'item_name'::"text") AS "item_name",
    "sl"."name" AS "location_name",
    'System' AS "organization_name",
    "si"."items_number_total" AS "owned_quantity",
    "si"."items_number_total" AS "total_across_all_locations",
    "si"."items_number_total" AS "location_total"
   FROM ("public"."storage_items" "si"
     CROSS JOIN "public"."storage_locations" "sl")
  WHERE "si"."items_number_total" > 0
  ORDER BY (("si"."translations" -> 'en'::"text") ->> 'item_name'::"text"), "sl"."name";

-- Set ownership of the recreated views
ALTER TABLE "public"."view_item_location_summary" OWNER TO "postgres";
ALTER TABLE "public"."view_item_ownership_summary" OWNER TO "postgres";

-- Grant permissions to the recreated views
GRANT ALL ON TABLE "public"."view_item_location_summary" TO "anon";
GRANT ALL ON TABLE "public"."view_item_location_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."view_item_location_summary" TO "service_role";

GRANT ALL ON TABLE "public"."view_item_ownership_summary" TO "anon";
GRANT ALL ON TABLE "public"."view_item_ownership_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."view_item_ownership_summary" TO "service_role";