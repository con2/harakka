// User banning related types and interfaces

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
  banType: string;
  organizationId?: string;
  roleId?: string;
  notes?: string;
}

export interface UserBanHistoryDto {
  id: string;
  userId: string;
  bannedBy: string;
  banType: string;
  action: string;
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

export interface BanOperationResult {
  success: boolean;
  message: string;
  banHistoryId?: string;
}

export interface UserBanStatusCheck {
  userId: string;
  isBanned: boolean;
  banType?: string;
  banReason?: string;
  bannedAt?: Date;
  isPermanent?: boolean;
}

// Redux state interface
export interface UserBanningState {
  loading: boolean;
  error: string | null;
  banHistory: UserBanHistoryDto[];
  banStatuses: UserBanHistoryDto[];
  userBanStatuses: Record<string, UserBanStatusCheck>; // userId -> ban status
  lastOperation: BanOperationResult | null;
}

// Type definitions for ban types
export type BanType = "role" | "organization" | "application";
