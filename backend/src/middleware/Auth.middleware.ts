import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "@supabase/supabase-js";
// import type { Database } from "../types/supabase.types";
import { Request, Response, NextFunction } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import { AuthRequest } from "./interfaces/auth-request.interface";
import { JwtService } from "../modules/jwt/jwt.service";
import { JWTPayload } from "../modules/jwt/interfaces/jwt.interface";
import { ViewUserRolesWithDetails } from "@common/role.types";
import type { Database } from "@common/supabase.types";

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
  private readonly serviceRoleKey: string | null;
  private readonly logger = new Logger(AuthMiddleware.name);

  // Cache for reducing authentication logging noise
  private lastAuthLog = new Map<
    string,
    { roleSignature: string; timestamp: number }
  >();

  // Cache to avoid hitting the DB on every request when checking for role drift
  private lastRoleCheck = new Map<
    string,
    { signature: string; timestamp: number }
  >();

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.supabaseUrl = this.config.get<string>("SUPABASE_URL", "");
    this.anonKey = this.config.get<string>("SUPABASE_ANON_KEY", "");
    this.serviceRoleKey =
      this.config.get<string>("SUPABASE_SERVICE_ROLE_KEY", "") || null;

    if (!this.supabaseUrl || !this.anonKey) {
      throw new Error(
        "Supabase environment variables SUPABASE_URL, SUPABASE_ANON_KEY are missing",
      );
    }
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
      let payload: JWTPayload;
      try {
        payload = this.jwtService.verifyToken(token);

        // Validate essential JWT claims
        if (!payload.sub || !payload.aud || !payload.exp) {
          throw new UnauthorizedException("Invalid token payload");
        }

        // Validate expiration manually (additional safety)
        if (Date.now() >= payload.exp * 1000) {
          throw new UnauthorizedException("Token has expired");
        }
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

      // Extract roles from JWT first (fast path)
      let userRoles = this.jwtService.extractRolesFromToken(token, user.id);

      // Decide if we should cross-check against DB to correct drift
      // Conditions:
      //  - JWT has no roles, or
      //  - we haven't checked in a while (3 minutes), to catch out-of-band updates
      const now = Date.now();
      const jwtSignature = this.createRoleSignature(userRoles);
      // Include token "iat" in cache key so we always re-check once per new login
      const roleCacheKey = `${user.id}:${payload.iat}`;
      const lastCheck = this.lastRoleCheck.get(roleCacheKey);
      const shouldCheckDb =
        userRoles.length === 0 ||
        !lastCheck ||
        now - lastCheck.timestamp > 3 * 60 * 1000; // 3 minutes

      let _updated = false;
      let versionForHeader: string | undefined = (
        user.app_metadata as Record<string, unknown>
      )?.["last_role_sync"] as string | undefined;

      if (shouldCheckDb) {
        try {
          // Query authoritative roles from DB.
          // Prefer a service-role client to bypass any RLS quirks while restricting
          // to the caller's verified user id.
          const reader = this.serviceRoleKey
            ? createClient<Database>(this.supabaseUrl, this.serviceRoleKey)
            : supabase;
          const { data: freshRoles, error: rolesError } = await reader
            .from("view_user_roles_with_details")
            .select("*")
            .eq("user_id", user.id);

          if (!rolesError && freshRoles) {
            const dbSignature = this.createRoleSignature(freshRoles);
            // If drift detected (including empty-JWT case), update JWT metadata and use DB roles for this request
            if (dbSignature !== jwtSignature) {
              await this.jwtService.forceUpdateJWTWithRoles(
                user.id,
                freshRoles,
              );
              userRoles = freshRoles;
              _updated = true;
              versionForHeader = new Date().toISOString();
            }

            // Update local check cache regardless to reduce DB reads
            this.lastRoleCheck.set(roleCacheKey, {
              signature: dbSignature,
              timestamp: now,
            });
          } else if (rolesError) {
            this.logger.warn(
              `Role self-heal DB check failed for user ${user.id}: ${rolesError.message}`,
            );
          }
        } catch (e) {
          this.logger.warn(
            `Role self-heal encountered an error for user ${user.id}: ${e instanceof Error ? e.message : String(e)}`,
          );
        }
      }

      // JWT status log
      if (this.shouldLogAuth(user.id, userRoles)) {
        const roleNames = userRoles
          .map((role) => `${role.role_name}@${role.organization_name}`)
          .join(", ");

        this.logger.log(
          `🔐 Authentication successful for user ${user.id} (${user.email}) via JWT with roles: [${roleNames}]`,
        );
      }

      req.supabase = supabase;
      req.user = user;
      req.userRoles = userRoles;
      // Also patch the in-request user.app_metadata so Guards relying on it see the corrected roles
      try {
        req.user.app_metadata = {
          ...(req.user.app_metadata || {}),
          roles: userRoles,
          role_count: userRoles.length,
          last_role_sync:
            versionForHeader ?? req.user.app_metadata?.last_role_sync,
        };
      } catch {
        // Non-fatal; continue with req.userRoles for downstream services
      }
      // Extract x-org-id and x-role-name from headers (frontend activeContext) and attach them to the request object for downstream use.
      req.activeRoleContext = {
        organizationId: req.headers["x-org-id"] as string | undefined,
        roleName: req.headers["x-role-name"] as string | undefined,
      };
      this.logger.debug(
        `ActiveRoleContext: orgId=${req.activeRoleContext.organizationId}, roleName=${req.activeRoleContext.roleName}`,
      );

      // After roles are attached to req, add role version header
      // Prefer the newly generated version if we performed a self-heal this request
      const headerVersion =
        versionForHeader || req.user?.app_metadata?.last_role_sync;
      if (headerVersion) {
        _res.setHeader("x-role-version", headerVersion);
      }

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
   * Authentication logging with JWT analysis
   */
  private shouldLogAuth(
    userId: string,
    roles: ViewUserRolesWithDetails[],
  ): boolean {
    const now = Date.now();
    const roleSignature = this.createRoleSignature(roles);
    const cached = this.lastAuthLog.get(userId);

    if (
      !cached ||
      cached.roleSignature !== roleSignature ||
      now - cached.timestamp > 300000
    ) {
      this.lastAuthLog.set(userId, { roleSignature, timestamp: now });
      return true;
    }

    return false;
  }

  /**
   * Create a stable signature string for a set of roles
   */
  private createRoleSignature(roles: ViewUserRolesWithDetails[]): string {
    return roles
      .map(
        (r) =>
          `${r.role_name ?? ""}@${r.organization_id ?? ""}#${r.is_active ? 1 : 0}`,
      )
      .sort()
      .join(",");
  }

  /**
   * Extract a JWT from either the Authorization header
   * (`Authorization: Bearer <token>`) or the `sb-access-token`
   * cookie that Supabase SSR helpers set. Returns `null`
   * when neither is present.
   */
  private extractToken(req: Request): string | null {
    // Try Authorization header first
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      return header.slice(7);
    }

    // Try cookie as fallback with explicit type assertion and validation
    const cookies = req.cookies as Record<string, unknown> | undefined;
    const cookieValue = cookies?.["sb-access-token"];

    return typeof cookieValue === "string" ? cookieValue : null;
  }
}
