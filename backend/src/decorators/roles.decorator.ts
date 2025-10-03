import { SetMetadata } from "@nestjs/common";
import { Enums } from "@common/supabase.types";

/**
 * Canonical list of role names recognised across the backend.
 * Using `as const satisfies ...` enables IDE autocomplete *and* compile-time validation.
 */
export const ROLE_NAMES = [
  "user",
  "tenant_admin",
  "super_admin",
  "storage_manager",
  "requester",
] as const satisfies readonly Enums<"roles_type">[]; // Cross check with Supabase `roles_type` enum

/**
 * RoleName is directly inferred from the array above.
 */
export type RoleName = (typeof ROLE_NAMES)[number];

/**
 * `@Public()` – mark a route or controller as open to everyone.
 *
 * When present, **AuthMiddleware** and **RolesGuard** both short‑circuit,
 * so the request reaches the handler even if the caller is not signed in.
 *
 * @example Open a whole controller
 * ```ts
 * @Public()
 * @Controller('tags')
 * export class TagController {
 *   @Get()                          // anonymous OK
 *   findAll() {}
 * }
 * ```
 *
 * @example Open one endpoint in an otherwise‑guarded controller
 * ```ts
 * @UseGuards(RolesGuard)
 * @Controller('items')
 * export class ItemController {
 *   @Public()
 *   @Get()               // open
 *   list() {}
 *
 *   @Roles(['admin'])
 *   @Patch(':id')        // protected
 *   update() {}
 * }
 * ```
 */
export const IS_PUBLIC_KEY = "is_public";

/**
 * Public decorator
 * Marks a route or controller as publicly accessible (no auth/roles guard).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * `@Roles()` – attach role requirements to a route or controller.
 *
 * The accompanying **RolesGuard** reads this metadata and compares it
 * against the caller’s `userRoles` array injected by *AuthMiddleware*.
 *
 * @param roles A list of role names the caller must satisfy.
 * @param meta  Optional behaviour:
 *  - `match: 'any' | 'all'` → require *one* or *every* role (default `'any'`).
 *  - `sameOrg: true`        → role(s) must belong to the organisation
 *                             referenced by `:organizationId` param or
 *                             `x-org-id` header.
 *
 * @example Require **any** admin‑type role in the same org
 * ```ts
 * @Roles(['admin', 'tenant_admin'], { sameOrg: true })
 * @Patch(':organizationId/bookings/:id')
 * updateBooking() {}
 * ```
 *
 * @example Require **all** listed roles
 * ```ts
 * @Roles(['storage_manager', 'requester'], { match: 'all' })
 * ```
 */
export const ROLES_KEY = "roles_meta";
export type RoleMatch = "any" | "all";

export interface RolesMeta {
  /** Required role names */
  roles: RoleName[];
  /**
   * Role‑matching strategy
   *  - 'any' (default): user must have **one or more** of the roles
   *  - 'all':           user must have **every** role listed
   */
  match?: RoleMatch;
  /**
   * Enforce that the role(s) belong to the organisation referenced
   * in the request (`:organizationId` param or `x-org-id` header).
   */
  sameOrg?: boolean;
}

export const Roles = (roles: RoleName[], meta: Omit<RolesMeta, "roles"> = {}) =>
  SetMetadata(ROLES_KEY, { roles, match: "any", ...meta });
