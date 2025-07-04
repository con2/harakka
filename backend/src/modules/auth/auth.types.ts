import { User } from "@supabase/supabase-js";

export interface CustomJWTPayload extends Omit<User, "app_metadata"> {
  app_metadata?: {
    roles?: string[];
    last_role_sync?: string;
  };
  exp: number;
  iat: number;
  [key: string]: unknown;
}
