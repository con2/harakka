import type { Database } from "../../../../../common/database.types";

/* ── Supabase row helpers ─────────────────────────────────────────────── */

/** Base row as stored in the database (all columns, non-nullable as PostgREST reports) */
export type ItemImageRow =
  Database["public"]["Tables"]["storage_item_images"]["Row"];

/** Shape accepted on insert — Supabase-generated, all optional except PK and required columns */
export type ItemImageInsert =
  Database["public"]["Tables"]["storage_item_images"]["Insert"];

/** Shape accepted on update (all columns optional) */
export type ItemImageUpdate =
  Database["public"]["Tables"]["storage_item_images"]["Update"];

/**
 * URL: "http://my-database.fi/bucket/my-example-file.png"
 * FULL PATH: "bucket/my-example-file.png"
 * PATH: "my-example-file.png"
 */
export type BucketUploadResult = {
  urls: string[];
  full_paths: string[];
  paths: string[];
};
