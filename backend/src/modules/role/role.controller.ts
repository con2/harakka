import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Req,
  Body,
} from "@nestjs/common";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { RoleService } from "./role.service";
import { ViewUserRolesWithDetails } from "@common/role.types";
import { CreateUserRoleDto, UpdateUserRoleDto } from "./dto/role.dto";
import { Roles } from "@src/decorators/roles.decorator";

@Controller("roles")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * GET /roles/current
   * Get all roles for the current authenticated user
   */
  @Get("current")
  @Roles(
    ["user", "requester", "storage_manager", "tenant_admin", "super_admin"],
    {
      match: "any",
    },
  )
  getCurrentUserRoles(@Req() req: AuthRequest): ViewUserRolesWithDetails[] {
    return this.roleService.getCurrentUserRoles(req);
  }

  /**
   * GET /roles/check/:roleName
   * Check if user has a specific role
   */
  @Get("check/:roleName")
  @Roles(
    ["user", "requester", "storage_manager", "tenant_admin", "super_admin"],
    {
      match: "any",
    },
  )
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
  @Roles(
    ["user", "requester", "storage_manager", "tenant_admin", "super_admin"],
    {
      match: "any",
    },
  )
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
  @Roles(
    ["user", "requester", "storage_manager", "tenant_admin", "super_admin"],
    {
      match: "any",
    },
  )
  @Get("organizations")
  getUserOrganizations(@Req() req: AuthRequest) {
    return this.roleService.getUserOrganizations(req);
  }

  /**
   * GET /roles/organization/:orgId
   * Get user's roles in a specific organization
   */
  @Roles(
    ["user", "requester", "storage_manager", "tenant_admin", "super_admin"],
    {
      match: "any",
    },
  )
  @Get("organization/:orgId")
  getCurrentUserRolesInOrganization(
    @Param("orgId") orgId: string,
    @Req() req: AuthRequest,
  ): ViewUserRolesWithDetails[] {
    return this.roleService.getCurrentUserRolesInOrganization(orgId, req);
  }

  /**
   * GET /roles/all
   * Get all user role assignments
   */
  @Get("all")
  @Roles(["tenant_admin", "super_admin"], {
    match: "any",
    sameOrg: true,
  })
  async getAllUserRoles(
    @Req() req: AuthRequest,
  ): Promise<ViewUserRolesWithDetails[]> {
    return this.roleService.getAllUserRoles(req);
  }

  /**
   * GET /roles/list
   * Get all available roles from the roles table
   */
  @Get("list")
  @Roles(["tenant_admin", "super_admin"], {
    match: "any",
    sameOrg: true,
  })
  async getAllRoles(@Req() req: AuthRequest) {
    return this.roleService.getAllRoles(req);
  }

  /**
   * POST /roles
   * Create a new user role assignment
   */
  @Post()
  @Roles(["tenant_admin", "super_admin"], {
    match: "any",
    sameOrg: true,
  })
  async createUserRole(
    @Body() createRoleDto: CreateUserRoleDto,
    @Req() req: AuthRequest,
  ): Promise<ViewUserRolesWithDetails> {
    return this.roleService.createUserRole(createRoleDto, req);
  }

  /**
   * PUT /roles/:id
   * Update a user role assignment
   */
  @Put(":id")
  @Roles(["tenant_admin", "super_admin"], {
    match: "any",
    sameOrg: true,
  })
  async updateUserRole(
    @Param("id") tableKeyId: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
    @Req() req: AuthRequest,
  ): Promise<ViewUserRolesWithDetails> {
    return this.roleService.updateUserRole(tableKeyId, updateRoleDto, req);
  }

  /**
   * PUT /roles/:id/replace
   * Replace a user role (delete old role and create new one)
   */
  @Put(":id/replace")
  @Roles(["tenant_admin", "super_admin"], {
    match: "any",
    sameOrg: true,
  })
  async replaceUserRole(
    @Param("id") oldRoleId: string,
    @Body() createRoleDto: CreateUserRoleDto,
    @Req() req: AuthRequest,
  ): Promise<ViewUserRolesWithDetails> {
    return this.roleService.replaceUserRole(oldRoleId, createRoleDto, req);
  }

  /**
   * DELETE /roles/:id
   * Soft delete a user role assignment (deactivate)
   */
  @Delete(":id")
  @Roles(["tenant_admin", "super_admin"], {
    match: "any",
    sameOrg: true,
  })
  async deleteUserRole(
    @Param("id") tableKeyId: string,
    @Req() req: AuthRequest,
  ): Promise<{ success: boolean; message: string }> {
    return this.roleService.deleteUserRole(tableKeyId, req);
  }

  /**
   * DELETE /roles/:id/permanent
   * Permanently delete a user role assignment
   */
  @Delete(":id/permanent")
  @Roles(["super_admin"], {
    match: "any",
    sameOrg: true,
  })
  async permanentDeleteUserRole(
    @Param("id") tableKeyId: string,
    @Req() req: AuthRequest,
  ): Promise<{ success: boolean; message: string }> {
    return this.roleService.permanentDeleteUserRole(tableKeyId, req);
  }
}
