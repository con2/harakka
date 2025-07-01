import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";

/**
 * Option B: Using supabase types
 */
export type ApiResponse<T> = PostgrestResponse<T>;
export type ApiSingleResponse<T> = PostgrestSingleResponse<T>;
