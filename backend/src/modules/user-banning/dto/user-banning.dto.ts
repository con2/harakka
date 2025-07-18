import { BanType, BanAction } from "../interfaces/user-banning.interface";

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

export interface UserBanHistoryDto {
  id: string;
  userId: string;
  bannedBy: string;
  banType: BanType;
  action: BanAction;
  banReason?: string;
  isPermanent: boolean | null;
  roleAssignmentId?: string;
  organizationId?: string;
  affectedAssignments?: Record<string, unknown>;
  bannedAt: Date | null;
  unbannedAt?: Date;
  notes?: string;
  createdAt: Date | null;
}

export interface UserBanStatusDto {
  id: string;
  email: string;
  fullName?: string;
  visibleName?: string;
  userCreatedAt: Date;
  activeRolesCount: number;
  inactiveRolesCount: number;
  banStatus: "active" | "partially_banned" | "banned_app";
  latestBanType?: BanType;
  latestAction?: BanAction;
  banReason?: string;
  isPermanent?: boolean;
  bannedBy?: string;
  bannedAt?: Date;
  unbannedAt?: Date;
  bannedByName?: string;
  bannedByEmail?: string;
}

// Service response interfaces
export interface BanOperationResult {
  success: boolean;
  message: string;
}

export interface UserBanStatusCheck {
  isBannedForApp: boolean;
  bannedOrganizations: string[];
  bannedRoles: Array<{ organizationId: string; roleId: string }>;
}
