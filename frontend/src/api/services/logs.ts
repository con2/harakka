import { api } from "../axios";
import { LogMessage } from "@/types";

/**
 * API service for logs-related endpoints
 */
export const logsApi = {
  /**
   * Get all logs (admin only)
   * @param userId - Admin user ID for authorization
   * @returns Promise with all logs
   */
  getAllLogs: async (userId: string): Promise<LogMessage[]> => {
    return api.get("/logs", {
      headers: {
        "x-user-id": userId,
      },
    });
  },
};
