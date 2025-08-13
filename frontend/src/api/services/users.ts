import { CreateUserDto } from "@common/user.types";
import { Database } from "@common/supabase.types";
import { api } from "../axios";
import { Address } from "@/types/address";
import { store } from "@/store/store";
import { ApiResponse } from "@/types/api";

// Params accepted by the /users/ordered endpoint
export type OrderedUsersParams = Partial<{
  page: number;
  limit: number;
  ordered_by: string;
  ascending: boolean;
  searchquery: string;
  org_filter: string;
}>;

/**
 * API service for user-related endpoints
 */
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

export const usersApi = {
  /**
   * Get all users for admin/main_admin with backend filtering/pagination
   * @param params - Query params for filtering, pagination, etc.
   * @returns Promise with paginated/filterable users
   */
  getAllOrderedUsers: (
    params: OrderedUsersParams,
  ): Promise<ApiResponse<UserProfile[]>> =>
    api.get("/users/ordered", { params }),
  /**
   * Get all users, optionally filtered by org
   * @param org_filter - Optional organization ID to filter users by
   * @returns Promise with an array of users
   */
  getAllUsers: (org_filter?: string): Promise<UserProfile[]> => {
    const params = org_filter ? { org_filter } : undefined;
    return api.get("/users", { params });
  },

  /**
   * Get current user's profile using the dedicated endpoint
   * @returns Promise with the current user
   */
  getCurrentUser: (): Promise<UserProfile> => api.get("/users/me"),

  /**
   * Get a specific user by ID
   * @param id - User ID to fetch
   * @returns Promise with the requested user
   */
  getUserById: (id: string): Promise<UserProfile> => {
    // Access current user ID from Redux store
    const state = store.getState();
    const currentUserId = state.users.selectedUser?.id;

    if (id === currentUserId) {
      return usersApi.getCurrentUser();
    }
    return api.get(`/users/${id}`);
  },

  /**
   * Create a new user
   * @param user - User data to create
   * @returns Promise with the created user
   */
  createUser: (user: CreateUserDto): Promise<UserProfile> =>
    api.post("/users", user),

  /**
   * Update an existing user
   * @param id - User ID to update
   * @param user - Updated user data
   * @returns Promise with the updated user
   */
  updateUser: (id: string, user: Partial<UserProfile>): Promise<UserProfile> =>
    api.put(`/users/${id}`, user),

  /**
   * Delete a user
   * @param id - User ID to delete
   */
  deleteUser: (id: string): Promise<void> => api.delete(`/users/${id}`),

  /**
   * Get addresses for a specific user
   * @param id - User ID to fetch addresses for
   * @returns Promise with an array of addresses
   */
  getAddresses: (id: string): Promise<Address[]> =>
    api.get(`/users/${id}/addresses`),

  /**
   * Add a new address for a user
   * @param id - User ID to add the address to
   * @param address - Address data to add
   * @returns Promise with the newly added address
   */
  addAddress: (id: string, address: Address): Promise<Address> =>
    api.post(`/users/${id}/addresses`, address),

  /**
   * Update an existing address for a user
   * @param id - User ID to update the address for
   * @param addressId - Address ID to update
   * @param address - Updated address data
   * @returns Promise with the updated address
   */
  updateAddress: (
    id: string,
    addressId: string,
    address: Address,
  ): Promise<Address> =>
    api.put(`/users/${id}/addresses/${addressId}`, address),

  /**
   * Delete an address for a user
   * @param id - User ID to delete the address from
   * @param addressId - Address ID to delete
   * @returns Promise indicating completion
   */
  deleteAddress: (id: string, addressId: string): Promise<void> =>
    api.delete(`/users/${id}/addresses/${addressId}`),

  /**
   * Get the total user count
   */
  getUserCount: () => api.get("users/count"),
};
