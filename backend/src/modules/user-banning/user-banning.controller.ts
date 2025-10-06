import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { UserBanningService } from "./user-banning.service";
import { UserBanHistoryDto, UserBanStatusDto } from "./dto/user-banning.dto";
import {
  BanForOrgDto,
  BanForAppDto,
  UnbanDto,
  BanOperationResult,
  UserBanStatusCheck,
} from "./interfaces/user-banning.interface";
import { Roles } from "../../decorators/roles.decorator";
import { AuthRequest } from "../../middleware/interfaces/auth-request.interface";

@Controller("user-banning")
export class UserBanningController {
  constructor(private readonly userBanningService: UserBanningService) {}

  /**
   * Ban a user for all roles in an organization
   */
  @Post("ban-for-org")
  @Roles(["tenant_admin", "super_admin"], {
    match: "any",
    sameOrg: true,
  })
  @HttpCode(HttpStatus.OK)
  async banForOrg(
    @Body(ValidationPipe) banForOrgDto: BanForOrgDto,
    @Req() req: AuthRequest,
  ): Promise<BanOperationResult> {
    this.assertOrgContext(req, banForOrgDto.organizationId);
    return this.userBanningService.banForOrg(banForOrgDto, req);
  }

  /**
   * Ban a user from the entire application
   */
  @Post("ban-for-app")
  @Roles(["super_admin"], { match: "any" })
  @HttpCode(HttpStatus.OK)
  async banForApp(
    @Body(ValidationPipe) banForAppDto: BanForAppDto,
    @Req() req: AuthRequest,
  ): Promise<BanOperationResult> {
    this.assertSuperAdmin(req);
    return this.userBanningService.banForApp(banForAppDto, req);
  }

  /**
   * Unban a user
   */
  @Post("unban")
  @Roles(["tenant_admin", "super_admin"], {
    match: "any",
    sameOrg: true,
  })
  @HttpCode(HttpStatus.OK)
  async unbanUser(
    @Body(ValidationPipe) unbanDto: UnbanDto,
    @Req() req: AuthRequest,
  ): Promise<BanOperationResult> {
    if (unbanDto.organizationId) {
      this.assertOrgContext(req, unbanDto.organizationId);
    }
    console.log("Ban Type:", unbanDto.banType);
    if (unbanDto.banType === "banForApp") {
      this.assertSuperAdmin(req);
    }
    return this.userBanningService.unbanUser(unbanDto, req);
  }

  /**
   * Get ban history for a specific user
   */
  @Get("history/:userId")
  @Roles(["tenant_admin", "super_admin"], {
    match: "any",
    sameOrg: true,
  })
  async getUserBanHistory(
    @Param("userId") userId: string,
    @Req() req: AuthRequest,
  ): Promise<UserBanHistoryDto[]> {
    return this.userBanningService.getUserBanHistory(userId, req);
  }

  /**
   * Get all user ban statuses (admin overview)
   */
  @Get("statuses")
  @Roles(["tenant_admin", "super_admin"], {
    match: "any",
    sameOrg: true,
  })
  async getAllUserBanStatuses(
    @Req() req: AuthRequest,
  ): Promise<UserBanStatusDto[]> {
    return this.userBanningService.getAllUserBanStatuses(req);
  }

  /**
   * Check ban status for a specific user
   */
  @Get("check/:userId")
  @Roles(["tenant_admin", "super_admin"], {
    match: "any",
    sameOrg: true,
  })
  async checkUserBanStatus(
    @Param("userId") userId: string,
    @Req() req: AuthRequest,
  ): Promise<UserBanStatusCheck> {
    return this.userBanningService.checkUserBanStatus(userId, req);
  }

  private isSuperAdmin(req: AuthRequest): boolean {
    const metadataRoles = (req.user?.app_metadata?.roles ?? []) as Array<{
      role_name?: string;
    }>;
    const userRoles = req.userRoles ?? [];

    return (
      metadataRoles.some((role) => role.role_name === "super_admin") ||
      userRoles.some((role) => role.role_name === "super_admin")
    );
  }

  private assertSuperAdmin(req: AuthRequest): void {
    if (!this.isSuperAdmin(req)) {
      throw new BadRequestException(
        "Only super admins can perform this operation.",
      );
    }
  }

  private assertOrgContext(req: AuthRequest, organizationId: string): void {
    if (!organizationId) {
      throw new BadRequestException("Organization ID is required.");
    }

    if (this.isSuperAdmin(req)) {
      return;
    }

    const headerOrgId = (req.headers["x-org-id"] as string | undefined)?.trim();
    const contextOrgId = req.activeRoleContext?.organizationId;
    const effectiveOrgId = headerOrgId || contextOrgId;

    if (!effectiveOrgId) {
      throw new BadRequestException(
        "Organization context is missing. Provide x-org-id header or active role context.",
      );
    }

    if (effectiveOrgId !== organizationId) {
      throw new BadRequestException(
        "You can only manage bans inside your active organization.",
      );
    }
  }
}
