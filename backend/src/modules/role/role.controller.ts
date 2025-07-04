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
import { UserRoleWithDetails } from "./interfaces/role.interface";
import { CreateUserRoleDto, UpdateUserRoleDto } from "./dto/role.dto";

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
   * GET /roles/all
   * Get all user role assignments (admin only)
   */
  @Get("all")
  async getAllUserRoles(
    @Req() req: AuthRequest,
  ): Promise<UserRoleWithDetails[]> {
    return this.roleService.getAllUserRoles(req);
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

  /**
   * POST /roles
   * Create a new user role assignment
   */
  @Post()
  async createUserRole(
    @Body() createRoleDto: CreateUserRoleDto,
    @Req() req: AuthRequest,
  ): Promise<UserRoleWithDetails> {
    return this.roleService.createUserRole(createRoleDto, req);
  }

  /**
   * PUT /roles/:id
   * Update a user role assignment
   */
  @Put(":id")
  async updateUserRole(
    @Param("id") tableKeyId: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
    @Req() req: AuthRequest,
  ): Promise<UserRoleWithDetails> {
    return this.roleService.updateUserRole(tableKeyId, updateRoleDto, req);
  }

  /**
   * DELETE /roles/:id
   * Soft delete a user role assignment (deactivate)
   */
  @Delete(":id")
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
  async permanentDeleteUserRole(
    @Param("id") tableKeyId: string,
    @Req() req: AuthRequest,
  ): Promise<{ success: boolean; message: string }> {
    return this.roleService.permanentDeleteUserRole(tableKeyId, req);
  }
}
