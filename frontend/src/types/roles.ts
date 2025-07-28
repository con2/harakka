import {
  DBTables,
  DBTablesInsert,
  DBTablesUpdate,
} from "@common/database.types";
import { ViewUserRolesWithDetails } from "@common/role.types";

export type CreateUserRoleDto = DBTablesInsert<"user_organization_roles">;

export type UpdateUserRoleDto = DBTablesUpdate<"user_organization_roles">;

export type stateAvailableRoles = DBTables<"roles">[];
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
  isSuperVera: boolean;
  hasRole: (roleName: string, organizationId?: string) => boolean;
  hasAnyRole: (roleNames: string[], organizationId?: string) => boolean;
  refreshRoles: () => Promise<void>;
}

export interface RolesState {
  currentUserRoles: ViewUserRolesWithDetails[];
  currentUserOrganizations: UserOrganization[];
  isSuperVera: boolean;
  isSuperAdmin: boolean;
  allUserRoles: ViewUserRolesWithDetails[];
  loading: boolean;
  adminLoading: boolean;
  error: string | null;
  adminError: string | null;
  errorContext: string | null;
  availableRoles: stateAvailableRoles;
}
