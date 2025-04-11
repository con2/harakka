import { CreateUserDto, UserProfile } from "@/types/user";
import { api } from "../axios";

// to be updated

export const usersApi = {
  getAllUsers: (): Promise<UserProfile[]> => api.get("http://localhost:3000/users"),
  getUserById: (id: string): Promise<UserProfile> => api.get(`http://localhost:3000/users/${id}`),
  createUser: (user: CreateUserDto): Promise<UserProfile> => api.post("http://localhost:3000/users", user),
  updateUser: (id: string, user: Partial<UserProfile>): Promise<UserProfile> => api.put(`http://localhost:3000/users/${id}`, user),
  deleteUser: (id: string): Promise<void> => api.delete(`http://localhost:3000/users/${id}`),
}