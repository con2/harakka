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
      // Security: Ensure user can only set up their own profile
      if (createUserDto.userId !== req.user.id) {
        throw new ForbiddenException("You can only set up your own profile");
      }

      if (!createUserDto.userId || !createUserDto.email) {
        throw new BadRequestException("userId and email are required");
      }
      console.log("CreateUserDto:", createUserDto);
      const setupData: SetupUserRequest = {
        userId: createUserDto.userId,
        email: createUserDto.email,
        full_name: createUserDto.full_name,
        phone: createUserDto.phone,
        visible_name: createUserDto.visible_name,
        provider: createUserDto.provider || "manual",
      };
      console.log("SetupData:", setupData);
      const result = await this.userSetupService.setupNewUser(setupData);
      console.log("Setup Result:", result);
      if (!result.success) {
        throw new InternalServerErrorException(
          result.error || "User setup failed",
        );
      }

      return result;
    } catch (error) {
      this.logger.error(`User setup failed: ${error.message}`, error.stack);

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
    @Body() body: { userId: string },
    @Req() req: AuthRequest,
  ) {
    try {
      if (!body.userId) {
        throw new BadRequestException("userId is required");
      }

      // Security: Users can only check their own status, unless they have admin roles
      const isOwnStatus = body.userId === req.user.id;
      const isAdmin = req.userRoles.some(
        (role) => role.role_name === "admin" || role.role_name === "superVera",
      );

      if (!isOwnStatus && !isAdmin) {
        throw new ForbiddenException(
          "You can only check your own setup status",
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
