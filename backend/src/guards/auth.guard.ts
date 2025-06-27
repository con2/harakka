import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  mixin,
  Type,
} from "@nestjs/common";
import { verify } from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { CustomRequest } from "src/types/request.types";

/** Accept one or more allowed roles */
export function AuthGuard(...requiredRoles: string[]): Type<CanActivate> {
  @Injectable()
  class RoleGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const req: CustomRequest = context.switchToHttp().getRequest();
      const auth = req.headers["authorization"];
      if (!auth || !auth.startsWith("Bearer ")) {
        throw new UnauthorizedException("Missing auth token");
      }

      const token = auth.slice(7);
      let payload: JwtPayload;
      try {
        // Add the SUPABASE_JWT_SECRET to your environment variables
        if (!process.env.SUPABASE_JWT_SECRET) {
          throw new Error("JWT secret is not defined");
        }
        payload = verify(token, process.env.SUPABASE_JWT_SECRET!) as JwtPayload;
      } catch (err) {
        if (err instanceof Error) {
          console.error("Token verification error:", err.message);
        }
        throw new UnauthorizedException("Invalid token");
      }

      // allow any of the required roles
      const userRole = payload.app_metadata?.role;
      if (!userRole || !requiredRoles.includes(userRole)) {
        throw new ForbiddenException(
          `Requires role: ${requiredRoles.join(" or ")}, but user has role ${userRole}`,
        );
      }

      // attach user info if you like
      req.user = payload;
      return true;
    }
  }

  return mixin(RoleGuard);
}
