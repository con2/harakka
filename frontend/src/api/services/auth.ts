import { supabase } from "@/config/supabase";
import { User, Session } from "@supabase/supabase-js";
import { api, clearCachedAuthToken } from "../axios";

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
  sessionRefreshed?: boolean;
  session?: Session | null;
}

export interface UserSetupStatus {
  hasProfile: boolean;
  hasRole: boolean;
  needsSetup: boolean;
}

/**
 * Authentication service for user setup and profile management
 * Handles the bridge between Supabase auth and backend user setup
 */
export class AuthService {
  /**
   * Setup user profile and role via backend API call
   */
  static async setupNewUser(
    user: User,
    signupMethod: "email" | "oauth" = "email",
    userInput?: { full_name?: string; phone?: string },
  ): Promise<SignUpResult> {
    console.log("🚀 Starting setupNewUser with integrated session refresh");
    try {
      console.log(`🔍 Setting up user ID: ${user.id}`);

      // Extract user data based on signup method
      const profileData = this.extractUserProfileData(user, signupMethod);

      // Check if user needs setup
      const setupStatus = await this.checkUserSetupStatus(user.id);
      console.log(`📊 Setup status for ${user.id}:`, setupStatus);

      if (!setupStatus.needsSetup) {
        console.log(`✅ User ${user.id} already setup, skipping`);
        return { success: true, user, isNewUser: false };
      }

      // Get auth token for setup request
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      const token = session?.access_token;

      if (!session) {
        console.error("❌ No authenticated session found");
        throw new Error("No authenticated session found");
      }

      // Create setup payload
      const setupPayload = {
        userId: user.id,
        email: profileData.email,
        full_name: userInput?.full_name || profileData.full_name,
        phone: userInput?.phone || profileData.phone,
        visible_name: profileData.visible_name,
        provider: profileData.provider,
      };

      // Use the configured API URL from environment
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

      // Call backend API to setup user
      console.log("📡 Sending setup request to backend");
      const response = await fetch(`${apiUrl}/user-setup/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(setupPayload),
      });

      if (!response.ok) {
        console.error(`❌ Setup failed with status ${response.status}`);
        throw new Error(`Setup failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ User setup result:", result);

      if (!result.success) {
        return { success: false, error: result.error, isNewUser: true };
      }

      // ADDED: Immediate session refresh after successful setup
      console.log("🔄 Immediately refreshing session to update JWT claims");
      clearCachedAuthToken(); // Clear token cache first

      // Azure best practice: Use retry pattern for token refresh
      let attempts = 0;
      const maxAttempts = 3;
      let refreshResult = null;

      while (attempts < maxAttempts) {
        try {
          refreshResult = await supabase.auth.refreshSession();

          if (refreshResult.error) {
            console.warn(
              `⚠️ Session refresh attempt ${attempts + 1} failed:`,
              refreshResult.error,
            );
            attempts++;

            if (attempts >= maxAttempts) {
              console.error("❌ Maximum refresh attempts reached");
              break;
            }

            // Azure best practice: Exponential backoff
            const backoffMs = Math.pow(2, attempts) * 200;
            console.log(`⏱️ Retrying in ${backoffMs}ms...`);
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
          } else {
            console.log(
              "✅ Session refreshed successfully with new JWT claims",
            );
            break;
          }
        } catch (refreshError) {
          console.error(
            "❌ Unexpected error during session refresh:",
            refreshError,
          );
          attempts++;
          if (attempts >= maxAttempts) break;
          await new Promise((resolve) => setTimeout(resolve, 500 * attempts));
        }
      }

      return {
        success: true,
        user,
        isNewUser: true,
        sessionRefreshed: !!refreshResult && !refreshResult.error,
        session: refreshResult?.data?.session || null,
      };
    } catch (error) {
      console.error(
        "❌ User setup failed:",
        error instanceof Error ? error.message : String(error),
      );
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
  static extractUserProfileData(
    user: User,
    signupMethod: "email" | "oauth",
  ): UserProfileData {
    const { email, user_metadata, app_metadata } = user;
    console.log("I'm extractUserProfileData");

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
   * Check if user needs profile setup using backend API
   */
  static async checkUserSetupStatus(userId: string): Promise<UserSetupStatus> {
    console.log("I'm checkUserSetupStatus");
    try {
      console.log(`Checking user setup status for: ${userId}`);
      const response = await api.post<UserSetupStatus>(
        "/user-setup/check-status",
        { userId },
      );
      console.log("User setup status response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        `Failed to check user setup status: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ); // ADD THIS: Log with safe error handling
      return {
        hasProfile: false,
        hasRole: false,
        needsSetup: true,
      };
    }
  }
}
