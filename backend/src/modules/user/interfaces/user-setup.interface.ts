import { Database } from "@common/supabase.types";

// Type alias for better readability
export type UserProfileInsert =
  Database["public"]["Tables"]["user_profiles"]["Insert"];

export interface SetupUserRequest {
  userId: string;
  email: string;
  full_name?: string;
  phone?: string;
  visible_name?: string;
  provider?: string;
}

export interface SetupUserResponse {
  success: boolean;
  userProfile?: UserProfileInsert;
  error?: string;
}

export interface UserSetupStatus {
  hasProfile: boolean;
  hasRole: boolean;
  needsSetup: boolean;
  profile?: UserProfileInsert;
}

export class CreateUserProfileDto {
  userId: string;
  email: string;
  full_name?: string;
  phone?: string;
  visible_name?: string;
  provider?: string;
}
