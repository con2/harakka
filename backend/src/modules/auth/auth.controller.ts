//USED ONLY FOR TESTING PURPOSES
import { Controller, Post, Body, Logger, Get, Req } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ConfigService } from "@nestjs/config";
import { AuthRequest } from "../../middleware/interfaces/auth-request.interface";
import * as jwt from "jsonwebtoken";
import { CustomJWTPayload } from "./auth.types";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly supabase: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    this.supabase = createClient(
      this.config.get<string>("SUPABASE_URL")!,
      this.config.get<string>("SUPABASE_ANON_KEY")!,
    );
  }

  @Post("test-login")
  async getTestToken(@Body() body: { email: string; password: string }) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password,
      });

      if (error) {
        throw new Error(`Login failed: ${error.message}`);
      }

      // Decode JWT to show roles (safer approach)
      const payload = jwt.decode(data.session.access_token) as CustomJWTPayload;

      if (!payload) {
        throw new Error("Failed to decode JWT token");
      }

      // Format the token for easy copy-paste
      const formattedToken = data.session.access_token;

      this.logger.log(`🎫 Fresh token generated for ${body.email}`);
      this.logger.log(`📋 Token (copy for Postman): ${formattedToken}`);

      return {
        success: true,
        message: "✅ Fresh token generated with latest role metadata",
        access_token: formattedToken,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user_info: {
          id: data.user.id,
          email: data.user.email,
        },
        jwt_metadata: {
          roles_in_jwt: payload.app_metadata?.roles || [],
          role_count: payload.app_metadata?.roles?.length || 0,
          last_role_sync: payload.app_metadata?.last_role_sync,
        },
        performance_info: {
          will_use_jwt_path: (payload.app_metadata?.roles?.length || 0) > 0,
          optimization_status:
            (payload.app_metadata?.roles?.length || 0) > 0
              ? "🚀 Optimized - will use JWT path (fast)"
              : "⚠️ Not optimized - will use database fallback (slower)",
        },
        instructions: {
          postman:
            "Copy the access_token above and use as Bearer token in Postman",
          next_steps: "Make API requests to see JWT optimization in action",
        },
      };
    } catch (error) {
      this.logger.error("Test login failed:", error);
      throw error;
    }
  }

  @Get("token-info")
  getCurrentTokenInfo(@Req() req: AuthRequest) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        throw new Error("No token provided");
      }

      // Decode current JWT
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString(),
      ) as CustomJWTPayload;

      const hasRoles = (payload.app_metadata?.roles?.length || 0) > 0;

      return {
        success: true,
        user_id: req.user.id,
        email: req.user.email,
        current_token_info: {
          has_roles_in_jwt: hasRoles,
          role_count: payload.app_metadata?.roles?.length || 0,
          roles: payload.app_metadata?.roles || [],
          last_sync: payload.app_metadata?.last_role_sync,
          expires_at: new Date(payload.exp * 1000).toISOString(),
        },
        performance_status: {
          current_path: hasRoles ? "JWT (optimized)" : "Database (fallback)",
          performance: hasRoles ? "🚀 Fast" : "⚠️ Slower",
          recommendation: hasRoles
            ? "Token is optimized - using fast JWT path"
            : "Token missing roles - using database fallback. Get fresh token via /auth/test-login",
        },
      };
    } catch (error) {
      this.logger.error("Token info failed:", error);
      throw error;
    }
  }

  @Post("get-fresh-token")
  async getFreshToken(@Body() body: { email: string; password: string }) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password,
      });

      if (error) {
        throw new Error(`Login failed: ${error.message}`);
      }

      // Decode JWT to show current roles
      const payload = JSON.parse(
        Buffer.from(
          data.session.access_token.split(".")[1],
          "base64",
        ).toString(),
      ) as CustomJWTPayload;

      const hasRoles = (payload.app_metadata?.roles?.length || 0) > 0;

      return {
        success: true,
        message: hasRoles
          ? "🚀 Fresh token with JWT optimization!"
          : "⚠️ Token without roles (will be updated on next request)",
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        jwt_analysis: {
          has_roles: hasRoles,
          role_count: payload.app_metadata?.roles?.length || 0,
          roles: payload.app_metadata?.roles || [],
          optimization_status: hasRoles
            ? "JWT Path (Fast)"
            : "Database Fallback (Slower)",
        },
        test_instructions: {
          step1: "Copy the access_token above",
          step2: "Use it as Bearer token in your requests",
          step3:
            "If no roles in JWT yet, make one request to trigger JWT update",
          step4: "Get another fresh token - it should then have roles in JWT",
        },
      };
    } catch (error) {
      this.logger.error("Fresh token generation failed:", error);
      throw new Error(
        `Failed to generate fresh token: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
