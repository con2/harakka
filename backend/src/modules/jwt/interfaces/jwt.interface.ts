export interface JWTRole {
  id: string;
  name: string;
  org_id: string;
  org_name: string;
  role_id: string | null;
  created_at: string;
}

export interface JWTPayload {
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  email?: string;
  app_metadata?: {
    roles?: JWTRole[];
    role_count?: number;
    last_role_sync?: string;
  };
  user_metadata?: Record<string, unknown>;
}
