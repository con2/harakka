import { CreateUserDto, UserProfile } from "@common/user.types";
import { api } from "../axios";
import { Address } from "@/types/address";

/**
 * API service for user-related endpoints
 */
export const usersApi = {
  /**
   * Get all users
   * @returns Promise with an array of users
   */
  getAllUsers: (): Promise<UserProfile[]> => api.get("/users"),

  /**
   * Get a specific user by ID
   * @param id - User ID to fetch
   * @returns Promise with the requested user
   */
  getUserById: (id: string): Promise<UserProfile> => api.get(`/users/${id}`),

  getCurrentUser: (): Promise<UserProfile> => api.get("/users/me"),
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

  /**
   * Upload new proile picture for the current user
   * @param file - The file to upload
   * @returns Promise with the URL of the uploaded picture
   */
  uploadProfilePicture: (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/users/upload-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
