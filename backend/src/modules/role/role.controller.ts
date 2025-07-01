import {
  Controller,
  Get,
  Req,
  Param,
  BadRequestException,
} from "@nestjs/common";
import { RoleService } from "./role.service";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { UserRoleWithDetails } from "./interfaces/role.interface";

@Controller("roles")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * Get all roles for the current authenticated user across all organizations
   */
  @Get("my-roles")
  getMyRoles(@Req() req: AuthRequest): UserRoleWithDetails[] {
    return this.roleService.getCurrentUserRoles(req);
  }

  /**
   * Get current user's roles in a specific organization
   */
  @Get("my-roles/:organizationId")
  getMyRolesInOrganization(
    @Param("organizationId") organizationId: string,
    @Req() req: AuthRequest,
  ): UserRoleWithDetails[] {
    if (!organizationId) {
      throw new BadRequestException("Organization ID is required");
    }

    return this.roleService.getCurrentUserRolesInOrganization(
      organizationId,
      req,
    );
  }

  /**
   * Get user organizations with their roles
   */
  @Get("my-organizations")
  getMyOrganizations(@Req() req: AuthRequest): Array<{
    organization_id: string;
    organization_name: string;
    roles: string[];
  }> {
    return this.roleService.getUserOrganizations(req);
  }
}
