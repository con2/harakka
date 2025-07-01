import { Injectable, Logger } from "@nestjs/common";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { UserRoleWithDetails } from "./interfaces/role.interface";

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  /**
   * Get all active roles for the current authenticated user
   * Uses roles already fetched and attached to request by AuthMiddleware
   */
  getCurrentUserRoles(req: AuthRequest): UserRoleWithDetails[] {
    const userId = req.user.id;

    this.logger.log(
      `Returning ${req.userRoles.length} roles for user: ${userId}`,
    );

    return req.userRoles;
  }

  /**
   * Check if user has specific role in organization
   */
  hasRole(
    req: AuthRequest,
    roleName: string,
    organizationId?: string,
  ): boolean {
    return req.userRoles.some((role) => {
      const roleMatch = role.role_name === roleName;
      const orgMatch = organizationId
        ? role.organization_id === organizationId
        : true;
      return roleMatch && orgMatch;
    });
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(
    req: AuthRequest,
    roleNames: string[],
    organizationId?: string,
  ): boolean {
    return roleNames.some((roleName) =>
      this.hasRole(req, roleName, organizationId),
    );
  }

  /**
   * Check if user is superVera (global admin)
   */
  isSuperVera(req: AuthRequest): boolean {
    return req.userRoles.some((role) => role.role_name === "superVera");
  }

  /**
   * Get user organizations from request context
   */
  getUserOrganizations(req: AuthRequest): Array<{
    organization_id: string;
    organization_name: string;
    roles: string[];
  }> {
    const orgMap = new Map<
      string,
      {
        organization_id: string;
        organization_name: string;
        roles: string[];
      }
    >();

    req.userRoles.forEach((role) => {
      const orgId = role.organization_id;
      if (!orgMap.has(orgId)) {
        orgMap.set(orgId, {
          organization_id: orgId,
          organization_name: role.organization_name,
          roles: [],
        });
      }
      const org = orgMap.get(orgId);
      if (org) {
        org.roles.push(role.role_name);
      }
    });

    return Array.from(orgMap.values());
  }

  /**
   * Get user's roles in a specific organization
   */
  getCurrentUserRolesInOrganization(
    organizationId: string,
    req: AuthRequest,
  ): UserRoleWithDetails[] {
    return req.userRoles.filter(
      (role) => role.organization_id === organizationId,
    );
  }
}
