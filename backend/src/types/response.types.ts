import { PostgrestError } from "@supabase/supabase-js";

export type PostgresResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};
