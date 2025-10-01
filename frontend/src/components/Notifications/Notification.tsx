import * as React from "react";
import { supabase } from "@/config/supabase";
import { DBTables } from "@common/database.types";
import { subscribeToNotifications } from "@/lib/notifications";
import { useNavigate } from "react-router-dom";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { useAppSelector } from "@/store/hooks";
import {
  selectActiveOrganizationId,
  selectActiveRoleName,
} from "@/store/slices/rolesSlice";
import { useRoles } from "@/hooks/useRoles";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationDesktopView } from "@/components/Notifications/NotificationDesktopView";
import { NotificationMobile } from "@/components/Notifications/NotificationMobile";

/**
 * Notifications dropdown component
 * --------------------------------
 * Renders the bell icon with an unread badge and a dropdown feed of
 * in‑app notifications. Subscribes to Supabase Realtime inserts and
 * performs an initial fetch. Supports an “Active/All” toggle that
 * filters by the currently selected organization/role context.
 *
 * UX details
 * - Badge shows total unread across contexts so nothing is missed.
 * - Header actions: mark all as read (current view) and delete all (current view).
 * - Row actions: mark one as read and delete one.
 * - Clicking booking‑related items can auto‑switch active role context
 *   to an org admin role to avoid broken pages, with a toast + undo.
 */

/**
 * React component that renders the bell icon + dropdown feed.
 *
 * @prop userId – current authenticated user; the DB policy ensures they
 *                only see their own rows.
 */
interface Props {
  /** Current authenticated user id (auth.user().id) used for scoping */
  userId: string;
}

type NotificationRow = DBTables<"notifications">;

/**
 * Top‑level React component that renders the bell + dropdown feed.
 *
 * @param props.userId - Current authenticated user id; used to fetch and
 *                       subscribe to rows for this user only.
 * @returns JSX.Element dropdown menu with a role‑aware notifications feed.
 */
