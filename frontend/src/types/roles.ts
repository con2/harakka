import { Database } from "@common/database.types";
import { ViewUserRolesWithDetails } from "@common/role.types";

export interface CreateUserRoleDto {
  user_id: string;
  organization_id: string;
  role_id: string;
}

export interface UpdateUserRoleDto {
  role_id?: string;
  is_active?: boolean;
}

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
  allUserRoles: ViewUserRolesWithDetails[];
  loading: boolean;
  adminLoading: boolean;
  error: string | null;
  adminError: string | null;
  errorContext: string | null;
  availableRoles: Database["public"]["Tables"]["roles"]["Row"][];
}
