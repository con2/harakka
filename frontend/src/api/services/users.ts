import { CreateUserDto, UserProfile } from "@/types/user";
import { api } from "../axios";

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
};
