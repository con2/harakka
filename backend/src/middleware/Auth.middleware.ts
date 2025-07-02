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
 * 4. Fetch and attach user roles to the request context (with JWT optimization).
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
  private readonly serviceRoleKey: string;

  // Cache for reducing authentication logging noise
  private lastAuthLog = new Map<
    string,
    { roles: string[]; timestamp: number }
  >();

  // Cache for JWT updates to prevent frequent updates
  private jwtUpdateCache = new Map<string, number>();

  constructor(private readonly config: ConfigService) {
    this.supabaseUrl = this.config.get<string>("SUPABASE_URL", "");
    this.anonKey = this.config.get<string>("SUPABASE_ANON_KEY", "");
    this.serviceRoleKey = this.config.get<string>(
      "SUPABASE_SERVICE_ROLE_KEY",
      "",
    );
    const secret = this.config.get<string>("SUPABASE_JWT_SECRET", "");

    if (!this.supabaseUrl || !this.anonKey || !secret || !this.serviceRoleKey) {
      throw new Error(
        "Supabase environment variables SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, or SUPABASE_JWT_SECRET are missing",
      );
    }
    this.jwtSecret = secret;
  }

  async use(req: AuthRequest, _res: Response, next: NextFunction) {
    // Use debug level for routine request logging to reduce noise
    this.logger.debug(`Authenticating request to: ${req.method} ${req.path}`);

    try {
      const token = this.extractToken(req);
      if (!token) {
        this.logger.warn(
          `Authentication failed: Missing access token for ${req.method} ${req.path}`,
        );
        throw new UnauthorizedException("Missing access token");
      }

      // Local signature/expiry verification + decode payload
      let decoded: any;
      try {
        decoded = verify(token, this.jwtSecret, { algorithms: ["HS256"] });
      } catch (verifyErr) {
        if (verifyErr instanceof TokenExpiredError) {
          this.logger.warn(
            `Authentication failed: Session expired for ${req.method} ${req.path}`,
          );
          throw new UnauthorizedException(
            "Session expired - please log in again",
          );
        }
        this.logger.warn(
          `Authentication failed: Invalid signature for ${req.method} ${req.path}`,
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
          `Authentication failed: Invalid or expired token for ${req.method} ${req.path}`,
        );
        throw new UnauthorizedException("Invalid or expired token");
      }

      // Log JWT contents for debugging - Logger handles level filtering
      this.logJWTContents(token, user.id);

      // Try to get roles from JWT first, fallback to database
      let userRoles: UserRoleWithDetails[];
      let roleSource: string;
      let shouldUpdateJWT = false;

      if (decoded.app_metadata?.roles?.length > 0) {
        // Use roles from JWT (fast path)
        userRoles = decoded.app_metadata.roles.map((role: any) => ({
          id: role.id,
          user_id: user.id,
          organization_id: role.org_id,
          role_id: role.role_id || null,
          role_name: role.name,
          organization_name: role.org_name,
          is_active: true,
          created_at: role.created_at || new Date().toISOString(),
        }));

        roleSource = "JWT";
        this.logger.debug(
          `✅ PERFORMANCE: Using ${userRoles.length} roles from JWT for user ${user.id}`,
        );
      } else {
        // Fallback to database fetch
        userRoles = await this.fetchUserRoles(user.id, supabase);
        roleSource = "DATABASE";
        shouldUpdateJWT = true;

        this.logger.debug(
          `⚠️ FALLBACK: Fetched ${userRoles.length} roles from database for user ${user.id}`,
        );

        // Update JWT with roles for future requests (async, non-blocking)
        if (userRoles.length > 0) {
          this.updateJWTWithRoles(user.id, userRoles).catch((error) => {
            this.logger.error(
              `Failed to update JWT with roles for user ${user.id}: ${error}`,
            );
          });
        }
      }

      // Enhanced logging with JWT status
      if (this.shouldLogAuth(user.id, userRoles)) {
        const roleNames = userRoles
          .map((role) => `${role.role_name}@${role.organization_name}`)
          .join(", ");

        const jwtStatus = shouldUpdateJWT
          ? "(JWT will be updated for future requests)"
          : "(JWT already optimized)";

        this.logger.log(
          `🔐 Authentication successful for user ${user.id} (${user.email}) via ${roleSource} with roles: [${roleNames}] ${jwtStatus}`,
        );
      }

      req.supabase = supabase;
      req.user = user;
      req.userRoles = userRoles;

      return next();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error(
        `Authentication error for ${req.method} ${req.path}: ${error.message}`,
      );
      throw new UnauthorizedException("Unauthorized: " + error.message);
    }
  }

  /**
   * Update JWT with user roles (async)
   * Uses caching to prevent frequent updates
   */
  private async updateJWTWithRoles(
    userId: string,
    userRoles: UserRoleWithDetails[],
  ): Promise<void> {
    const now = Date.now();
    const lastUpdate = this.jwtUpdateCache.get(userId);

    // Only update if we haven't updated in the last 5 minutes (prevent spam)
    if (lastUpdate && now - lastUpdate < 300000) {
      this.logger.debug(
        `Skipping JWT update for user ${userId} - recently updated`,
      );
      return;
    }

    try {
      // Create service role client for admin operations
      const adminSupabase = createClient(this.supabaseUrl, this.serviceRoleKey);

      // Transform roles for JWT storage
      const jwtRoles = userRoles.map((role) => ({
        id: role.id,
        name: role.role_name,
        org_id: role.organization_id,
        org_name: role.organization_name,
        role_id: role.role_id,
        created_at: role.created_at,
      }));

      // Update user's app_metadata
      const { data, error } = await adminSupabase.auth.admin.updateUserById(
        userId,
        {
          app_metadata: {
            roles: jwtRoles,
            role_count: jwtRoles.length,
            last_role_sync: new Date().toISOString(),
          },
        },
      );

      if (error) {
        throw new Error(`Supabase admin update failed: ${error.message}`);
      }

      // Cache the update timestamp
      this.jwtUpdateCache.set(userId, now);

      // Enhanced logging with token information
      if (data?.user) {
        // Get fresh token for the user (this requires a login to see)
        this.logger.log(
          `🔄 JWT updated with ${jwtRoles.length} roles for user ${userId}`,
        );

        // Log the role details that were added to JWT
        const roleDetails = jwtRoles
          .map((role) => `${role.name}@${role.org_name}`)
          .join(", ");
        this.logger.debug(`📝 Roles added to JWT: [${roleDetails}]`);

        // Log when the JWT metadata was last synced
        this.logger.debug(
          `🕒 JWT metadata sync timestamp: ${new Date().toISOString()}`,
        );

        // Helpful message for testing
        this.logger.log(
          `✨ To test JWT optimization: Get fresh token via login endpoint - next requests will use JWT path`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to update JWT metadata for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Enhanced authentication logging with JWT analysis
   */
  private shouldLogAuth(userId: string, roles: UserRoleWithDetails[]): boolean {
    const now = Date.now();
    const roleSignature = roles
      .map((r) => `${r.role_name}@${r.organization_name}`)
      .sort()
      .join(",");
    const cached = this.lastAuthLog.get(userId);

    if (
      !cached ||
      cached.roles.join(",") !== roleSignature ||
      now - cached.timestamp > 300000
    ) {
      this.lastAuthLog.set(userId, { roles: [roleSignature], timestamp: now });
      return true;
    }

    return false;
  }

  /**
   * Add method to decode and log JWT contents for debugging
   */
  private logJWTContents(token: string, userId: string): void {
    try {
      const decoded = verify(token, this.jwtSecret, {
        algorithms: ["HS256"],
      }) as any;

      const hasRoles = decoded.app_metadata?.roles?.length > 0;
      const roleCount = decoded.app_metadata?.roles?.length || 0;
      const lastSync = decoded.app_metadata?.last_role_sync;

      this.logger.debug(
        `🔍 JWT Analysis for user ${userId}:
        - Has roles in JWT: ${hasRoles}
        - Role count: ${roleCount}
        - Last sync: ${lastSync || "Never"}
        - Will use: ${hasRoles ? "JWT path (fast)" : "Database fallback (slower)"}`,
      );

      if (hasRoles) {
        const roleNames = decoded.app_metadata.roles
          .map((r: any) => `${r.name}@${r.org_name}`)
          .join(", ");
        this.logger.debug(`📋 JWT Roles: [${roleNames}]`);
      }
    } catch (error) {
      this.logger.debug(
        `Failed to analyze JWT for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
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
   * Fetch user roles from database (fallback method)
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

  /**
   * Public method to manually trigger JWT update (for use in role management)
   */
  public async syncUserRolesToJWT(userId: string): Promise<void> {
    const supabase = createClient<Database>(this.supabaseUrl, this.anonKey);
    const userRoles = await this.fetchUserRoles(userId, supabase);
    await this.updateJWTWithRoles(userId, userRoles);
  }
}
