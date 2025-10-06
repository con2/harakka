import * as React from "react";
import { X, Check, CheckCheck, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { t } from "@/translations";
import { DBTables } from "@common/database.types";

type NotificationRow = DBTables<"notifications">;

type Props = {
  lang: "en" | "fi";
  unseen: number;
  visibleUnseen: number;
  showToggle: boolean;
  viewAll: boolean;
  setViewAll: (v: boolean) => void;
  otherUnread: number;
  visibleFeed: NotificationRow[];
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  markAllRead: () => Promise<void> | void;
  deleteAll: () => Promise<void> | void;
  markRead: (id: string) => Promise<void> | void;
  removeNotification: (id: string) => Promise<void> | void;
  onOpenRow: (n: NotificationRow) => void;
};

export const NotificationMobile: React.FC<Props> = ({
  lang,
  unseen,
  visibleUnseen,
  showToggle,
  viewAll,
  setViewAll,
  otherUnread,
  visibleFeed,
  panelOpen,
  setPanelOpen,
  markAllRead,
  deleteAll,
  markRead,
  removeNotification,
  onOpenRow,
}) => {
  // Mobile: slide-in panel with larger tap targets
  return (
    <>
      <Button
        variant="ghost"
        className="relative hover:bg-(--subtle-grey) w-fit px-2"
        onClick={() => setPanelOpen(true)}
      >
        {/* Notification Bell */}
        <Bell className="!h-4.5 !w-5 text-(--midnight-black)" />
        {unseen > 0 && (
          <Badge className="absolute -right-1 -top-1 h-4 min-w-[1rem] px-1 text-[0.625rem] font-sans text-white leading-none !bg-(--emerald-green)">
            {unseen}
          </Badge>
        )}
        {/* Open notification */}
        <span className="sr-only">
          {t.navigation.notifications.srOpen[lang]}
        </span>
      </Button>
      {/* Notification Panel */}
      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent side="top" hideClose className="w-[90vw] sm:max-w-sm p-0">
          {/* Header */}
          <div className="p-3 border-b flex items-center justify-between gap-2 flex-wrap">
            {/* Notifications title (SheetTitle for accessibility) */}
            <div className="flex flex-col min-w-0">
              <Button
                variant="ghost"
                onClick={() => setPanelOpen(false)}
                className="text-base font-medium p-0 h-auto text-left justify-start hover:underline"
              >
                {t.navigation.notifications.label?.[lang] || "Close"}
              </Button>
              {/* Visually hidden description to satisfy Dialog a11y */}
              <SheetTitle className="sr-only">
                {t.navigation.notifications.label[lang]}
              </SheetTitle>
              <SheetDescription className="sr-only">
                View and manage your notifications.
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2 flex-none ml-auto">
              {showToggle && (
                <div className="inline-flex rounded border border-(--subtle-grey) overflow-hidden">
                  {/* Active */}
                  <button
                    className={`px-2 py-1 text-xs ${!viewAll ? "bg-(--subtle-grey)" : ""}`}
                    onClick={() => setViewAll(false)}
                    title={t.navigation.notifications.viewActive[lang]}
                  >
                    {t.navigation.notifications.viewActive[lang]}
                  </button>

                  {/* All */}
                  <button
                    className={`px-2 py-1 text-xs ${viewAll ? "bg-(--subtle-grey)" : ""}`}
                    onClick={() => setViewAll(true)}
                    title={t.navigation.notifications.viewAll[lang]}
                  >
                    {t.navigation.notifications.viewAll[lang]}
                  </button>
                </div>
              )}
              {showToggle && !viewAll && otherUnread > 0 && (
                <span className="ml-1 text-[0.7rem] text-muted-foreground">
                  {t.navigation.notifications.otherContextsPrefix[lang]}{" "}
                  {otherUnread}
                </span>
              )}
              {visibleFeed.length > 0 &&
                (viewAll ? unseen > 0 : visibleUnseen > 0) && (
                  /* Mark All Read */
                  <Button
                    size="sm"
                    variant="ghost"
                    title={t.navigation.notifications.markAllRead[lang]}
                    onClick={markAllRead}
                    className="h-9 w-9 p-1.5 rounded-md hover:bg-black/10 text-(--midnight-black) transition-colors"
                  >
                    <CheckCheck className="h-5 w-5" />
                  </Button>
                )}
              {visibleFeed.length > 0 && (
                /* Delete All */
                <Button
                  size="sm"
                  variant="ghost"
                  title={t.navigation.notifications.deleteAll[lang]}
                  onClick={deleteAll}
                  className="h-9 w-9 p-1.5 rounded-md hover:bg-black/10 text-(--midnight-black) transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {visibleFeed.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              {t.navigation.notifications.none[lang]}
            </p>
          ) : (
            <ScrollArea className="max-h-[80vh]">
              {visibleFeed.map((n) => {
                const tpl =
                  (
                    t.notification as Record<
                      string,
                      (typeof t.notification)[keyof typeof t.notification]
                    >
                  )[n.type] ?? null;
                const safe = (v: unknown) =>
                  typeof v === "string" || typeof v === "number"
                    ? String(v)
                    : "";
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
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onOpenRow(n);
                      }
                    }}
                    onClick={() => onOpenRow(n)}
                    className="flex flex-col gap-1 py-3 px-3 border-b cursor-pointer hover:bg-(--subtle-grey) text-left w-full"
                  >
                    {/* Notification item */}
                    <div className="flex w-full items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{title}</span>
                        {message && (
                          <span className="text-xs text-muted-foreground">
                            {message}
                          </span>
                        )}
                      </div>
                      {/* Notification actions */}
                      <div className="flex items-center gap-2">
                        {n.read_at === null && (
                          /* Mark as read button */
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              void markRead(n.id);
                            }}
                            className="h-9 w-9 p-1.5 rounded-md hover:bg-black/10 text-(--midnight-black) transition-colors"
                            title={t.navigation.notifications.markAsRead[lang]}
                          >
                            <Check className="h-5 w-5" />
                          </Button>
                        )}
                        {/* Delete notification */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            void removeNotification(n.id);
                          }}
                          className="h-9 w-9 p-1.5 rounded-md hover:bg-black/10 text-(--midnight-black) transition-colors"
                          title={
                            t.navigation.notifications.deleteOne?.[lang] ??
                            t.navigation.notifications.deleteAll[lang]
                          }
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
