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
      console.log(`Setting up new user via ${signupMethod}:`, user.id);

      // Extract user data based on signup method
      const profileData = this.extractUserProfileData(user, signupMethod);

      // Check if user has both profile AND role (complete setup)
      const setupStatus = await this.checkUserSetupStatus(user.id);

      if (!setupStatus.needsSetup) {
        console.log(
          "User already has complete setup (profile + role), skipping creation",
        );
        return { success: true, user, isNewUser: false };
      }

      console.log(
        `User needs setup - Profile: ${setupStatus.hasProfile}, Role: ${setupStatus.hasRole}`,
      );

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
        console.log("User setup completed successfully");

        // Force refresh the session to update JWT with new role information
        try {
          console.log(
            "Refreshing session to update JWT with role information...",
          );

          // Wait a moment for the backend JWT update to propagate
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Try multiple refresh attempts
          let refreshAttempts = 0;
          const maxRefreshAttempts = 3;

          while (refreshAttempts < maxRefreshAttempts) {
            refreshAttempts++;
            console.log(
              `Session refresh attempt ${refreshAttempts}/${maxRefreshAttempts}`,
            );

            const { data: refreshData, error: refreshError } =
              await supabase.auth.refreshSession();

            if (refreshError) {
              console.warn(
                `Session refresh attempt ${refreshAttempts} failed:`,
                refreshError.message,
              );

              if (refreshAttempts < maxRefreshAttempts) {
                // Wait before retrying
                await new Promise((resolve) => setTimeout(resolve, 1500));
                continue;
              }
            } else {
              console.log(
                `Session refreshed successfully on attempt ${refreshAttempts} with updated role information`,
              );

              // Verify we have a valid session with token
              if (refreshData?.session?.access_token) {
                console.log(
                  "✅ New access token obtained, roles should be updated",
                );

                // Decode and log JWT content for debugging
                try {
                  const tokenPayload = JSON.parse(
                    atob(refreshData.session.access_token.split(".")[1]),
                  );
                  console.log(
                    "🔍 JWT app_metadata:",
                    tokenPayload.app_metadata,
                  );
                  console.log(
                    "🔍 JWT roles:",
                    tokenPayload.app_metadata?.roles,
                  );
                } catch (decodeError) {
                  console.log(
                    "Could not decode JWT for debugging:",
                    decodeError,
                  );
                }
              }
              break;
            }
          }
        } catch (refreshError) {
          console.warn("Failed to refresh session:", refreshError);
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
      console.error("User setup process failed:", error);
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
      };
    } catch (error) {
      console.error("Error checking user setup status:", error);
      return {
        hasProfile: false,
        hasRole: false,
        needsSetup: true,
      };
    }
  }
}
