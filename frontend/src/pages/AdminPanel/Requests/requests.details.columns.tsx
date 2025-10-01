import { ItemImage } from "@/components/ItemImage";
import { Language } from "@/context/LanguageContext";
import { BookingItemWithDetails, BookingWithDetails } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { t } from "@/translations";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

export const getRequestDetailsColumns: (
  lang: Language,
  showEdit: boolean,
  itemsMarkedForRemoval: Set<string>,
  allItemsPending: boolean,
  itemQuantities: Record<string, number>,
  handleUpdateQuantity: (
    item: BookingItemWithDetails,
    newQuantity: number,
  ) => void,
  handleIncrementQuantity: (item: BookingItemWithDetails) => void,
  handleDecrementQuantity: (item: BookingItemWithDetails) => void,
  availability: Record<string, number>,
) => ColumnDef<NonNullable<BookingWithDetails["booking_items"]>[number]>[] = (
  lang: Language,
  showEdit: boolean,
  itemsMarkedForRemoval: Set<string>,
  allItemsPending: boolean,
  itemQuantities: Record<string, number>,
  handleUpdateQuantity: (
    item: BookingItemWithDetails,
    newQuantity: number,
  ) => void,
  handleIncrementQuantity: (item: BookingItemWithDetails) => void,
  handleDecrementQuantity: (item: BookingItemWithDetails) => void,
  availability: Record<string, number>,
) => [
  {
    accessorKey: "image",
    header: "",
    cell: ({ row }) => (
      <ItemImage
        itemId={row.original.item_id}
        itemName={row.original.storage_items.translations[lang]?.item_name}
      />
    ),
  },
  {
    accessorKey: "item_name",
    header: t.myBookingsPage.columns.item[lang],
    cell: ({ row }) => {
      const itemName = row.original.storage_items.translations[lang].item_name;
      const formattedName =
        itemName.charAt(0).toUpperCase() + itemName.slice(1);
      const isMarkedForRemoval = itemsMarkedForRemoval.has(
        String(row.original.id),
      );

      return (
        <span className={isMarkedForRemoval ? "line-through opacity-50" : ""}>
          {formattedName}
        </span>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: () => (
      <p className={cn(showEdit ? "text-center" : "text-start")}>
        {t.myBookingsPage.columns.quantity[lang]}
      </p>
    ),
    cell: ({ row }) => {
      const item = row.original;

      if (item.status === "cancelled" || !showEdit) return item.quantity;
      const isMarkedForRemoval = itemsMarkedForRemoval.has(String(item.id));

      if (!showEdit || !allItemsPending || isMarkedForRemoval) {
        return (
          <span className={isMarkedForRemoval ? "line-through opacity-50" : ""}>
            {item.quantity}
          </span>
        );
      }

      return (
        <div className="flex flex-col items-center">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDecrementQuantity(item)}
              className="h-8 w-8 p-0"
              disabled={
                (itemQuantities[String(item.id)] ?? item.quantity ?? 0) <= 1
              }
              aria-label={t.myBookingsPage.aria.labels.quantity.decrease[
                lang
              ].replace("{number}", (item.quantity - 1).toString())}
            >
              <Minus aria-hidden />
            </Button>
            <Input
              aria-label={t.myBookingsPage.aria.labels.quantity.enterQuantity[
                lang
              ].replace("{number}", item.quantity.toString())}
              value={itemQuantities[String(item.id)] ?? item.quantity}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (!isNaN(val) && val >= 1) {
                  handleUpdateQuantity(item, val);
                }
              }}
              className="w-[50px] text-center"
              min="1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleIncrementQuantity(item)}
              className="h-8 w-8 p-0"
              disabled={
                (itemQuantities[String(item.id)] ?? item.quantity ?? 0) >=
                (availability[item.item_id] ?? Infinity)
              }
              aria-label={t.myBookingsPage.aria.labels.quantity.increase[
                lang
              ].replace("{number}", (item.quantity + 1).toString())}
            >
              <Plus aria-hidden />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {t.myBookingsPage.headings.availability[lang]}{" "}
            {availability[item.item_id] ?? "-"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: t.myBookingsPage.columns.status[lang],
    cell: ({ row }) => {
      const { id, status } = row.original;
      const isMarkedForRemoval = itemsMarkedForRemoval.has(String(id));
      return (
        <div className={isMarkedForRemoval ? "line-through opacity-50" : ""}>
          <StatusBadge status={status} />
        </div>
      );
    },
  },
];
