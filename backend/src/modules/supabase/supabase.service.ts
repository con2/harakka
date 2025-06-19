import { Injectable, Logger } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ConfigService } from "@nestjs/config";
type Roles = "Admin" | "SuperVera" | "User";
@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly supabaseUrl: string;
  private readonly serviceRoleKey: string;
  private readonly anonKey: string;

  // Lazy-initialized clients
  private serviceClient: SupabaseClient | null = null;
  private anonClient: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {
    this.supabaseUrl = this.configService.get("SUPABASE_URL") ?? "";
    this.serviceRoleKey =
      this.configService.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    this.anonKey = this.configService.get("SUPABASE_ANON_KEY") ?? "";

    // Change from error to warning to prevent application crash
    if (!this.supabaseUrl) {
      this.logger.warn("SUPABASE_URL is not configured");
    }

    if (!this.serviceRoleKey) {
      this.logger.warn("SUPABASE_SERVICE_ROLE_KEY is not configured");
    }

    if (!this.anonKey) {
      this.logger.warn("SUPABASE_ANON_KEY is not configured");
    }
  }

  /**
   * Get the admin client with service role privileges
   * For admin operations like managing users
   */
  getServiceClient(): SupabaseClient {
    if (!this.serviceClient) {
      if (!this.serviceRoleKey) {
        this.logger.error(
          "Cannot initialize Supabase client: SUPABASE_SERVICE_ROLE_KEY is missing",
        );
        throw new Error(
          "Supabase service role key not configured. Check your environment variables.",
        );
      }
      this.serviceClient = createClient(this.supabaseUrl, this.serviceRoleKey);
    }
    return this.serviceClient;
  }

  /**
   * Get the client with anon key privileges
   * For regular user operations
   */
  getAnonClient(): SupabaseClient {
    if (!this.anonClient) {
      this.anonClient = createClient(this.supabaseUrl, this.anonKey);
    }
    return this.anonClient;
  }

  async getClientByRole(userId: string): Promise<SupabaseClient> {
    if (!userId) {
      this.logger.warn(
        "No user ID provided. Returning anonymous Supabase client.",
      );
      return this.getAnonClient();
    }

    const serviceClient = this.getServiceClient();

    const { data: userProfile, error } = await serviceClient
      .from("user_profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !userProfile) {
      this.logger.error(
        `Failed to fetch user profile for user ID: ${userId}`,
        error,
      );
      throw new Error("Unable to determine user role. Access denied.");
    }

    const userRole: Roles = (userProfile as { role: Roles }).role;

    const elevatedRoles = ["admin", "superVera", "service_role"];

    if (!userRole) {
      this.logger.error(`No role found for user ${userId}.`);
      throw new Error("User role is missing.");
    }

    if (elevatedRoles.includes(userRole)) {
      this.logger.debug(
        `User ${userId} has elevated role (${userRole}). Using service client.`,
      );
      return this.getServiceClient();
    } else {
      this.logger.debug(
        `User ${userId} has standard or unknown role (${userRole}). Using anon client.`,
      );
      return this.getAnonClient();
    }
  }
}
