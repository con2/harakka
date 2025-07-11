import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* Disable ESLint for this file to allow metadata to be any-type*/

export type ApiResponse<T> = PostgrestResponse<T> & {
  metadata?: any;
};

export type ApiSingleResponse<T> = PostgrestSingleResponse<T> & {
  metadata?: any;
};
