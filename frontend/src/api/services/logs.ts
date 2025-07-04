import { ApiResponse } from "@/types/api";
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
  getAllLogs: async (
    page: number = 1,
    limit: number = 10,
    level?: string,
    logType?: string,
    search?: string,
  ): Promise<{
    data: LogMessage[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    // build query params string
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (level) params.append("level", level);
    if (logType) params.append("logType", logType);
    if (search) params.append("search", search);

    const response: ApiResponse<LogMessage[]> = await api.get(
      `/logs?${params.toString()}`,
    );

    return {
      data: response.data,
      total: response.metadata.total,
      totalPages: response.metadata.totalPages,
      page: response.metadata.page,
    };
  },
};
