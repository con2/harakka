import * as React from "react";
import { Bell, X, Trash2, Check } from "lucide-react";

import { supabase } from "@/config/supabase";
import { DBTables } from "@common/database.types";
import { subscribeToNotifications } from "@/lib/notifications";
import { useNavigate } from "react-router-dom";

import { t } from "@/translations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/context/LanguageContext";

/**
 * <Notifications />
 * -----------------
 * Dropdown bell component that:
 * • Shows an unread badge
 * • Streams live inserts from Supabase Realtime
 * • Lets the user mark rows as read ✅ or delete them 🗑️
 *
 * Shared state mechanics:
 *  - `feed   ` raw rows
 *  - `feedUniq` deduped view (handles Realtime + initial fetch overlap)
 */

/**
 * React component that renders the bell icon + dropdown feed.
 *
 * @prop userId – current authenticated user; the DB policy ensures they
 *                only see their own rows.
 */
interface Props {
  userId: string;
}

type NotificationRow = DBTables<"notifications">;

export const Notifications: React.FC<Props> = ({ userId }) => {
  const [feed, setFeed] = React.useState<NotificationRow[]>([]);

  const feedUniq = React.useMemo(
    () => Array.from(new Map(feed.map((n) => [n.id, n])).values()),
    [feed],
  );

  const unseen = React.useMemo(
    () => feedUniq.filter((n) => n.read_at === null).length,
    [feedUniq],
  );

  const upsert = React.useCallback(
    (list: NotificationRow[], n: NotificationRow) =>
      list.some((x) => x.id === n.id) ? list : [n, ...list],
    [],
  );

  const navigate = useNavigate();

  const { lang } = useLanguage();

  // live subscription — mount / unmount
  React.useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToNotifications(
      userId,
      (n: NotificationRow) => {
        setFeed((prev) => upsert(prev, n));
      },
    );

    return unsubscribe;
  }, [userId, upsert]);

  /** Optimistically sets `read_at` in UI, then persists to DB. */
  const markRead = async (id: string) => {
    setFeed((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
      ),
    );
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
  };

  /** Marks **every** unread notification as read in one batch. */
  const markAllRead = async () => {
    const ids = feedUniq.filter((n) => n.read_at === null).map((n) => n.id);
    if (ids.length === 0) return;

    setFeed((prev) =>
      prev.map((n) =>
        n.read_at === null ? { ...n, read_at: new Date().toISOString() } : n,
      ),
    );

    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", ids);
  };

  /** Deletes a row locally *and* remotely (requires RLS delete policy). */
  const removeNotification = async (id: string) => {
    // delete from local state first
    setFeed((prev) => prev.filter((n) => n.id !== id));

    // delete from DB (owner-only; make sure RLS policy exists)
    await supabase.from("notifications").delete().eq("id", id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label={t.navigation.aria.labels.notifications[lang].replace(
            "{number}",
            unseen.toString(),
          )}
          className="relative hover:bg-(--subtle-grey) w-fit px-2"
        >
          <Bell aria-hidden className="!h-4.5 !w-5 text-(--midnight-black)" />
          {unseen > 0 && (
            <Badge className="absolute -right-1 -top-1 h-4 min-w-[1rem] px-1 text-[0.625rem] font-sans text-white leading-none !bg-(--emerald-green)">
              {unseen}
            </Badge>
          )}
          <span className="sr-only">
            {t.navigation.notifications.srOpen[lang]}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 md:w-96" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{t.navigation.notifications.label[lang]}</span>
          {unseen > 0 && (
            <Button
              size="sm"
              variant="ghost"
              title={t.navigation.notifications.markAllRead[lang]}
              onClick={markAllRead}
              className="h-5 w-5"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {feedUniq.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            {t.navigation.notifications.none[lang]}
          </p>
        ) : (
          <ScrollArea className="max-h-[70vh]">
            {feedUniq.map((n) => {
              // -------- translate title / message ---------------------------------
              const tpl = // Translation template for this notification type
                (
                  t.notification as Record<
                    string,
                    (typeof t.notification)[keyof typeof t.notification]
                  >
                )[n.type] ?? null;

              const safe = (v: unknown) =>
                typeof v === "string" || typeof v === "number" ? String(v) : "";

              const interpolate = (s: string) =>
                s
                  .replace(
                    "{num}",
                    "booking_number" in n.metadata
                      ? safe(n.metadata.booking_number)
                      : "",
                  )
                  .replace(
                    "{email}",
                    "email" in n.metadata ? safe(n.metadata.email) : "",
                  );

              const title = tpl ? interpolate(tpl.title[lang]) : n.title;
              const message =
                tpl && tpl.message[lang]
                  ? interpolate(tpl.message[lang])
                  : (n.message ?? "");

              return (
                // One notification card — click -> navigate; small buttons handle read/delete
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => {
                    void markRead(n.id); // mark read on click

                    if (n.type === "user.created") {
                      void navigate("/admin/users");
                    } else if (
                      (n.type === "booking.created" ||
                        n.type === "booking.status_approved" ||
                        n.type === "booking.status_rejected") &&
                      "booking_id" in n.metadata
                    ) {
                      // Navigate to the detailed booking view
                      const bookingId = safe(n.metadata.booking_id);
                      void navigate(`/admin/bookings/${bookingId}`);
                    }
                  }}
                  className="flex flex-col gap-0.5 py-2 cursor-pointer"
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{title}</span>
                      {message && (
                        <span className="text-xs text-muted-foreground">
                          {message}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {n.read_at === null && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            void markRead(n.id);
                          }}
                          className="h-5 w-5"
                          title="Mark as read"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          void removeNotification(n.id);
                        }}
                        className="h-5 w-5"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
