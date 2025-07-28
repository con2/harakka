import { UserProfile } from "@common/user.types";
import { Address } from "./address";
import { ErrorContext } from "./common";

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
  userCount: number;
}
