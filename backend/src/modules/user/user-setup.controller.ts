import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Logger,
  Get,
  Req,
} from "@nestjs/common";
import {
  UserSetupService,
  SetupUserRequest,
  SetupUserResponse,
} from "./user-setup.service";
import { AuthRequest } from "../../middleware/interfaces/auth-request.interface";

export class CreateUserProfileDto {
  userId: string;
  email: string;
  full_name?: string;
  phone?: string;
  visible_name?: string;
  provider?: string;
}

@Controller("user-setup")
export class UserSetupController {
  private readonly logger = new Logger(UserSetupController.name);

  constructor(private readonly userSetupService: UserSetupService) {}

  @Post("setup")
  async setupUser(
    @Body() createUserDto: CreateUserProfileDto,
    @Req() req: AuthRequest,
  ): Promise<SetupUserResponse> {
    try {
      this.logger.log(`Setting up user: ${createUserDto.userId}`);

      // Security: Ensure user can only set up their own profile
      if (createUserDto.userId !== req.user.id) {
        throw new HttpException(
          "You can only set up your own profile",
          HttpStatus.FORBIDDEN,
        );
      }

      if (!createUserDto.userId || !createUserDto.email) {
        throw new HttpException(
          "userId and email are required",
          HttpStatus.BAD_REQUEST,
        );
      }

      const setupData: SetupUserRequest = {
        userId: createUserDto.userId,
        email: createUserDto.email,
        full_name: createUserDto.full_name,
        phone: createUserDto.phone,
        visible_name: createUserDto.visible_name,
        provider: createUserDto.provider || "manual",
      };

      const result = await this.userSetupService.setupNewUser(setupData);

      if (!result.success) {
        throw new HttpException(
          result.error || "User setup failed",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(`User setup failed: ${error.message}`, error.stack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Internal server error during user setup",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("check-status")
  async checkUserSetupStatus(
    @Body() body: { userId: string },
    @Req() req: AuthRequest,
  ) {
    try {
      if (!body.userId) {
        throw new HttpException("userId is required", HttpStatus.BAD_REQUEST);
      }

      // Security: Users can only check their own status, unless they have admin roles
      const isOwnStatus = body.userId === req.user.id;
      const isAdmin = req.userRoles.some(
        (role) => role.role_name === "admin" || role.role_name === "superVera",
      );

      if (!isOwnStatus && !isAdmin) {
        throw new HttpException(
          "You can only check your own setup status",
          HttpStatus.FORBIDDEN,
        );
      }

      const status = await this.userSetupService.checkUserSetupStatus(
        body.userId,
      );
      return {
        success: true,
        data: status,
      };
    } catch (error) {
      this.logger.error(`Check status failed: ${error.message}`, error.stack);
      throw new HttpException(
        "Failed to check user setup status",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("debug-jwt")
  debugJWT(@Req() req: AuthRequest) {
    try {
      this.logger.log(`🔍 JWT Debug requested by user: ${req.user.id}`);

      return {
        success: true,
        data: {
          userId: req.user.id,
          email: req.user.email,
          rolesCount: req.userRoles.length,
          roles: req.userRoles.map((r) => ({
            role_name: r.role_name,
            organization_name: r.organization_name,
            organization_id: r.organization_id,
          })),
          rawUserRoles: req.userRoles,
        },
      };
    } catch (error) {
      this.logger.error(`JWT debug failed: ${error.message}`, error.stack);
      throw new HttpException(
        "Failed to debug JWT",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
