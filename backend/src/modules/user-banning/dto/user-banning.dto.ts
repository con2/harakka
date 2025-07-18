import {
  UserBanHistoryRow,
  ViewUserBanStatusRow,
  BanType,
} from "../interfaces/user-banning.interface";

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

// Use the base Supabase types directly
export type UserBanHistoryDto = UserBanHistoryRow;
export type UserBanStatusDto = ViewUserBanStatusRow;

// Service response interfaces
export interface BanOperationResult {
  success: boolean;
  message: string;
}

export interface UserBanStatusCheck {
  userId: string;
  isBanned: boolean;
  banType?: string;
  banReason?: string;
  bannedAt?: Date;
  isPermanent?: boolean;
  isBannedForApp?: boolean;
  bannedOrganizations?: string[];
  bannedRoles?: Array<{ organizationId: string; roleId: string }>;
}
