import { Database } from "@common/supabase.types";

// Extract types directly from common Supabase types
type BanType =
  Database["public"]["Tables"]["user_ban_history"]["Row"]["ban_type"];

type UserBanHistoryRow =
  Database["public"]["Tables"]["user_ban_history"]["Row"];

export interface BanForOrgDto {
  userId: string;
  organizationId: string;
  banReason: string;
  isPermanent?: boolean;
  notes?: string;
}

export interface BanForAppDto {
  userId: string;
  banReason: string;
  isPermanent?: boolean;
  notes?: string;
}

export interface UnbanDto {
  userId: string;
  banType: BanType;
  organizationId?: string; // Required for banForOrg / legacy banForRole
  roleId?: string; // Legacy support for banForRole
  notes?: string;
}

// Operation result type
export interface BanOperationResult {
  success: boolean;
  message: string;
  banRecord?: UserBanHistoryRow;
  banRecords?: UserBanHistoryRow[];
  ban_history_id?: string;
}

// User ban status check type
export interface UserBanStatusCheck {
  userId: string;
  isBanned: boolean;
  isBannedForApp: boolean;
  bannedFromOrganizations: Array<{
    organizationId: string;
    organizationName: string | null;
  }>;
  banReason: string | null;
  latestBanType: string | null;
  latestAction: string | null;
  bannedAt: string | null;
  isPermanent: boolean | null;
}
