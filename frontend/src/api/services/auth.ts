import { supabase } from "@/config/supabase";
import { User } from "@supabase/supabase-js";
import { api } from "../axios";

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
    console.log("I'm setupNewUser");
    try {
      console.log(`🔍 SETUP: Starting setup for user ID: ${user.id}`);

      // Extract user data based on signup method
      const profileData = this.extractUserProfileData(user, signupMethod);

      // First, check if this user actually needs setup
      console.log(`Checking if user ${user.id} needs setup`);
      const setupStatus = await this.checkUserSetupStatus(user.id);
      console.log(`Setup status for ${user.id}:`, setupStatus);

      if (!setupStatus.needsSetup) {
        console.log(`User ${user.id} already setup, skipping`);
        return { success: true, user, isNewUser: false };
      }

      // Get auth token once
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      const token = session?.access_token;

      if (!session) {
        console.error("No authenticated session found");
        throw new Error("No authenticated session found");
      }

      console.log("🔄 Attempting direct fetch to setup endpoint");

      // Call backend API to setup user
      const setupPayload = {
        userId: user.id,
        email: profileData.email,
        full_name: userInput?.full_name || profileData.full_name,
        phone: userInput?.phone || profileData.phone,
        visible_name: profileData.visible_name,
        provider: profileData.provider,
      };
      console.log("📡 Sending setup request with payload:", {
        ...setupPayload,
        email: setupPayload.email
          ? `${setupPayload.email.substring(0, 3)}***`
          : null,
      });

      // Use the configured API URL from environment
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      console.log(`🔌 Using API URL: ${apiUrl}`);

      try {
        const response = await fetch(`${apiUrl}/user-setup/setup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(setupPayload),
        });

        // Test additional response properties
        console.log("✅ Response status:", response.status);
        console.log("✅ Response status text:", response.statusText);
        console.log("✅ Response headers:", [...response.headers.entries()]);

        // Parse and return result
        const result = await response.json();
        console.log("✅ Direct fetch result:", result);

        return {
          success: result.success,
          user,
          isNewUser: true,
        };
      } catch (fetchError) {
        console.error("❌ Direct fetch failed:", fetchError);
        throw fetchError;
      }
    } catch (error) {
      console.error(
        "User setup failed:",
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
