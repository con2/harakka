import { Controller, Get, Param, Req } from "@nestjs/common";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { RoleService } from "./role.service";
import { UserRoleWithDetails } from "./interfaces/role.interface";

@Controller("roles")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * GET /roles/current
   * Get all roles for the current authenticated user
   */
  @Get("current")
  getCurrentUserRoles(@Req() req: AuthRequest): UserRoleWithDetails[] {
    return this.roleService.getCurrentUserRoles(req);
  }

  /**
   * GET /roles/check/:roleName
   * Check if user has a specific role
   */
  @Get("check/:roleName")
  hasRole(
    @Param("roleName") roleName: string,
    @Req() req: AuthRequest,
  ): { hasRole: boolean; roleName: string } {
    const hasRole = this.roleService.hasRole(req, roleName);
    return { hasRole, roleName };
  }

  /**
   * GET /roles/check/:roleName/organization/:orgId
   * Check if user has a specific role in an organization
   */
  @Get("check/:roleName/organization/:orgId")
  hasRoleInOrganization(
    @Param("roleName") roleName: string,
    @Param("orgId") orgId: string,
    @Req() req: AuthRequest,
  ): { hasRole: boolean; roleName: string; organizationId: string } {
    const hasRole = this.roleService.hasRole(req, roleName, orgId);
    return { hasRole, roleName, organizationId: orgId };
  }

  /**
   * GET /roles/organizations
   * Get user's organizations and roles
   */
  @Get("organizations")
  getUserOrganizations(@Req() req: AuthRequest) {
    return this.roleService.getUserOrganizations(req);
  }

  /**
   * GET /roles/organization/:orgId
   * Get user's roles in a specific organization
   */
  @Get("organization/:orgId")
  getCurrentUserRolesInOrganization(
    @Param("orgId") orgId: string,
    @Req() req: AuthRequest,
  ): UserRoleWithDetails[] {
    return this.roleService.getCurrentUserRolesInOrganization(orgId, req);
  }

  /**
   * GET /roles/super-vera
   * Check if user is superVera (global admin)
   */
  @Get("super-vera")
  isSuperVera(@Req() req: AuthRequest): { isSuperVera: boolean } {
    const isSuperVera = this.roleService.isSuperVera(req);
    return { isSuperVera };
  }
}
