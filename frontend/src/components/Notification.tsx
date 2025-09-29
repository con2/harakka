import * as React from "react";
import { Bell, X, Trash2 } from "lucide-react";

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
import { useAppSelector } from "@/store/hooks";
import {
  selectActiveOrganizationId,
  selectActiveRoleName,
} from "@/store/slices/rolesSlice";

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
  const [viewAll, setViewAll] = React.useState(false);
  console.log("VIEW_ALL", viewAll);
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
  const activeOrgId = useAppSelector(selectActiveOrganizationId);
  const activeRoleName = useAppSelector(selectActiveRoleName);

  // Debug helper – enable via localStorage('notifDebug'='1') or ?notifDebug=1
  const isDebugEnabled = (): boolean => {
    try {
      if (typeof window !== "undefined") {
        const ls = window.localStorage?.getItem("notifDebug");
        if (ls && ls !== "0" && ls !== "false") return true;
        const qp = new URLSearchParams(window.location.search);
        if (qp.get("notifDebug") === "1") return true;
        if (/localhost|127\.0\.0\.1/.test(window.location.hostname))
          return true;
      }
      const vite = (import.meta as any)?.env;
      if (vite?.DEV === true) return true;
      if (vite?.MODE === "development") return true;
      const nodeEnv =
        typeof process !== "undefined"
          ? (process as any).env?.NODE_ENV
          : undefined;
      if (nodeEnv === "development") return true;
    } catch {}
    return false;
  };
  const dlog = (...args: unknown[]) => {
    if (isDebugEnabled()) console.log("[Notifications]", ...args);
  };

  // Filter notifications according to active role/org context
  const inActiveContext = React.useCallback(
    (n: NotificationRow) => {
      if (n.severity === "critical") return true;
      const meta = (n.metadata ?? {}) as Record<string, unknown>;
      const orgId =
        typeof meta.organization_id === "string" ? meta.organization_id : null;
      const audience = Array.isArray(meta.audience_roles)
        ? (meta.audience_roles as string[]).filter((r) => typeof r === "string")
        : [];

      if (orgId && activeOrgId) return orgId === activeOrgId;
      if (audience.length && activeRoleName)
        return audience.includes(activeRoleName);

      // Fallback policy for Active view when older rows lack context:
      // Hide admin-scoped types that should have org context but don't.
      // These remain visible in "All" view.
      if (n.type === "booking.created") {
        dlog("Filter: missing-context booking.created → hide in Active", {
          id: n.id,
        });
        return false;
      }

      return true; // no explicit context => global
    },
    [activeOrgId, activeRoleName],
  );

  const visibleFeed = React.useMemo(
    () => (viewAll ? feedUniq : feedUniq.filter(inActiveContext)),
    [feedUniq, inActiveContext, viewAll],
  );

  const otherUnread = React.useMemo(
    () =>
      feedUniq.filter((n) => n.read_at === null && !inActiveContext(n)).length,
    [feedUniq, inActiveContext],
  );

  const visibleUnseen = React.useMemo(
    () => visibleFeed.filter((n) => n.read_at === null).length,
    [visibleFeed],
  );

  // Debug: log context + filter evaluation when inputs change
  React.useEffect(() => {
    dlog("Context", {
      userId,
      activeOrgId,
      activeRoleName,
      viewAll,
      feedCount: feedUniq.length,
      visibleCount: visibleFeed.length,
      unseenTotal: unseen,
      unseenVisible: visibleUnseen,
    });

    if (!viewAll) {
      const report = feedUniq.map((n) => {
        const meta = (n.metadata ?? {}) as Record<string, unknown>;
        const orgId =
          typeof meta.organization_id === "string"
            ? meta.organization_id
            : null;
        const audience = Array.isArray(meta.audience_roles)
          ? (meta.audience_roles as string[]).filter(
              (r) => typeof r === "string",
            )
          : [];
        let reason = "global-default";
        let included = true;
        if (n.severity === "critical") {
          reason = "critical";
          included = true;
        } else if (orgId && activeOrgId) {
          included = orgId === activeOrgId;
          reason = `org:${orgId}`;
        } else if (audience.length && activeRoleName) {
          included = audience.includes(activeRoleName);
          reason = `audience:[${audience.join(",")}]`;
        } else if (n.type === "booking.created") {
          included = false;
          reason = "missing-context:booking.created";
        }
        return {
          id: n.id,
          type: n.type,
          sev: n.severity,
          orgId,
          audience,
          included,
          reason,
        };
      });
      dlog("Eval (Active)", report);
    } else {
      dlog("Eval (All) — no filtering");
    }
  }, [
    userId,
    activeOrgId,
    activeRoleName,
    viewAll,
    feedUniq,
    visibleFeed,
    unseen,
    visibleUnseen,
  ]);

  // live subscription — mount / unmount
  React.useEffect(() => {
    if (!userId) return;

    dlog("Subscribe start", { userId });
    const unsubscribe = subscribeToNotifications(
      userId,
      (n: NotificationRow) => {
        dlog("New notification", {
          id: n.id,
          type: n.type,
          sev: n.severity,
          created_at: n.created_at,
          metadata: n.metadata,
        });
        setFeed((prev) => upsert(prev, n));
      },
    );

    return () => {
      dlog("Unsubscribe", { userId });
      unsubscribe();
    };
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
    const target = viewAll ? feedUniq : visibleFeed;
    const ids = target.filter((n) => n.read_at === null).map((n) => n.id);
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

  /** Deletes **all** notifications currently in the feed, locally and in DB. */
  const deleteAll = async () => {
    const target = viewAll ? feedUniq : visibleFeed;
    const ids = target.map((n) => n.id);
    if (ids.length === 0) return;

    // Optimistically remove all from local state
    setFeed((prev) => prev.filter((n) => !ids.includes(n.id))); // or simply: setFeed([])

    // Delete from DB
    await supabase.from("notifications").delete().in("id", ids);
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
          className="relative hover:bg-(--subtle-grey) w-fit px-2"
        >
          <Bell className="!h-4.5 !w-5 text-(--midnight-black)" />
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
          <div className="flex items-center gap-2">
            <span>{t.navigation.notifications.label[lang]}</span>
            <div className="ml-2 inline-flex rounded border border-(--subtle-grey) overflow-hidden">
              <button
                className={`px-2 py-0.5 text-xs ${!viewAll ? "bg-(--subtle-grey)" : ""}`}
                onClick={() => setViewAll(false)}
                title={t.navigation.notifications.viewActive[lang]}
              >
                {t.navigation.notifications.viewActive[lang]}
              </button>
              <button
                className={`px-2 py-0.5 text-xs ${viewAll ? "bg-(--subtle-grey)" : ""}`}
                onClick={() => setViewAll(true)}
                title={t.navigation.notifications.viewAll[lang]}
              >
                {t.navigation.notifications.viewAll[lang]}
              </button>
            </div>
            {!viewAll && otherUnread > 0 && (
              <span className="ml-1 text-[0.7rem] text-muted-foreground">
                {t.navigation.notifications.otherContextsPrefix[lang]}{" "}
                {otherUnread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {visibleFeed.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                title={t.navigation.notifications.deleteAll[lang]}
                onClick={deleteAll}
                className="h-5 w-5"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {(viewAll ? unseen > 0 : visibleUnseen > 0) && (
              <Button
                size="sm"
                variant="ghost"
                title={t.navigation.notifications.markAllRead[lang]}
                onClick={markAllRead}
                className="h-5 w-5"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {visibleFeed.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            {t.navigation.notifications.none[lang]}
          </p>
        ) : (
          <ScrollArea className="max-h-[70vh]">
            {visibleFeed.map((n) => {
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
                          title={t.navigation.notifications.markAsRead[lang]}
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
                        title={
                          t.navigation.notifications.deleteOne?.[lang] ??
                          t.navigation.notifications.deleteAll[lang]
                        }
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
