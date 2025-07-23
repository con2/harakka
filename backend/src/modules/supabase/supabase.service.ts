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
}
