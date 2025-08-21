import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  ROLES_KEY,
  IS_PUBLIC_KEY,
  RolesMeta,
  RoleName,
} from "../decorators/roles.decorator";
import { AuthRequest } from "../middleware/interfaces/auth-request.interface";

/**
 * RolesGuard
 *
 * Evaluates @Public() and @Roles() metadata to authorise a request.
 * Relies on AuthMiddleware to attach `userRoles` to the request.
 */
/**
 * `RolesGuard`
 *
 * Central gatekeeper that enforces `@Public()` and `@Roles()` metadata.
 * Register it:
 *
 * ```ts
 * // Global – affects every request
 * providers: [{ provide: APP_GUARD, useClass: RolesGuard }]
 *
 * // Per‑controller
 * @UseGuards(RolesGuard)
 * export class BookingController {}
 * ```
 *
 * **Behaviour**
 * 1. If the route/class is annotated with `@Public()`, access is granted.
 * 2. If no `@Roles()` metadata is found, the route is implicitly public.
 * 3. Otherwise the caller must:
 *    - hold the required role(s) according to `match`,
 *    - optionally belong to the same organisation when `sameOrg` is `true`.
 * 4. Users with the `super_admin` role bypass all checks.
 *
 * @see Roles
 * @see Public
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    //  Public routes bypass all checks
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    //  Retrieve @Roles metadata (if any)
    const meta = this.reflector.getAllAndOverride<RolesMeta>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!meta) return true; // route is implicitly public

    const { roles: required, match = "any", sameOrg } = meta;
    const req = context.switchToHttp().getRequest<AuthRequest>();
    const userRoles = req.user?.app_metadata?.roles ?? [];

    // Optional super_admin bypass
    if (userRoles.some((r) => r.role_name === "super_admin")) return true;

    //Allow "user" role to access/modify their own user resource
    if (
      userRoles.some((r) => r.role_name === "user") &&
      req.user &&
      req.params &&
      req.params.id &&
      req.user.id === req.params.id
    ) {
      // Only allow if the required role is "user"
      if (required.includes("user")) {
        return true;
      }
    }

    // Determine organisation context when sameOrg flag is set
    const orgCtx = sameOrg ? req.activeRoleContext?.organizationId : undefined;
    const roleCtx = sameOrg ? req.activeRoleContext?.roleName : undefined;
    // If sameOrg is required, but orgId or roleName is missing — forbid access
    if (sameOrg && (!orgCtx || !roleCtx)) {
      throw new ForbiddenException(
        "Organization context or role is missing (check request headers (Postman) or activeRoleContextfrontend)",
      );
    }

    // Evaluate role matches
    const matches = userRoles.filter(
      (ur) =>
        required.includes(ur.role_name as RoleName) &&
        (!orgCtx || ur.organization_id === orgCtx),
    );

    const allowed =
      match === "all" ? matches.length === required.length : matches.length > 0;

    if (!allowed) {
      throw new ForbiddenException("Insufficient role");
    }
    return true;
  }
}
