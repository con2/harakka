import { supabase } from "@/config/supabase";
import { User } from "@supabase/supabase-js";

export interface UserProfileData {
  email: string;
  full_name?: string;
  phone?: string;
  visible_name?: string;
  provider?: string;
}

export interface SignUpResult {
  success: boolean;
  user?: User;
  error?: string;
  isNewUser?: boolean;
}

export class AuthService {
  /**
   * Setup user profile and role via backend API call
   */
  static async setupNewUser(
    user: User,
    signupMethod: "email" | "oauth" = "email",
  ): Promise<SignUpResult> {
    try {
      // Extract user data based on signup method
      const profileData = this.extractUserProfileData(user, signupMethod);

      // Check if user has both profile AND role (complete setup)
      const setupStatus = await this.checkUserSetupStatus(user.id);

      if (!setupStatus.needsSetup) {
        return { success: true, user, isNewUser: false };
      }

      // Call backend API to setup user (will handle both profile creation and role assignment)
      const setupPayload = {
        userId: user.id,
        email: profileData.email,
        full_name: profileData.full_name,
        phone: profileData.phone,
        visible_name: profileData.visible_name,
        provider: profileData.provider,
      };

      // Get the current session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No authenticated session found");
      }

      // Call backend user setup endpoint
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user-setup/setup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(setupPayload),
        },
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Force refresh the session to update JWT with new role information
        try {
          // Wait a moment for the backend JWT update to propagate
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Try multiple refresh attempts
          let refreshAttempts = 0;
          const maxRefreshAttempts = 3;

          while (refreshAttempts < maxRefreshAttempts) {
            refreshAttempts++;

            const { data: refreshData, error: refreshError } =
              await supabase.auth.refreshSession();

            if (refreshError) {
              if (refreshAttempts < maxRefreshAttempts) {
                // Wait before retrying
                await new Promise((resolve) => setTimeout(resolve, 1500));
                continue;
              }
            } else {
              // Verify we have a valid session with token
              if (refreshData?.session?.access_token) {
                // Token successfully obtained
              }
              break;
            }
          }
        } catch {
          // Silently handle refresh errors
        }

        return {
          success: true,
          user,
          isNewUser: true,
        };
      } else {
        throw new Error(result.error || "User setup failed");
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        isNewUser: true,
      };
    }
  }

  /**
   * Extract user profile data from Supabase user object
   */
  private static extractUserProfileData(
    user: User,
    signupMethod: "email" | "oauth",
  ): UserProfileData {
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
        email: email || "",
        full_name: fullName || "",
        visible_name: fullName || email?.split("@")[0] || "",
        phone: user_metadata?.phone || "",
        provider: "email",
      };
    }
  }

  /**
   * Check if user needs profile setup
   */
  static async checkUserSetupStatus(userId: string): Promise<{
    hasProfile: boolean;
    hasRole: boolean;
    needsSetup: boolean;
  }> {
    try {
      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", userId)
        .single();

      const hasProfile = !profileError && !!profile;

      // Check role in user_organization_roles table
      const { data: roles, error: roleError } = await supabase
        .from("user_organization_roles")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      const hasRole = !roleError && roles && roles.length > 0;

      return {
        hasProfile,
        hasRole,
        needsSetup: !hasProfile || !hasRole,
      };
    } catch {
      return {
        hasProfile: false,
        hasRole: false,
        needsSetup: true,
      };
    }
  }
}
