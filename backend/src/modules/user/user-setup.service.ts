import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { RoleService } from "../role/role.service";
import { handleSupabaseError } from "../../utils/handleError.utils";
import {
  SetupUserRequest,
  SetupUserResponse,
  UserSetupStatus,
  UserProfileInsert,
} from "./interfaces/user-setup.interface";

@Injectable()
export class UserSetupService {
  private readonly logger = new Logger(UserSetupService.name);
  private readonly DEFAULT_ORG_NAME = "Global";
  private readonly DEFAULT_ROLE_NAME = "user";

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly roleService: RoleService,
  ) {}

  /**
   * Validates if a user exists in Supabase Auth
   * @param userId The user ID to validate
   * @returns Promise<boolean> True if user exists, false otherwise
   */
  async validateUserExists(userId: string): Promise<boolean> {
    try {
      this.logger.log(`Validating if user ${userId} exists in auth.users`);
      const supabase = this.supabaseService.getServiceClient();

      // Use admin.getUserById to check if the user exists in auth.users
      const { data, error } = await supabase.auth.admin.getUserById(userId);

      if (error) {
        this.logger.warn(`Error validating user existence: ${error.message}`);
        return false;
      }

      const exists = !!data?.user;
      this.logger.log(`User ${userId} exists in auth.users: ${exists}`);
      return exists;
    } catch (error) {
      this.logger.warn(
        `Exception validating user existence: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * Complete user setup: create profile and assign default role
   * This should be called after Supabase Auth creates a user
   */
  async setupNewUser(setupData: SetupUserRequest): Promise<SetupUserResponse> {
    const supabase = this.supabaseService.getServiceClient();
    this.logger.log(`Starting setup for user ${setupData.userId}`);

    try {
      // First validate that the user exists in auth.users
      const userExists = await this.validateUserExists(setupData.userId);
      if (!userExists) {
        this.logger.error(
          `User ${setupData.userId} does not exist in auth.users`,
        );
        return {
          success: false,
          error: `User ID ${setupData.userId} not found in authentication system`,
        };
      }

      // Check current user setup status
      const setupStatus = await this.checkUserSetupStatus(setupData.userId);
      this.logger.log(
        `Setup status: hasProfile=${setupStatus.hasProfile}, hasRole=${setupStatus.hasRole}`,
      );

      if (!setupStatus.needsSetup) {
        this.logger.log(
          `User ${setupData.userId} already set up, skipping setup`,
        );
        return {
          success: true,
          userProfile: setupStatus.profile,
        };
      }

      // Get default organization and role in parallel for better performance
      this.logger.log(
        `Looking up default organization "${this.DEFAULT_ORG_NAME}" and role "${this.DEFAULT_ROLE_NAME}"`,
      );

      const [orgData, roleData] = await Promise.all([
        supabase
          .from("organizations")
          .select("id")
          .eq("name", this.DEFAULT_ORG_NAME)
          .single(),
        supabase
          .from("roles")
          .select("id")
          .eq("role", this.DEFAULT_ROLE_NAME)
          .single(),
      ]);

      if (orgData.error || !orgData.data) {
        this.logger.error(
          `Default organization lookup failed: ${
            orgData.error?.message || "No data returned"
          }`,
        );
        throw new InternalServerErrorException(
          `Default organization '${this.DEFAULT_ORG_NAME}' not found`,
        );
      }

      if (roleData.error || !roleData.data) {
        this.logger.error(
          `Default role lookup failed: ${roleData.error?.message || "No data returned"}`,
        );
        throw new InternalServerErrorException(
          `Default role '${this.DEFAULT_ROLE_NAME}' not found`,
        );
      }

      this.logger.log(
        `Found organization ID: ${orgData.data.id}, role ID: ${roleData.data.id}`,
      );

      let userProfile = setupStatus.profile;

      // Create user profile if it doesn't exist
      if (!setupStatus.hasProfile) {
        this.logger.log(`Creating user profile for ${setupData.userId}`);
        userProfile = await this.createUserProfile(setupData);
        this.logger.log(`User profile created with ID: ${userProfile.id}`);
      } else {
        this.logger.log(
          `User ${setupData.userId} already has profile, skipping profile creation`,
        );
      }

      // Assign role if user doesn't have one
      if (!setupStatus.hasRole) {
        this.logger.log(`Assigning default role to user ${setupData.userId}`);
        await this.assignDefaultRole(
          setupData.userId,
          orgData.data.id,
          roleData.data.id,
        );
        this.logger.log(
          `Role assigned successfully to user ${setupData.userId}`,
        );
      } else {
        this.logger.log(
          `User ${setupData.userId} already has role, skipping role assignment`,
        );
      }

      return {
        success: true,
        userProfile,
      };
    } catch (error) {
      this.logger.error(`User setup failed for ${setupData.userId}:`, error);

      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Create user profile
   */
  private async createUserProfile(
    setupData: SetupUserRequest,
  ): Promise<UserProfileInsert> {
    // Existing createUserProfile method code unchanged
    const supabase = this.supabaseService.getServiceClient();

    const profileData: UserProfileInsert = {
      id: setupData.userId,
      email: setupData.email,
      full_name: setupData.full_name || null,
      phone: setupData.phone || null,
      visible_name: setupData.visible_name || setupData.full_name || null,
      created_at: new Date().toISOString(),
    };

    this.logger.log(
      `Creating profile with data: ${JSON.stringify({
        ...profileData,
        email: profileData.email
          ? `${profileData.email.substring(0, 3)}***`
          : null,
      })}`,
    );

    const { data: newUserProfile, error: profileError } = await supabase
      .from("user_profiles")
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      this.logger.error(`Profile creation failed: ${profileError.message}`);
      handleSupabaseError(profileError);
    }

    this.logger.log(
      `Profile created successfully for user ${setupData.userId}`,
    );
    return newUserProfile;
  }

  /**
   * Assign default role to user
   */
  private async assignDefaultRole(
    userId: string,
    organizationId: string,
    roleId: string,
  ): Promise<void> {
    // Existing assignDefaultRole method code unchanged
    try {
      this.logger.log(
        `Assigning role ${roleId} in organization ${organizationId} to user ${userId}`,
      );
      await this.roleService.createUserRoleById(userId, organizationId, roleId);
      this.logger.log(`Role assigned successfully`);
    } catch (roleError) {
      this.logger.error(
        `Role assignment failed for user ${userId}: ${
          roleError instanceof Error ? roleError.message : "Unknown role error"
        }`,
        roleError instanceof Error ? roleError.stack : undefined,
      );
      // Don't throw here - profile creation succeeded, role assignment failure shouldn't block user
    }
  }

  /**
   * Check if user already has a profile and role
   * @param userId The user ID to check
   * @param validateAuth Whether to validate if the user exists in auth.users (defaults to false for backward compatibility)
   * @returns Promise<UserSetupStatus> The user's setup status
   */
  async checkUserSetupStatus(
    userId: string,
    validateAuth = false,
  ): Promise<UserSetupStatus> {
    const supabase = this.supabaseService.getServiceClient();
    this.logger.log(`Checking setup status for user ${userId}`);

    try {
      // Optionally validate that the user exists in auth system
      if (validateAuth) {
        const userExists = await this.validateUserExists(userId);
        if (!userExists) {
          this.logger.warn(`User ${userId} does not exist in auth.users`);
          // Return standard "needs setup" response for security reasons
          // but log the non-existence for monitoring
          return {
            hasProfile: false,
            hasRole: false,
            needsSetup: true,
            userExists: false, // Optional property to indicate user doesn't exist
          };
        }
      }

      // Check both profile and role in parallel
      const [profileResult, roleResult] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("user_organization_roles")
          .select("id")
          .eq("user_id", userId)
          .eq("is_active", true)
          .limit(1),
      ]);

      if (profileResult.error) {
        this.logger.warn(
          `Error checking user profile: ${profileResult.error.message}`,
        );
      }

      if (roleResult.error) {
        this.logger.warn(
          `Error checking user role: ${roleResult.error.message}`,
        );
      }

      const hasProfile = !profileResult.error && !!profileResult.data;
      const hasRole =
        !roleResult.error && roleResult.data && roleResult.data.length > 0;

      this.logger.log(
        `User ${userId} status: hasProfile=${hasProfile}, hasRole=${hasRole}, needsSetup=${!hasProfile || !hasRole}`,
      );

      return {
        hasProfile,
        hasRole,
        needsSetup: !hasProfile || !hasRole,
        profile: profileResult.data || undefined,
      };
    } catch (error) {
      this.logger.error(
        `Error checking user setup status: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        hasProfile: false,
        hasRole: false,
        needsSetup: true,
      };
    }
  }
}
