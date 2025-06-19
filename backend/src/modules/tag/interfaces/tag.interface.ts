import { Database } from "src/types/supabase.types";

// These types are easily generated from the Supabase schema so we dont have to manually define them.
export type TagRow = Database["public"]["Tables"]["tags"]["Row"];
export type TagUpdate = Database["public"]["Tables"]["tags"]["Update"];