export const Notifications: React.FC<Props> = ({ userId }) => {
  const [feed, setFeed] = React.useState<NotificationRow[]>([]);
  const [viewAll, setViewAll] = React.useState(false);
  const [panelOpen, setPanelOpen] = React.useState(false);
  const feedUniq = React.useMemo(
    () => Array.from(new Map(feed.map((n) => [n.id, n])).values()),
    [feed],
  );

  // Hide self user.created notifications (do not show to the newly created user)
  const baseFeed = React.useMemo(() => {
    return feedUniq.filter((n) => {
      if (n.type === "user.created") {
        return n.metadata.new_user_id !== userId;
      }
      return true;
    });
  }, [feedUniq, userId]);

  const unseen = React.useMemo(
    () => baseFeed.filter((n) => n.read_at === null).length,
    [baseFeed],
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
  const {
    currentUserRoles,
    setActiveContext,
    activeContext,
    findBestOrgAdminRole,
    findSuperAdminRole,
  } = useRoles();
  const { isMobile } = useIsMobile();

  // Show the Active/All toggle only when the user has more than one
  // distinct active role context (org + role pair)
  const showToggle = React.useMemo(() => {
    const active = (currentUserRoles || []).filter((r) => r.is_active);
    const distinct = new Set(
      active.map((r) => `${r.organization_id ?? ""}:${r.role_name ?? ""}`),
    );
    return distinct.size > 1;
  }, [currentUserRoles]);

  // Filter notifications according to active role/org context
  /**
   * Predicate that decides whether a notification belongs to the
   * currently active role/org context. Critical items always pass.
   *
   * @param n - A notification row from the feed
   * @returns true if the row should be visible in “Active” view
   */
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
      if (n.type === "booking.created") return false;

      return true; // no explicit context => global
    },
    [activeOrgId, activeRoleName],
  );

  const visibleFeed = React.useMemo(
    () => (viewAll ? baseFeed : baseFeed.filter(inActiveContext)),
    [baseFeed, inActiveContext, viewAll],
  );

  const otherUnread = React.useMemo(
    () =>
      baseFeed.filter((n) => n.read_at === null && !inActiveContext(n)).length,
    [baseFeed, inActiveContext],
  );

  const visibleUnseen = React.useMemo(
    () => visibleFeed.filter((n) => n.read_at === null).length,
    [visibleFeed],
  );

  // (debug logging removed)

  // live subscription — mount / unmount
  React.useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToNotifications(
      userId,
      (n: NotificationRow) => {
        setFeed((prev) => upsert(prev, n));
      },
    );

    return () => unsubscribe();
  }, [userId, upsert]);

  /** Optimistically sets `read_at` in UI, then persists to DB. */
  /**
   * Mark a single notification as read (optimistic UI + DB update).
   * @param id - notification id
   */
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
  /**
   * Mark all unread notifications in the current view as read.
   * “Current view” is Active or All depending on the toggle state.
   */
  const markAllRead = async () => {
    const target = viewAll ? baseFeed : visibleFeed;
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
  /**
   * Delete all notifications in the current view (Active/All).
   * Uses optimistic local removal followed by a DB delete.
   */
  const deleteAll = async () => {
    const target = viewAll ? baseFeed : visibleFeed;
    const ids = target.map((n) => n.id);
    if (ids.length === 0) return;

    // Optimistically remove all from local state
    setFeed((prev) => prev.filter((n) => !ids.includes(n.id))); // or simply: setFeed([])

    // Delete from DB
    await supabase.from("notifications").delete().in("id", ids);
  };

  /** Deletes a row locally *and* remotely (requires RLS delete policy). */
  /**
   * Delete a single notification (optimistic local removal + DB delete).
   * @param id - notification id
   */
  const removeNotification = async (id: string) => {
    // delete from local state first
    setFeed((prev) => prev.filter((n) => n.id !== id));

    // delete from DB (owner-only; make sure RLS policy exists)
    await supabase.from("notifications").delete().eq("id", id);
  };

  // Row open behavior shared by both views
  const onOpenRow = (n: NotificationRow) => {
    const safe = (v: unknown) =>
      typeof v === "string" || typeof v === "number" ? String(v) : "";

    void markRead(n.id);

    if (n.type === "user.created") {
      const id =
        "new_user_id" in n.metadata ? safe(n.metadata.new_user_id) : null;

      // Ensure we have super_admin context to view users
      if (activeRoleName !== "super_admin") {
        const superCtx = findSuperAdminRole();
        if (superCtx) {
          const needsSwitch =
            activeOrgId !== superCtx.organization_id ||
            activeRoleName !== superCtx.role_name;
          if (needsSwitch) {
            setActiveContext(
              superCtx.organization_id,
              superCtx.role_name,
              superCtx.organization_name ?? "",
            );
          }
        }
      }

      if (id) void navigate(`/admin/users/${id}`);
      else void navigate("/admin/users");
      return;
    }

    if (
      n.type === "booking.created" ||
      n.type === "booking.status_approved" ||
      n.type === "booking.status_rejected"
    ) {
      const bookingId = safe(n.metadata.booking_id);
      const orgId = n.metadata.organization_id
        ? safe(n.metadata.organization_id)
        : null;

      if (orgId) {
        const candidate = findBestOrgAdminRole(orgId);
        if (candidate) {
          const needsSwitch =
            activeOrgId !== candidate.organization_id ||
            activeRoleName !== candidate.role_name;
          if (needsSwitch) {
            // On desktop, show a toast with undo when switching context
            if (!isMobile) {
              const prev = {
                organizationId: activeContext.organizationId,
                roleName: activeContext.roleName,
                organizationName: activeContext.organizationName,
              };
              if (candidate.organization_id && candidate.role_name) {
                setActiveContext(
                  candidate.organization_id,
                  candidate.role_name,
                  candidate.organization_name ?? "",
                );
              }

              const roleKey = candidate.role_name;
              const roleLabel =
                roleKey === "tenant_admin"
                  ? t.common.roles.tenantAdmin[lang]
                  : roleKey === "storage_manager"
                    ? t.common.roles.storageManager[lang]
                    : roleKey === "super_admin"
                      ? t.common.roles.superAdmin[lang]
                      : roleKey;
              const orgLabel = candidate.organization_name ?? "";
              const msgTpl =
                t.navigation.notifications.toasts.switchedContext[lang];
              const msg = msgTpl
                .replace("{role}", roleLabel)
                .replace("{org}", orgLabel);
              toast.info(msg, {
                action: {
                  label: t.common.undo[lang],
                  onClick: () => {
                    if (
                      prev.organizationId &&
                      prev.roleName &&
                      prev.organizationName
                    ) {
                      setActiveContext(
                        prev.organizationId,
                        prev.roleName,
                        prev.organizationName,
                      );
                      const prevRoleLabel =
                        prev.roleName === "tenant_admin"
                          ? t.common.roles.tenantAdmin[lang]
                          : prev.roleName === "storage_manager"
                            ? t.common.roles.storageManager[lang]
                            : prev.roleName === "super_admin"
                              ? t.common.roles.superAdmin[lang]
                              : prev.roleName;
                      const revertTpl =
                        t.navigation.notifications.toasts.revertedContext[lang];
                      toast.info(
                        revertTpl
                          .replace("{role}", prevRoleLabel)
                          .replace("{org}", prev.organizationName ?? ""),
                      );
                    }
                  },
                },
              });
            } else {
              // Mobile: switch silently (no toast), as before
              if (candidate.organization_id && candidate.role_name) {
                setActiveContext(
                  candidate.organization_id,
                  candidate.role_name,
                  candidate.organization_name ?? "",
                );
              }
            }
          }
        }
      }

      void navigate(`/admin/bookings/${bookingId}`);
    }
  };

  // Render per device
  if (isMobile) {
    return (
      <NotificationMobile
        lang={lang}
        unseen={unseen}
        visibleUnseen={visibleUnseen}
        showToggle={showToggle}
        viewAll={viewAll}
        setViewAll={setViewAll}
        otherUnread={otherUnread}
        visibleFeed={visibleFeed}
        panelOpen={panelOpen}
        setPanelOpen={setPanelOpen}
        markAllRead={markAllRead}
        deleteAll={deleteAll}
        markRead={markRead}
        removeNotification={removeNotification}
        onOpenRow={onOpenRow}
      />
    );
  }

  return (
    <NotificationDesktopView
      lang={lang}
      unseen={unseen}
      visibleUnseen={visibleUnseen}
      showToggle={showToggle}
      viewAll={viewAll}
      setViewAll={setViewAll}
      otherUnread={otherUnread}
      visibleFeed={visibleFeed}
      markAllRead={markAllRead}
      deleteAll={deleteAll}
      markRead={markRead}
      removeNotification={removeNotification}
      onOpenRow={onOpenRow}
    />
  );
};
