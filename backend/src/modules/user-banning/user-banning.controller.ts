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
} from "@nestjs/common";
import { UserBanningService } from "./user-banning.service";
import { UserBanHistoryDto, UserBanStatusDto } from "./dto/user-banning.dto";
import {
  BanForRoleDto,
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
   * Ban a user for a specific role in an organization
   */
  @Post("ban-for-role")
  @Roles(["admin", "main_admin", "super_admin", "superVera"])
  @HttpCode(HttpStatus.OK)
  async banForRole(
    @Body(ValidationPipe) banForRoleDto: BanForRoleDto,
    @Req() req: AuthRequest,
  ): Promise<BanOperationResult> {
    return this.userBanningService.banForRole(banForRoleDto, req);
  }

  /**
   * Ban a user for all roles in an organization
   */
  @Post("ban-for-org")
  @Roles(["admin", "main_admin", "super_admin", "superVera"])
  @HttpCode(HttpStatus.OK)
  async banForOrg(
    @Body(ValidationPipe) banForOrgDto: BanForOrgDto,
    @Req() req: AuthRequest,
  ): Promise<BanOperationResult> {
    return this.userBanningService.banForOrg(banForOrgDto, req);
  }

  /**
   * Ban a user from the entire application
   */
  @Post("ban-for-app")
  @Roles(["main_admin", "super_admin", "superVera"])
  @HttpCode(HttpStatus.OK)
  async banForApp(
    @Body(ValidationPipe) banForAppDto: BanForAppDto,
    @Req() req: AuthRequest,
  ): Promise<BanOperationResult> {
    return this.userBanningService.banForApp(banForAppDto, req);
  }

  /**
   * Unban a user
   */
  @Post("unban")
  @Roles(["admin", "main_admin", "super_admin", "superVera"])
  @HttpCode(HttpStatus.OK)
  async unbanUser(
    @Body(ValidationPipe) unbanDto: UnbanDto,
    @Req() req: AuthRequest,
  ): Promise<BanOperationResult> {
    return this.userBanningService.unbanUser(unbanDto, req);
  }

  /**
   * Get ban history for a specific user
   */
  @Get("history/:userId")
  @Roles(["admin", "main_admin", "super_admin", "superVera"])
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
  @Roles(["admin", "main_admin", "super_admin", "superVera"])
  async getAllUserBanStatuses(
    @Req() req: AuthRequest,
  ): Promise<UserBanStatusDto[]> {
    return this.userBanningService.getAllUserBanStatuses(req);
  }

  /**
   * Check ban status for a specific user
   */
  @Get("check/:userId")
  @Roles(["admin", "main_admin", "super_admin", "superVera"])
  async checkUserBanStatus(
    @Param("userId") userId: string,
    @Req() req: AuthRequest,
  ): Promise<UserBanStatusCheck> {
    return this.userBanningService.checkUserBanStatus(userId, req);
  }
}
