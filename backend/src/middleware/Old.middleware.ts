import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { NextFunction, Request, Response } from "express";
interface AuthenticatedRequest extends Request {
  supabase: SupabaseClient;
  user: User; // Add the user property here
}
@Injectable()
export class OLDAuthMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    console.log(
      `[${new Date().toISOString()}] Authenticating request to: ${req.method} ${req.path}`,
    );

    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log(
          `[${new Date().toISOString()}] Authentication failed: Missing or invalid token`,
        );
        throw new UnauthorizedException(
          "Missing or invalid authorization token",
        );
      }

      const token = authHeader.split(" ")[1];

      // Initialize Supabase client with service role key for server-side operations
      const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
      const supabaseAnonKey =
        this.configService.get<string>("SUPABASE_ANON_KEY");

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
          "Supabase URL or Anon key not found in environment variables",
        );
      }
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      // Verify the user's JWT token
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        console.log(
          `[${new Date().toISOString()}] Authentication failed: Invalid or expired token`,
        );
        throw new UnauthorizedException("Invalid or expired token");
      }
      // Keep this for logging purposes
      console.log(
        `[${new Date().toISOString()}] Authentication successful for user ID: ${user.id} Email: ${user.email}`,
      );

      // Attach the user to the request
      req["user"] = user;
      req["supabase"] = supabase;

      next();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(
        `[${new Date().toISOString()}] Authentication error:`,
        err.message,
      );
      throw new UnauthorizedException("Unauthorized: " + err.message);
    }
  }
}
