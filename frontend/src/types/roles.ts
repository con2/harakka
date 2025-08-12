import {
  DBTables,
  DBTablesInsert,
  DBTablesUpdate,
} from "@common/database.types";
import { ViewUserRolesWithDetails } from "@common/role.types";

export type CreateUserRoleDto = DBTablesInsert<"user_organization_roles">;

export type UpdateUserRoleDto = DBTablesUpdate<"user_organization_roles">;

export type RolesRow = DBTables<"roles">;

export interface RoleCheckResponse {
  hasRole: boolean;
  roleName: string;
  organizationId?: string;
}

export interface UserOrganization {
  organization_id: string;
  organization_name: string;
  roles: string[];
}

export interface UseRolesReturn {
  roles: ViewUserRolesWithDetails[];
  organizations: UserOrganization[];
  loading: boolean;
  error: string | null;
  hasRole: (roleName: string, organizationId?: string) => boolean;
  hasAnyRole: (roleNames: string[], organizationId?: string) => boolean;
  refreshRoles: () => Promise<void>;
}

export interface ActiveRoleContext {
  organizationId: string | null;
  roleName: string | null;
  organizationName: string | null;
  slug: string | null;
}

export interface RolesState {
  currentUserRoles: ViewUserRolesWithDetails[];
  currentUserOrganizations: UserOrganization[];
  allUserRoles: ViewUserRolesWithDetails[];
  loading: boolean;
  adminLoading: boolean;
  error: string | null;
  adminError: string | null;
  errorContext: string | null;
  availableRoles: RolesRow[];
  activeRoleContext: ActiveRoleContext;
}
