import { Database } from "@common/supabase.types";

// Extract types directly from common Supabase types
type BanType =
  Database["public"]["Tables"]["user_ban_history"]["Row"]["ban_type"];

export interface BanForRoleDto {
  userId: string;
  organizationId: string;
  roleId: string;
  banReason: string;
  isPermanent?: boolean;
  notes?: string;
}

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
  organizationId?: string; // Required for banForOrg
  roleId?: string; // Required for banForRole
  notes?: string;
}

// Operation result type
export interface BanOperationResult {
  success: boolean;
  message: string;
  data?: unknown;
}

// User ban status check type
export interface UserBanStatusCheck {
  userId: string;
  isBannedFromApp: boolean;
  bannedFromOrganizations: string[];
  bannedFromRoles: string[];
}
