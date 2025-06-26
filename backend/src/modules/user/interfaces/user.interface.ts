import { Database } from "src/types/supabase.types";

/**
 * @description Here are the proper Supabase types we should be using accross the backend for
 * clear types that change when we change our tables.
 * Click the "Row" type to see the database schema.
 * This type represents a single row in the user_profiles table.
 */
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type UserAddress = Database["public"]["Tables"]["user_addresses"]["Row"];
