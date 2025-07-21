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
  user_id: string;
  banned_by: string;
  ban_type: string;
  action: string;
  ban_reason?: string;
  is_permanent: boolean | null;
  role_assignment_id?: string;
  organization_id?: string;
  affected_assignments?: Record<string, unknown>;
  banned_at: string | null;
  unbanned_at?: string;
  notes?: string;
  created_at: string | null;
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
