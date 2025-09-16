import {
  Controller,
  Post,
  Body,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  Get,
  Req,
} from "@nestjs/common";
import { UserSetupService } from "./user-setup.service";
import {
  SetupUserRequest,
  SetupUserResponse,
  CreateUserProfileDto,
  CheckStatusDto,
} from "./interfaces/user-setup.interface";
import { AuthRequest } from "../../middleware/interfaces/auth-request.interface";

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
      // Get userId from authenticated request
      const userId = createUserDto.userId || req.user?.id;

      if (!userId) {
        throw new BadRequestException("userId is required");
      }

      if (!createUserDto.email) {
        throw new BadRequestException("email is required");
      }
      // Validate user exists (only for unauthenticated requests)
      if (!req.user) {
        const userExists =
          await this.userSetupService.validateUserExists(userId);
        if (!userExists) {
          throw new BadRequestException("Invalid user ID");
        }
      }

      const setupData: SetupUserRequest = {
        userId: userId,
        email: createUserDto.email,
        full_name: createUserDto.full_name,
        phone: createUserDto.phone,
        visible_name: createUserDto.visible_name,
        provider: createUserDto.provider || "manual",
      };

      const result = await this.userSetupService.setupNewUser(setupData);

      if (!result.success) {
        throw new InternalServerErrorException(
          result.error || "User setup failed",
        );
      }

      return result;
    } catch (error) {
      this.logger.error(`❌ User setup failed: ${error.message}`, error.stack);

      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        "Internal server error during user setup",
      );
    }
  }

  @Post("check-status")
  async checkUserSetupStatus(
    @Body() body: CheckStatusDto,
    @Req() req: AuthRequest,
  ) {
    this.logger.log(
      `Setup request received for userId: ${body.userId}, auth user: ${req.user?.id || "none"}`,
    );
    try {
      if (!body.userId) {
        throw new BadRequestException("userId is required");
      }

      if (req.user) {
        // Security: Users can only check their own status, unless they have admin roles
        const isOwnStatus = body.userId === req.user.id;
        const isAdmin = req.userRoles?.some(
          (role) => role.role_name === "super_admin",
        );

        if (!isOwnStatus && !isAdmin) {
          throw new ForbiddenException(
            "You can only check your own setup status",
          );
        }
      }

      // Pass validateAuth: true to verify user exists in auth.users
      const status = await this.userSetupService.checkUserSetupStatus(
        body.userId,
        true, // Enable user validation
      );

      // Include userExists in response if available
      return {
        success: true,
        data: {
          ...status,
          // Only expose userExists property if it's false (for security)
          userExists: status.userExists === false ? false : undefined,
        },
      };
    } catch (error) {
      this.logger.error(`Check status failed: ${error.message}`, error.stack);

      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        "Failed to check user setup status",
      );
    }
  }

  @Get("debug-jwt")
  debugJWT(@Req() req: AuthRequest) {
    try {
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
      throw new InternalServerErrorException("Failed to debug JWT");
    }
  }
}
