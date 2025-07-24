import { Database } from "@common/supabase.types";

// Database types from common
export type UserBanHistoryDto =
  Database["public"]["Tables"]["user_ban_history"]["Row"];
export type ViewUserBanStatusRow =
  Database["public"]["Views"]["view_user_ban_status"]["Row"];
export type UserBanStatusDto = ViewUserBanStatusRow;
