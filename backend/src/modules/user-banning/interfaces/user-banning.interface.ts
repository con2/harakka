import { Database } from "@common/database.types";

// User Ban History table types
export type UserBanHistoryRow =
  Database["public"]["Tables"]["user_ban_history"]["Row"];
export type UserBanHistoryInsert =
  Database["public"]["Tables"]["user_ban_history"]["Insert"];
export type UserBanHistoryUpdate =
  Database["public"]["Tables"]["user_ban_history"]["Update"];

// User Organization Roles table types
export type UserOrganizationRoleRow =
  Database["public"]["Tables"]["user_organization_roles"]["Row"];
export type UserOrganizationRoleInsert =
  Database["public"]["Tables"]["user_organization_roles"]["Insert"];
export type UserOrganizationRoleUpdate =
  Database["public"]["Tables"]["user_organization_roles"]["Update"];

// View types
export type ViewUserBanStatusRow =
  Database["public"]["Views"]["view_user_ban_status"]["Row"];

// Extract specific types from table definitions
export type BanType = UserBanHistoryRow["ban_type"];
export type BanAction = UserBanHistoryRow["action"];
