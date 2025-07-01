import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "src/types/supabase.types";
import { Request, Response, NextFunction } from "express";
import { verify, TokenExpiredError } from "jsonwebtoken";
import { AuthRequest } from "./interfaces/auth-request.interface";
import { UserRoleWithDetails } from "../modules/role/interfaces/role.interface";

/**
 * AuthMiddleware
 *
 * Responsibilities:
 * 1. Extract the JWT from the Authorization header or `sb-access-token` cookie.
 * 2. Verify the token's signature and expiry locally using SUPABASE_JWT_SECRET.
 * 3. Create a per‑request Supabase client (anon key + Bearer token) so that
 *    Row‑Level Security policies apply to every query.
 * 4. Fetch and attach user roles to the request context.
 * 5. Attach `supabase`, `user` and `userRoles` to the request for downstream use.
 *
 * NOTE: No role/permission checks are performed here; We can create a guard for those admin endpoints.
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly supabaseUrl: string;
  private readonly anonKey: string;
  private readonly jwtSecret: string;
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(private readonly config: ConfigService) {
    this.supabaseUrl = this.config.get<string>("SUPABASE_URL", "");
    this.anonKey = this.config.get<string>("SUPABASE_ANON_KEY", "");
    const secret = this.config.get<string>("SUPABASE_JWT_SECRET", "");
    if (!this.supabaseUrl || !this.anonKey || !secret) {
      throw new Error(
        "Supabase environment variables SUPABASE_URL, SUPABASE_ANON_KEY, or SUPABASE_JWT_SECRET are missing",
      );
    }
    this.jwtSecret = secret;
  }

  async use(req: AuthRequest, _res: Response, next: NextFunction) {
    this.logger.log(
      `[${new Date().toISOString()}] Authenticating request to: ${req.method} ${req.path}`,
    );

    try {
      const token = this.extractToken(req);
      if (!token) {
        this.logger.warn(
          `[${new Date().toISOString()}] Authentication failed: Missing access token`,
        );
        throw new UnauthorizedException("Missing access token");
      }

      // Local signature/expiry verification (fast)
      try {
        verify(token, this.jwtSecret, { algorithms: ["HS256"] });
      } catch (verifyErr) {
        if (verifyErr instanceof TokenExpiredError) {
          this.logger.warn(
            `[${new Date().toISOString()}] Authentication failed: Session expired`,
          );
          throw new UnauthorizedException(
            "Session expired - please log in again",
          );
        }
        this.logger.warn(
          `[${new Date().toISOString()}] Authentication failed: Invalid signature`,
        );
        throw new UnauthorizedException("Invalid or expired token");
      }

      // Create a user‑scoped Supabase client (RLS applies)
      const supabase = createClient<Database>(this.supabaseUrl, this.anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false },
      });

      // Fetch full user profile
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        // Error handling for invalid or expired tokens
        if (error?.code === "ERR_JWT_EXPIRED") {
          throw new UnauthorizedException(
            "Session expired - please log in again",
          );
        }
        this.logger.warn(
          `[${new Date().toISOString()}] Authentication failed: Invalid or expired token`,
        );
        throw new UnauthorizedException("Invalid or expired token");
      }

      // Fetch user roles and enrich the request
      const userRoles = await this.fetchUserRoles(user.id, supabase);

      this.logger.log(
        `[${new Date().toISOString()}] Authentication successful for user ID: ${user.id} Email: ${user.email} with ${userRoles.length} role(s)`,
      );

      req.supabase = supabase;
      req.user = user;
      req.userRoles = userRoles;

      return next();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error(
        `[${new Date().toISOString()}] Authentication error: ${error.message}`,
      );
      throw new UnauthorizedException("Unauthorized: " + error.message);
    }
  }

  /**
   * Extract a JWT from either the Authorization header
   * (`Authorization: Bearer <token>`) or the `sb-access-token`
   * cookie that Supabase SSR helpers set. Returns `null`
   * when neither is present.
   */
  private extractToken(req: Request): string | null {
    const header = req.headers.authorization;
    return header?.startsWith("Bearer ") ? header.slice(7) : null;
  }

  /**
   * Fetch user roles across organizations and inject into request context
   */
  private async fetchUserRoles(
    userId: string,
    supabase: SupabaseClient<Database>,
  ): Promise<UserRoleWithDetails[]> {
    try {
      // Fetch user roles with organizations and role details
      const { data, error } = await supabase
        .from("user_organization_roles")
        .select(
          `
          id,
          user_id,
          organization_id,
          role_id,
          is_active,
          created_at,
          roles!inner(
            id,
            role
          ),
          organizations!inner(
            id,
            name,
            slug
          )
        `,
        )
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        this.logger.error(`Failed to fetch user roles: ${error.message}`);
        return [];
      }

      if (!data || data.length === 0) {
        this.logger.warn(`No active roles found for user: ${userId}`);
        return [];
      }

      return data.map(
        (item): UserRoleWithDetails => ({
          id: item.id,
          user_id: item.user_id,
          organization_id: item.organization_id,
          role_id: item.role_id,
          role_name: String(item.roles.role),
          organization_name: item.organizations.name,
          is_active: item.is_active ?? true,
          created_at: item.created_at ?? undefined,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Error fetching user roles: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }
}
