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
   * Complete user setup: create profile and assign default role
   * This should be called after Supabase Auth creates a user
   */
  async setupNewUser(setupData: SetupUserRequest): Promise<SetupUserResponse> {
    const supabase = this.supabaseService.getServiceClient();

    try {
      // Check current user setup status
      const setupStatus = await this.checkUserSetupStatus(setupData.userId);

      if (!setupStatus.needsSetup) {
        return {
          success: true,
          userProfile: setupStatus.profile,
        };
      }

      // Get default organization and role in parallel for better performance
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
        throw new InternalServerErrorException(
          `Default organization '${this.DEFAULT_ORG_NAME}' not found`,
        );
      }

      if (roleData.error || !roleData.data) {
        throw new InternalServerErrorException(
          `Default role '${this.DEFAULT_ROLE_NAME}' not found`,
        );
      }

      let userProfile = setupStatus.profile;

      // Create user profile if it doesn't exist
      if (!setupStatus.hasProfile) {
        userProfile = await this.createUserProfile(setupData);
      }

      // Assign role if user doesn't have one
      if (!setupStatus.hasRole) {
        await this.assignDefaultRole(
          setupData.userId,
          orgData.data.id,
          roleData.data.id,
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
    const supabase = this.supabaseService.getServiceClient();

    const profileData: UserProfileInsert = {
      id: setupData.userId,
      email: setupData.email,
      full_name: setupData.full_name || null,
      phone: setupData.phone || null,
      visible_name: setupData.visible_name || setupData.full_name || null,
      created_at: new Date().toISOString(),
    };

    const { data: newUserProfile, error: profileError } = await supabase
      .from("user_profiles")
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      handleSupabaseError(profileError);
    }

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
    try {
      await this.roleService.createUserRoleById(userId, organizationId, roleId);
    } catch (roleError) {
      this.logger.error(
        `Role assignment failed for user ${userId}: ${
          roleError instanceof Error ? roleError.message : "Unknown role error"
        }`,
      );
      // Don't throw here - profile creation succeeded, role assignment failure shouldn't block user
    }
  }

  /**
   * Check if user already has a profile and role
   */
  async checkUserSetupStatus(userId: string): Promise<UserSetupStatus> {
    const supabase = this.supabaseService.getServiceClient();

    try {
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

      const hasProfile = !profileResult.error && !!profileResult.data;
      const hasRole =
        !roleResult.error && roleResult.data && roleResult.data.length > 0;

      return {
        hasProfile,
        hasRole,
        needsSetup: !hasProfile || !hasRole,
        profile: profileResult.data || undefined,
      };
    } catch (error) {
      this.logger.error(`Error checking user setup status: ${error}`);
      return {
        hasProfile: false,
        hasRole: false,
        needsSetup: true,
      };
    }
  }
}
