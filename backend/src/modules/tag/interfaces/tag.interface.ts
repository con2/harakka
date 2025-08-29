import { Database } from "@common/database.types";

// These types are easily generated from the Supabase schema so we dont have to manually define them.
export type TagRow = Database["public"]["Tables"]["tags"]["Row"];
export type TagUpdate = Database["public"]["Tables"]["tags"]["Update"];
export type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];

export type ExtendedTag =
  Database["public"]["Views"]["view_tag_popularity"]["Row"];
