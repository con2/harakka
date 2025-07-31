import { supabase } from "@/config/supabase";
import { RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import { DBTables } from "@common/database.types";

export type NotificationRow = DBTables<"notifications">;

/**
 * Reusable helper that
 *   1. fetches unread rows for an initial badge
 *   2. streams new inserts via Supabase Realtime
 * Returns an `unsubscribe` function.
 */
export function subscribeToNotifications(
  userId: string,
  onNew: (n: NotificationRow) => void,
): () => void {
  // 1️⃣  initial unread fetch
  supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .then(({ data }) => data?.forEach(onNew));

  // 2️⃣  live inserts
  const channel = supabase
    .channel("user:notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload: RealtimePostgresInsertPayload<NotificationRow>) =>
        onNew(payload.new),
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
