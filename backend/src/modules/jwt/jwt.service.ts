import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "@supabase/supabase-js";
import { verify } from "jsonwebtoken";
import { UserRoleWithDetails } from "../role/interfaces/role.interface";
import { JWTPayload, JWTRole } from "./interfaces/jwt.interface";

@Injectable()
export class JwtService {
  private readonly logger = new Logger(JwtService.name);
  private readonly supabaseUrl: string;
  private readonly serviceRoleKey: string;
  private readonly jwtSecret: string;

  // Cache for JWT updates to prevent frequent updates
  private jwtUpdateCache = new Map<string, number>();

  constructor(private readonly config: ConfigService) {
    this.supabaseUrl = this.config.get<string>("SUPABASE_URL", "");
    this.serviceRoleKey = this.config.get<string>(
      "SUPABASE_SERVICE_ROLE_KEY",
      "",
    );
    this.jwtSecret = this.config.get<string>("SUPABASE_JWT_SECRET", "");

    if (!this.supabaseUrl || !this.serviceRoleKey || !this.jwtSecret) {
      throw new Error(
        "Supabase environment variables SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or SUPABASE_JWT_SECRET are missing",
      );
    }
  }

  /**
   * Update JWT with user roles (with caching)
   * Uses caching to prevent frequent updates
   */
  async updateJWTWithRoles(
    userId: string,
    userRoles: UserRoleWithDetails[],
  ): Promise<void> {
    const now = Date.now();
    const lastUpdate = this.jwtUpdateCache.get(userId);

    // Only update if we haven"t updated in the last 5 minutes (prevent spam)
    if (lastUpdate && now - lastUpdate < 300000) {
      this.logger.debug(
        `Skipping JWT update for user ${userId} - recently updated`,
      );
      return;
    }

    await this.performJWTUpdate(userId, userRoles, false);
  }

  /**
   * Force update JWT with user roles (bypasses cache)
   * Used when roles are explicitly modified via RoleService
   */
  async forceUpdateJWTWithRoles(
    userId: string,
    userRoles: UserRoleWithDetails[],
  ): Promise<void> {
    await this.performJWTUpdate(userId, userRoles, true);
  }

  /**
   * Verify and decode JWT token
   */
  verifyToken(token: string): JWTPayload {
    return verify(token, this.jwtSecret, {
      algorithms: ["HS256"],
    }) as JWTPayload;
  }

  /**
   * Analyze JWT contents for debugging
   */
  analyzeJWT(token: string, userId: string): void {
    try {
      const decoded = this.verifyToken(token);
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
          .map((r: JWTRole) => `${r.name}@${r.org_name}`)
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
   * Extract roles from JWT token
   */
  extractRolesFromToken(token: string, userId: string): UserRoleWithDetails[] {
    try {
      const decoded = this.verifyToken(token);

      if (!decoded.app_metadata?.roles?.length) {
        return [];
      }

      return decoded.app_metadata.roles.map((role: JWTRole) => ({
        id: role.id,
        user_id: userId,
        organization_id: role.org_id,
        role_id: role.role_id || null,
        role_name: role.name,
        organization_name: role.org_name,
        is_active: true,
        created_at: role.created_at || new Date().toISOString(),
      }));
    } catch (error) {
      this.logger.error(
        `Failed to extract roles from JWT for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  /**
   * Check if JWT has roles
   */
  hasRolesInJWT(token: string): boolean {
    try {
      const decoded = this.verifyToken(token);
      return decoded.app_metadata?.roles?.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Clear cache for a specific user (useful for testing or manual cache invalidation)
   */
  clearUserCache(userId: string): void {
    this.jwtUpdateCache.delete(userId);
    this.logger.debug(`Cleared JWT update cache for user ${userId}`);
  }

  /**
   * Get cache status for a user (useful for debugging)
   */
  getCacheStatus(userId: string): {
    lastUpdate: number | null;
    canUpdate: boolean;
  } {
    const lastUpdate = this.jwtUpdateCache.get(userId) || null;
    const now = Date.now();
    const canUpdate = !lastUpdate || now - lastUpdate >= 300000;

    return { lastUpdate, canUpdate };
  }

  /**
   * Internal method to perform the actual JWT update
   */
  private async performJWTUpdate(
    userId: string,
    userRoles: UserRoleWithDetails[],
    isForced: boolean,
  ): Promise<void> {
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

      // Update user"s app_metadata
      const { error } = await adminSupabase.auth.admin.updateUserById(userId, {
        app_metadata: {
          roles: jwtRoles,
          role_count: jwtRoles.length,
          last_role_sync: new Date().toISOString(),
        },
      });

      if (error) {
        this.logger.error(
          `Failed to ${isForced ? "force " : ""}update JWT metadata for user ${userId}: ${error.message}`,
        );
        throw new Error(`JWT update failed: ${error.message}`);
      }

      // Update cache to reflect the update
      this.jwtUpdateCache.set(userId, Date.now());

      this.logger.log(
        `🔄 ${isForced ? "Force " : ""}Updated JWT for user ${userId} with ${jwtRoles.length} roles`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to ${isForced ? "force " : ""}update JWT metadata for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
