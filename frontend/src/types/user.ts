import { UserProfile } from "@common/user.types";
import { Address } from "./address";
import { ErrorContext } from "./common";

/**
 * User state in Redux store
 */
import { ApiResponse } from "./api";

export interface UserState {
  users: ApiResponse<UserProfile[]>; // Paginated user response
  loading: boolean;
  error: string | null;
  errorContext: ErrorContext;
  selectedUser: UserProfile | null;
  selectedUserLoading?: boolean;
  selectedUserAddresses?: Address[];
  userCount: number;
}
