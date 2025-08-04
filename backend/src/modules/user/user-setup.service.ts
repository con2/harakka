import { Injectable, Logger } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { User } from "@supabase/supabase-js";
import { UserProfile } from "@common/user.types";
import { Database } from "@common/supabase.types";
import { RoleService } from "../role/role.service";

type UserProfileInsert =
  Database["public"]["Tables"]["user_profiles"]["Insert"];

export interface SetupUserRequest {
  userId: string;
  email: string;
  full_name?: string;
  phone?: string;
  visible_name?: string;
  provider?: string;
}

export interface SetupUserResponse {
  success: boolean;
  userProfile?: UserProfile;
  error?: string;
}

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
      this.logger.log(`Setting up new user: ${setupData.userId}`);

      // Check current user setup status
      const setupStatus = await this.checkUserSetupStatus(setupData.userId);

      if (!setupStatus.needsSetup) {
        this.logger.log(`User ${setupData.userId} already has complete setup`);
        return {
          success: true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          userProfile: setupStatus.profile as any,
        };
      }

      this.logger.log(
        `User needs setup - Profile: ${setupStatus.hasProfile}, Role: ${setupStatus.hasRole}`,
      );

      // Get default organization
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("id")
        .eq("name", this.DEFAULT_ORG_NAME)
        .single();

      if (orgError || !orgData) {
        throw new Error(
          `Default organization '${this.DEFAULT_ORG_NAME}' not found: ${orgError?.message}`,
        );
      }

      // Get default role
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("id")
        .eq("role", this.DEFAULT_ROLE_NAME)
        .single();

      if (roleError || !roleData) {
        throw new Error(
          `Default role '${this.DEFAULT_ROLE_NAME}' not found: ${roleError?.message}`,
        );
      }

      let userProfile = setupStatus.profile;

      // Create user profile if it doesn't exist
      if (!setupStatus.hasProfile) {
        // Create user profile with the correct field structure
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
          throw new Error(`Profile creation failed: ${profileError.message}`);
        }

        userProfile = newUserProfile;
        this.logger.log(`User profile created for: ${setupData.userId}`);
      } else {
        this.logger.log(`User profile already exists for: ${setupData.userId}`);
      }

      // Assign role if user doesn't have one
      if (!setupStatus.hasRole) {
        try {
          this.logger.log(
            `Assigning default role '${this.DEFAULT_ROLE_NAME}' to user: ${setupData.userId}`,
          );

          // Use RoleService to create role assignment (includes JWT update)
          const roleAssignment = await this.roleService.createUserRoleById(
            setupData.userId,
            orgData.id,
            roleData.id,
          );

          this.logger.log(
            `Role assignment completed: ${roleAssignment.role_name}@${roleAssignment.organization_name} for user: ${setupData.userId}`,
          );
        } catch (roleError) {
          // Log error but don't fail the entire process
          this.logger.error(
            `Role assignment failed for user ${setupData.userId}: ${roleError instanceof Error ? roleError.message : "Unknown role error"}`,
          );
        }
      } else {
        this.logger.log(`User ${setupData.userId} already has a role assigned`);
      }

      this.logger.log(
        `User setup completed successfully for: ${setupData.userId}`,
      );

      return {
        success: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userProfile: userProfile as any,
      };
    } catch (error) {
      this.logger.error(`User setup failed for ${setupData.userId}:`, error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Check if user already has a profile and role
   */
  async checkUserSetupStatus(userId: string): Promise<{
    hasProfile: boolean;
    hasRole: boolean;
    needsSetup: boolean;
    profile?: UserProfileInsert;
  }> {
    const supabase = this.supabaseService.getServiceClient();

    try {
      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const hasProfile = !profileError && !!profile;

      // Check role
      const { data: role, error: roleError } = await supabase
        .from("user_organization_roles")
        .select("id")
        .eq("user_id", userId)
        .single();

      const hasRole = !roleError && !!role;

      return {
        hasProfile,
        hasRole,
        needsSetup: !hasProfile || !hasRole,
        profile: hasProfile ? profile : undefined,
      };
    } catch (error) {
      this.logger.error(
        `Error checking user setup status for ${userId}:`,
        error,
      );
      return {
        hasProfile: false,
        hasRole: false,
        needsSetup: true,
        profile: undefined,
      };
    }
  }

  /**
   * Extract user data from different signup methods
   */
  extractUserData(
    user: User,
    signupMethod: "email" | "oauth",
  ): SetupUserRequest {
    const { email, user_metadata, app_metadata } = user;

    if (signupMethod === "oauth") {
      // For OAuth providers like Google
      const firstName =
        user_metadata?.first_name ||
        user_metadata?.given_name ||
        user_metadata?.name?.split(" ")[0] ||
        "";
      const lastName =
        user_metadata?.last_name ||
        user_metadata?.family_name ||
        user_metadata?.name?.split(" ").slice(1).join(" ") ||
        "";
      const fullName = `${firstName} ${lastName}`.trim();

      return {
        userId: user.id,
        email: email || "",
        full_name: fullName || user_metadata?.name || "",
        visible_name:
          user_metadata?.name || fullName || email?.split("@")[0] || "",
        phone: user_metadata?.phone || user_metadata?.phone_number || "",
        provider: user_metadata?.provider || app_metadata?.provider || "oauth",
      };
    } else {
      // For email/password signup
      const firstName = user_metadata?.first_name || "";
      const lastName = user_metadata?.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim();

      return {
        userId: user.id,
        email: email || "",
        full_name: fullName || "",
        visible_name: fullName || email?.split("@")[0] || "",
        phone: user_metadata?.phone || "",
        provider: "email",
      };
    }
  }

  /**
   * Helper method to check existing user
   */
  private async checkExistingUser(userId: string): Promise<{
    hasProfile: boolean;
    profile?: UserProfile;
  }> {
    const supabase = this.supabaseService.getServiceClient();

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    return {
      hasProfile: !error && !!profile,
      profile: profile || undefined,
    };
  }
}
