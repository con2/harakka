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
  private readonly logger = new Logger(AuthMiddleware.name);

  // Cache for reducing authentication logging noise
  private lastAuthLog = new Map<
    string,
    { roleSignature: string; timestamp: number }
  >();

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.supabaseUrl = this.config.get<string>("SUPABASE_URL", "");
    this.anonKey = this.config.get<string>("SUPABASE_ANON_KEY", "");

    if (!this.supabaseUrl || !this.anonKey) {
      throw new Error(
        "Supabase environment variables SUPABASE_URL, SUPABASE_ANON_KEY are missing",
      );
    }
  }

  async use(req: AuthRequest, _res: Response, next: NextFunction) {
    // Allow CORS preflight without authentication
    if (req.method === "OPTIONS") {
      return next();
    }
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

      // Try local decode for quick claim inspection (no signature verification).
      // We rely on Supabase auth.getUser below for authoritative verification,
      // which supports both HS256 and RS256 projects seamlessly.
      let payload: JWTPayload | null = null;
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        }
      } catch {
        // Non-fatal: continue, Supabase will validate the token next
        payload = null;
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

      // Extract roles directly from verified Supabase user metadata (preferred)
      const userRoles = (user.app_metadata?.roles ?? []) as ViewUserRolesWithDetails[];

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
      // Extract x-org-id and x-role-name from headers (frontend activeContext) and attach them to the request object for downstream use.
      req.activeRoleContext = {
        organizationId: req.headers["x-org-id"] as string | undefined,
        roleName: req.headers["x-role-name"] as string | undefined,
      };
      this.logger.debug(
        `ActiveRoleContext: orgId=${req.activeRoleContext.organizationId}, roleName=${req.activeRoleContext.roleName}`,
      );

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
    const roleSignature = roles
      .map((r) => `${r.role_name}@${r.organization_name}`)
      .sort()
      .join(",");
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
