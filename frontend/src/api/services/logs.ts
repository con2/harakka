import { api } from "../axios";
import { LogMessage } from "@/types";

/**
 * API service for logs-related endpoints
 */
export const logsApi = {
  /**
   * Get all logs (admin only)
   * @param page - Current page number (default: 2)
   * @param limit - Number of items per page (default: 20)
   * @param userId - Admin user ID for authorization
   * @returns Promise with all logs
   */
  // getAllLogs: async (
  //   userId: string,
  //   page = 2,
  //   limit = 20
  // ): Promise<LogMessage[]> => {
  //   return api.get("/logs", {
  //     headers: {
  //       "x-user-id": userId,
  //     },
  //     params: {
  //       page,
  //       limit,
  //     },
  //   });
  // },
  getAllLogs: (
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: LogMessage[];
    total: number;
    page: number;
    totalPages: number;
  }> => api.get(`/logs?page=${page}&limit=${limit}`),
}