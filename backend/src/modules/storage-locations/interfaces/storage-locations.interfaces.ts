import { Database } from "src/types/supabase.types";

export type LocationRow =
  Database["public"]["Tables"]["storage_locations"]["Row"];
