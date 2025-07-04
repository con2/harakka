import { UserRoleWithDetails } from "../interfaces/role.interface";

/**
 * DTO for creating a new user role assignment
 */
export interface CreateUserRoleDto {
  user_id: string;
  organization_id: string;
  role_id: string;
}

/**
 * DTO for updating a user role assignment
 */
export interface UpdateUserRoleDto {
  role_id?: string;
  is_active?: boolean;
}

/**
 * Response interface for role operations //TODO: change to Athina's general api response
 */
export interface RoleOperationResponse {
  success: boolean;
  message: string;
  data?: UserRoleWithDetails;
}
