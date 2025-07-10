import "reflect-metadata";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { RolesGuard } from "../roles.guard";
import {
  RoleName,
  RolesMeta,
  ROLES_KEY,
  IS_PUBLIC_KEY,
} from "../../decorators/roles.decorator";

interface FakeUserRole {
  role_name: RoleName;
  organization_id: string | null;
}

const reflector = new Reflector();
const guard = new RolesGuard(reflector);

/** Convenience builder for an ExecutionContext stub */
function mockContext({
  isPublic = false,
  meta,
  userRoles = [],
  orgParam,
  orgHeader,
}: {
  isPublic?: boolean;
  meta?: RolesMeta;
  userRoles?: FakeUserRole[];
  orgParam?: string;
  orgHeader?: string;
} = {}): ExecutionContext {
  const handler = () => {};
  if (isPublic) Reflect.defineMetadata(IS_PUBLIC_KEY, true, handler);
  if (meta) Reflect.defineMetadata(ROLES_KEY, meta, handler);

  const req: any = {
    userRoles,
    params: orgParam ? { organizationId: orgParam } : {},
    headers: orgHeader ? { "x-org-id": orgHeader } : {},
  };

  return {
    getHandler: () => handler,
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as unknown as ExecutionContext;
}

describe("RolesGuard", () => {
  it("allows @Public() routes", () => {
    const ctx = mockContext({ isPublic: true });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("allows routes without @Roles() metadata", () => {
    const ctx = mockContext();
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("allows when user has any required role (default match)", () => {
    const meta: RolesMeta = { roles: ["admin"] };
    const ctx = mockContext({
      meta,
      userRoles: [{ role_name: "admin", organization_id: "org1" }],
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("blocks when user lacks required role", () => {
    const meta: RolesMeta = { roles: ["admin"] };
    const ctx = mockContext({
      meta,
      userRoles: [{ role_name: "user", organization_id: "org1" }],
    });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("enforces match:'all'", () => {
    const meta: RolesMeta = {
      roles: ["admin", "storage_manager"],
      match: "all",
    };
    const ctx = mockContext({
      meta,
      userRoles: [
        { role_name: "admin", organization_id: "org1" },
        // missing storage_manager
      ],
    });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("enforces sameOrg when flag set", () => {
    const meta: RolesMeta = { roles: ["admin"], sameOrg: true };
    const ctx = mockContext({
      meta,
      userRoles: [{ role_name: "admin", organization_id: "org1" }],
      orgParam: "org2", // mismatched org
    });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);

    const ctxMatch = mockContext({
      meta,
      userRoles: [{ role_name: "admin", organization_id: "org1" }],
      orgParam: "org1",
    });
    expect(guard.canActivate(ctxMatch)).toBe(true);
  });

  it("bypasses checks for super_admin", () => {
    const meta: RolesMeta = { roles: ["admin"] };
    const ctx = mockContext({
      meta,
      userRoles: [{ role_name: "super_admin", organization_id: null }],
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
