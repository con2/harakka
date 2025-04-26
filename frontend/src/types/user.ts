import { BaseEntity, ErrorContext } from "./common";

/**
 * User roles in the application
 * Used for permission control throughout the system
 */
export type UserRole = "user" | "admin" | "superVera";

/**
 * User profile interface that represents a user in the system
 */
export interface UserProfile extends BaseEntity {
  role: UserRole;
  full_name?: string;
  visible_name?: string;
  phone?: string;
  email: string;
  saved_lists?: string[];
  preferences?: Record<string, string>;
}

/**
 * User state in Redux store
 */
export interface UserState {
  users: UserProfile[];
  loading: boolean;
  error: string | null;
  errorContext: ErrorContext;
  selectedUser: UserProfile | null;
  selectedUserLoading?: boolean;
}

/**
 * Data required to create a new user
 */
export interface CreateUserDto {
  email: string;
  password: string;
  role: UserRole;
  full_name?: string;
  visible_name?: string;
  phone?: string;
  preferences?: Record<string, unknown>;
  saved_lists?: string[];
}

/**
 * Data for updating an existing user
 */
export type UpdateUserDto = Partial<
  Omit<CreateUserDto, "id" | "created_at" | "updated_at">
>; // Exclude 'id', 'created_at', 'updated_at' from the update type.
