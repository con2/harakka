import { UserProfile } from "../../../common/user.types";
import { Address } from "./address";
import { ErrorContext } from "./common";

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
