import type { Database } from "src/types/supabase.types";
import { Controller, Get, Req } from "@nestjs/common";
import { AuthTestService } from "./authTest.service";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";

@Controller("auth-test")
export class AuthTestController {
  constructor(private readonly authTestService: AuthTestService) {}

  /**
   * GET /auth-test/profile
   *
   * Returns the caller's row in `user_profiles`.
   * Relies on AuthMiddleware having already attached
   * `req.supabase` (client scoped with the caller's JWT)
   * and `req.user` (decoded user object).
   */
  @Get("profile")
  async getProfile(
    @Req() req: AuthRequest,
  ): Promise<Database["public"]["Tables"]["user_profiles"]["Row"]> {
    return this.authTestService.getProfile(req);
  }
}
