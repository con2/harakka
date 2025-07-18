import { User } from "@supabase/supabase-js";
import { ViewUserRolesWithDetails } from "@common/role.types";

export interface JWTPayload extends Omit<User, "app_metadata"> {
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  email?: string;
  app_metadata?: {
    roles?: ViewUserRolesWithDetails[];
    role_count?: number;
    last_role_sync?: string;
  };
}
