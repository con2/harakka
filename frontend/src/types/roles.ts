export interface UserRoleWithDetails {
  id?: string;
  user_id: string;
  organization_id: string;
  role_id: string;
  role_name: string;
  organization_name: string;
  is_active: boolean;
  created_at?: string;
}

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
  roles: UserRoleWithDetails[];
  organizations: UserOrganization[];
  loading: boolean;
  error: string | null;
  isSuperVera: boolean;
  hasRole: (roleName: string, organizationId?: string) => boolean;
  hasAnyRole: (roleNames: string[], organizationId?: string) => boolean;
  refreshRoles: () => Promise<void>;
}
