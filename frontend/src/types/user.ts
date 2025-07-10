import { User } from "@supabase/supabase-js";
import { Address } from "./address";
import { ErrorContext } from "./common";
import { Database } from "./supabase.types";

/**
 * User roles in the application
 * Used for permission control throughout the system
 */
export type UserRole =
  | "user"
  | "admin"
  | "main_admin"
  | "super_admin"
  | "superVera"
  | "storage_manager"
  | "requester";

export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

/**
 * User profile interface that represents a user in the system
 */ /* 
export interface UserProfile extends BaseEntity {
  role: UserRole;
  full_name?: string;
  visible_name?: string;
  phone?: string;
  email: string;
  saved_lists?: string[];
  preferences?: Record<string, string>;
  addresses?: Address[];
} */
export type FlatUserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  visible_name: string | null;
  phone: string | null;
  role: string | null; // or UserRole if that's validated elsewhere
  preferences: Record<string, string>; // coerced from Json
  saved_lists: string[]; // coerced from Json
  created_at: string | null;
};
/**
 * User state in Redux store
 */
export interface UserState {
  users: UserProfile[]; // Array of user profiles
  loading: boolean;
  error: string | null;
  errorContext: ErrorContext;
  selectedUser: UserProfile | null;
  selectedUserLoading?: boolean;
  selectedUserAddresses?: Address[];
}
export type CreateUserDto =
  Database["public"]["Tables"]["user_profiles"]["Insert"];
/**
 * Data required to create a new user
 */
/* export interface CreateUserDto {
  email: string;
  password: string;
  role: UserRole;
  full_name?: string;
  visible_name?: string;
  phone?: string;
  preferences?: Record<string, unknown>;
  saved_lists?: string[];
} */

/**
 * Data for updating an existing user
 */
export type UpdateUserDto = Partial<
  Omit<CreateUserDto, "id" | "created_at" | "updated_at">
>; // Exclude 'id', 'created_at', 'updated_at' from the update type.
