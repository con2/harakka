import { Database } from "./supabase.types"

export type CreateUserDto =
  Database["public"]["Tables"]["user_profiles"]["Insert"] & {
    password: string; // Password is required for creating a new user
  };

export type UpdateUserDto =
  Database["public"]["Tables"]["user_profiles"]["Update"] & {
    id: string; // Ensure the ID is included for updates
  };

export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

export type UserAddress = Database["public"]["Tables"]["user_addresses"]["Row"];