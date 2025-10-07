import * as React from "react";
import { Bell, X, Check, CheckCheck, Trash2, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { t } from "@/translations";
import { DBTables } from "@common/database.types";
import { common } from "@/translations/modules/common";

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
  markAllRead: () => Promise<void> | void;
  deleteAll: () => Promise<void> | void;
  markRead: (id: string) => Promise<void> | void;
  removeNotification: (id: string) => Promise<void> | void;
  onOpenRow: (n: NotificationRow) => void;
};

export const NotificationDesktopView: React.FC<Props> = ({
  lang,
  unseen,
  visibleUnseen,
  showToggle,
  viewAll,
  setViewAll,
  otherUnread,
  visibleFeed,
  markAllRead,
  deleteAll,
  markRead,
  removeNotification,
  onOpenRow,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {/* Notification bell */}
        <Button
          variant="ghost"
          aria-label={t.navigation.aria.labels.notifications[lang].replace(
            "{number}",
            unseen.toString(),
          )}
          className="relative hover:bg-(--subtle-grey) w-fit px-2"
        >
          <Bell
            aria-hidden="true"
            className="!h-4.5 !w-5 text-(--midnight-black)"
            onClick={() => setOpen(!open)}
          />
          {/* Notification count badge */}
          {unseen > 0 && (
            <Badge className="absolute -right-1 -top-1 h-4 min-w-[1rem] px-1 text-[0.625rem] font-sans text-white leading-none !bg-(--emerald-green)">
              {unseen}
            </Badge>
          )}
          {/* Screen reader label */}
          <span className="sr-only">
            {t.navigation.notifications.srOpen[lang]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      {/* Notification Container */}
      <DropdownMenuContent className="w-80 md:w-96" align="end">
        {/* Top part of container */}
        <DropdownMenuLabel className="flex items-center justify-between">
          {/* Close button */}
          <div className="flex items-center">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-8 px-2 text-xs font-medium"
            >
              {common.close[lang]}
            </Button>
          </div>

          {/* centered toggle-area */}
          <div className="flex-1 flex items-center justify-center gap-2">
            {/* Hidden title for accessibility */}
            <span className="sr-only">
              {t.navigation.notifications.label[lang]}
            </span>

            {showToggle && (
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded border border-(--subtle-grey) overflow-hidden">
                  {/* "Active" */}
                  <button
                    className={`px-2 py-0.5 text-xs ${!viewAll ? "bg-(--subtle-grey)" : ""}`}
                    onClick={() => setViewAll(false)}
                    title={t.navigation.notifications.viewActive[lang]}
                  >
                    {t.navigation.notifications.viewActive[lang]}
                  </button>
                  {/* "All" */}
                  <button
                    className={`px-2 py-0.5 text-xs ${viewAll ? "bg-(--subtle-grey)" : ""}`}
                    onClick={() => setViewAll(true)}
                    title={t.navigation.notifications.viewAll[lang]}
                  >
                    {t.navigation.notifications.viewAll[lang]}
                  </button>
                </div>
                {/* Tooltip*/}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-transparent flex-shrink-0"
                      >
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="center"
                      className="max-w-xs"
                    >
                      <p className="text-xs">
                        {t.navigation.notifications.tooltip?.[lang] ||
                          "Click 'All' to see and delete all notifications across all contexts"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}

            {/* "Other" count */}
            {showToggle && !viewAll && otherUnread > 0 && (
              <span className="text-[0.7rem] text-muted-foreground ml-1">
                {t.navigation.notifications.otherContextsPrefix[lang]}{" "}
                {otherUnread}
              </span>
            )}
          </div>

          {/* Actions - feste Breite rechts */}
          <div className="flex items-center gap-1">
            {(viewAll ? unseen > 0 : visibleUnseen > 0) && (
              // Mark All as Read
              <Button
                size="sm"
                variant="ghost"
                title={t.navigation.notifications.markAllRead[lang]}
                onClick={markAllRead}
                className="h-8 w-8 p-1 rounded-md hover:bg-(--subtle-grey) hover:text-(--midnight-black) text-(--midnight-black)"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}

            {visibleFeed.length > 0 && (
              // Delete All
              <Button
                size="sm"
                variant="ghost"
                title={t.navigation.notifications.deleteAll[lang]}
                onClick={deleteAll}
                className="h-8 w-8 p-1 rounded-md hover:bg-(--subtle-grey) hover:text-(--midnight-black) text-(--midnight-black)"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DropdownMenuLabel>

        {/* Notification list */}
        <DropdownMenuSeparator />
        {visibleFeed.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            {t.navigation.notifications.none[lang]}
          </p>
        ) : (
          <ScrollArea className="h-[70vh] sm:h-[80vh]">
            {visibleFeed.map((n) => {
              // ———————————— Translate Title / Message ————————————
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
                // One notification card — use DropdownMenuItem directly (no nested button)
                <DropdownMenuItem
                  key={n.id}
                  onSelect={(e) => {
                    e.preventDefault();
                    onOpenRow(n);
                  }}
                  className="flex w-full flex-col gap-0.5 py-2 text-left cursor-pointer hover:bg-(--subtle-grey) data-[highlighted]:bg-(--subtle-grey) focus:bg-(--subtle-grey)"
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
                        /* Mark as read button */
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            void markRead(n.id);
                          }}
                          className="h-8 w-8 p-1 rounded-md hover:bg-black/10 text-(--midnight-black) transition-colors"
                          title={t.navigation.notifications.markAsRead[lang]}
                        >
                          <Check className="h-4 w-4" />
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
                        className="h-8 w-8 p-1 rounded-md hover:bg-black/10 text-(--midnight-black) transition-colors"
                        title={
                          t.navigation.notifications.deleteOne?.[lang] ??
                          t.navigation.notifications.deleteAll[lang]
                        }
                      >
                        <X className="h-4 w-4" />
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
