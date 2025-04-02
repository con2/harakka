import { UserProfile } from "@/types/user";
import { api } from "../axios";

// to be updated

export const usersApi = {
  getUsers: (): Promise<UserProfile[]> => api.get("http://localhost:3000/users")
}