import type { Database } from "src/types/supabase.types";
import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from "@nestjs/common";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";

type UserProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];

@Injectable()
export class AuthTestService {
  /**
   * Fetch the current user's profile from the `user_profiles` table.
   * Expects `req.supabase` (anon-key client + Bearer token) and
   * `req.user` (decoded JWT) to be present—both are set by AuthMiddleware.
   */
  async getProfile(
    req: AuthRequest,
  ): Promise<Database["public"]["Tables"]["user_profiles"]["Row"]> {
    // The middleware attaches these properties using "any" indexing

    // to avoid augmenting the Express Request definition globally.
    const supabase = req.supabase;
    const user = req.user;

    if (!supabase || !user) {
      throw new UnauthorizedException("Request is missing auth context");
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single<UserProfileRow>();

    if (error) {
      // surface Supabase errors as 500s for now; refine as needed
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }
}
