import { Database } from "src/types/supabase.types";

export type StorageLocation =
  Database["public"]["Tables"]["storage_locations"]["Row"];
