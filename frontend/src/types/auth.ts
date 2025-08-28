import { ViewUserRolesWithDetails } from "@common/role.types";
import { User } from "@supabase/supabase-js";

// User setup related types
export interface UserSetupPayload {
  userId: string;
  email: string;
  full_name?: string;
  phone?: string;
  visible_name?: string;
  provider?: string;
}

export interface UserSetupResponse {
  success: boolean;
  userProfile?: unknown;
  error?: string;
}

export interface UserSetupStatus {
  hasProfile: boolean;
  hasRole: boolean;
  needsSetup: boolean;
  profile?: unknown;
}

// Authentication result types
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  isNewUser?: boolean;
}

// Signup method types
export type SignupMethod = "email" | "oauth";

// Provider types for better type safety
export type AuthProvider = "email" | "google" | "oauth";

// User profile data extraction
export interface ExtractedUserData {
  email: string;
  full_name?: string;
  phone?: string;
  visible_name?: string;
  provider: AuthProvider;
}

// JWT payload structure for roles
export interface JWTRolePayload {
  app_metadata?: {
    roles?: ViewUserRolesWithDetails[];
    role_count?: number;
    last_role_sync?: string;
  };
}

export const SUPPORTED_PROVIDERS: Record<AuthProvider, string> = {
  email: "Email/Password",
  google: "Google OAuth",
  oauth: "OAuth Provider",
} as const;
