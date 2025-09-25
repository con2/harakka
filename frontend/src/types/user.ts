import { UserProfile } from "@common/user.types";
import { Address } from "./address";
import { ErrorContext } from "./common";
import { ApiResponse } from "./api";

// Params accepted by the /users/ordered endpoint
export type OrderedUsersParams = Partial<{
  page: number;
  limit: number;
  ordered_by: string;
  ascending: boolean;
  searchquery: string;
  org_filter: string;
  selected_role: string;
}>;

/**
 * User state in Redux store
 */
export interface UserState {
  users: ApiResponse<UserProfile[]>; // Paginated user response
  loading: boolean;
  error: string | null;
  errorContext: ErrorContext | null;
  selectedUser: UserProfile | null;
  selectedUserLoading?: boolean;
  selectedUserAddresses?: Address[];
  userCount: number;
  usersList?: ApiResponse<Pick<UserProfile, "id" | "full_name" | "email">[]>;
}
