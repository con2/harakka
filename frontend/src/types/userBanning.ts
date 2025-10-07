import { Database } from "@common/supabase.types";

// Import Json type for use in our interfaces
export type BanAssignmentChange = {
  id?: string;
  role_assignment_id?: string;
  organization_id?: string;
  role_id?: string;
  was_active?: boolean;
  now_active?: boolean;
};

export interface BanAffectedAssignments {
  assignments?: BanAssignmentChange[];
}

// Supabase table types
export type UserBanHistoryRow =
  Database["public"]["Tables"]["user_ban_history"]["Row"];
export type UserBanHistoryInsert =
  Database["public"]["Tables"]["user_ban_history"]["Insert"];
export type UserBanHistoryUpdate =
  Database["public"]["Tables"]["user_ban_history"]["Update"];

// User Organization Roles table types
export type UserOrganizationRoleRow =
  Database["public"]["Tables"]["user_organization_roles"]["Row"];

// View types
export type ViewUserBanStatusRow =
  Database["public"]["Views"]["view_user_ban_status"]["Row"];

// Extract specific types from table definitions
export type BanType = UserBanHistoryRow["ban_type"];
export type BanAction = UserBanHistoryRow["action"];

export type BanForOrgRequest = {
  userId: string;
  organizationId: string;
  banReason: string;
  isPermanent?: boolean;
  notes?: string;
};

export type BanForAppRequest = {
  userId: string;
  banReason: string;
  isPermanent?: boolean;
  notes?: string;
};

export type UnbanRequest = {
  userId: string; // Changed from user_id to match backend
  banType: BanType; // Changed from ban_type to match backend
  organizationId?: string; // Changed from organization_id to match backend
  roleId?: string; // Changed from role_assignment_id to roleId to match backend
  notes?: string;
};

// Use the base Supabase types directly
export type UserBanStatusDto = ViewUserBanStatusRow;

// Simplified interfaces for Redux state to avoid deep type issues
export interface BanHistoryItem {
  id: string;
  user_id: string;
  banned_by: string;
  ban_type: string;
  action: string;
  ban_reason?: string | null;
  is_permanent: boolean | null;
  role_assignment_id?: string | null;
  organization_id?: string | null;
  affected_assignments?: BanAffectedAssignments | null;
  banned_at: string | null;
  unbanned_at?: string | null;
  notes?: string | null;
  created_at: string | null;
}

export interface BanStatusItem {
  user_id: string;
  visible_name: string | null;
  email: string | null;
  ban_status: string | null;
  ban_reason: string | null;
  banned_at: string | null;
  banned_by: string | null;
  banned_by_name: string | null;
  banned_by_email: string | null;
  is_permanent: boolean | null;
  ban_type: string | null;
  organization_id: string | null;
  organization_name: string | null;
  role_name: string | null;
  active_roles_count: number | null;
  total_organizations_count: number | null;
  profile_image_url: string | null;
}

// Service response interfaces (custom to API, not from DB)
export interface BanOperationResult {
  success: boolean;
  message: string;
  ban_history_id?: string;
  banRecord?: UserBanHistoryRow;
  banRecords?: UserBanHistoryRow[];
}

export interface BanOperationSummary {
  success: boolean;
  message: string;
}

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

// Simplified ban history interface for state management
export interface SimpleBanHistoryItem {
  id: string;
  user_id: string;
  banned_by: string;
  ban_type: string;
  action: string;
  ban_reason?: string | null;
  is_permanent?: boolean | null;
  role_assignment_id?: string | null;
  organization_id?: string | null;
  affected_assignments?: BanAffectedAssignments | null;
  banned_at?: string | null;
  unbanned_at?: string | null;
  notes?: string | null;
  created_at?: string | null;
}

// Redux state interface - using simplified types to avoid deep type issues
export interface UserBanningState {
  loading: boolean;
  error: string | null;
  banHistory: SimpleBanHistoryItem[];
  banStatuses: BanStatusItem[];
  userBanStatuses: Record<string, UserBanStatusCheck>;
  lastOperation: BanOperationSummary | null;
}
