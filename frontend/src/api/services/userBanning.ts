import { api } from "../axios";
import {
  BanForOrgRequest,
  BanForAppRequest,
  UnbanRequest,
  SimpleBanHistoryItem,
  BanStatusItem,
  BanOperationResult,
  UserBanStatusCheck,
} from "@/types/userBanning";

/**
 * API service for user banning related endpoints
 */
export const userBanningApi = {
  /**
   * Ban a user for all roles in an organization
   */
  banForOrg: (data: BanForOrgRequest): Promise<BanOperationResult> =>
    api.post("/user-banning/ban-for-org", data),

  /**
   * Ban a user from the entire application
   */
  banForApp: (data: BanForAppRequest): Promise<BanOperationResult> =>
    api.post("/user-banning/ban-for-app", data),

  /**
   * Unban a user
   */
  unbanUser: (data: UnbanRequest): Promise<BanOperationResult> =>
    api.post("/user-banning/unban", data),

  /**
   * Get ban history for a specific user
   */
  getUserBanHistory: (userId: string): Promise<SimpleBanHistoryItem[]> =>
    api.get(`/user-banning/history/${userId}`),

  /**
   * Get all user ban statuses (admin overview)
   */
  getAllUserBanStatuses: (): Promise<BanStatusItem[]> =>
    api.get("/user-banning/statuses"),

  /**
   * Check ban status for a specific user
   */
  checkUserBanStatus: (userId: string): Promise<UserBanStatusCheck> =>
    api.get(`/user-banning/check/${userId}`),
};
