import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "src/types/supabase";
import { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";

/**
 * AuthenticatedRequest
 *
 * Extends the Express Request object to include:
 *  - `supabase`: A Supabase client scoped with the caller's JWT.
 *  - `user`: The decoded user object returned from Supabase Auth.
 */
interface AuthenticatedRequest extends Request {
  supabase: SupabaseClient<Database>;
  user: User;
}

/**
 * AuthMiddleware
 *
 * Responsibilities:
 * 1. Extract the JWT from the Authorization header or `sb-access-token` cookie.
 * 2. Verify the token's signature and expiry locally using SUPABASE_JWT_SECRET.
 * 3. Create a per‑request Supabase client (anon key + Bearer token) so that
 *    Row‑Level Security policies apply to every query.
 * 4. Attach `supabase` and `user` to the request for downstream use.
 *
 * NOTE: No role/permission checks are performed here; We can create a gaurd for those admin endpoints.
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly supabaseUrl: string;
  private readonly anonKey: string;
  private readonly jwtSecret: Uint8Array;
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(private readonly config: ConfigService) {
    this.supabaseUrl = this.config.get<string>("SUPABASE_URL", "");
    this.anonKey = this.config.get<string>("SUPABASE_ANON_KEY", "");
    const secret = this.config.get<string>("SUPABASE_JWT_SECRET", "");
    if (!this.supabaseUrl || !this.anonKey || !secret) {
      throw new Error(
        "Supabase environment variables SUPABASE_URL, SUPABASE_ANON_KEY, or SUPABASE_JWT_SECRET are missing",
      );
    }
    this.jwtSecret = new TextEncoder().encode(secret);
  }

  async use(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    this.logger.log(
      `[${new Date().toISOString()}] Authenticating request to: ${req.method} ${req.path}`,
    );

    try {
      const token = this.extractToken(req);
      if (!token) {
        this.logger.warn(
          `[${new Date().toISOString()}] Authentication failed: Missing access token`,
        );
        throw new UnauthorizedException("Missing access token");
      }

      //  Local signature/expiry verification (fast)
      await jwtVerify(token, this.jwtSecret, { algorithms: ["HS256"] });

      //  Create a user‑scoped Supabase client (RLS applies)
      const supabase = createClient<Database>(this.supabaseUrl, this.anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false },
      });

      //  Fetch full user profile
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        this.logger.warn(
          `[${new Date().toISOString()}] Authentication failed: Invalid or expired token`,
        );
        throw new UnauthorizedException("Invalid or expired token");
      }

      this.logger.log(
        `[${new Date().toISOString()}] Authentication successful for user ID: ${user.id} Email: ${user.email}`,
      );

      req.supabase = supabase;
      req.user = user;

      return next();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error(
        `[${new Date().toISOString()}] Authentication error: ${error.message}`,
      );
      throw new UnauthorizedException("Unauthorized: " + error.message);
    }
  }

  /**
   * Extract a JWT from either the Authorization header
   * (`Authorization: Bearer <token>`) or the `sb-access-token`
   * cookie that Supabase SSR helpers set. Returns `null`
   * when neither is present.
   */

  private extractToken(req: Request): string | null {
    const header = req.headers.authorization;
    return header?.startsWith("Bearer ") ? header.slice(7) : null;
  }
}
