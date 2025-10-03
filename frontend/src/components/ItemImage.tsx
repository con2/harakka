import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { makeSelectItemImages } from "@/store/slices/itemImagesSlice";
import { useMemo } from "react";

// ItemImage selector using itemImagesSlice
export const ItemImage = ({
  itemId,
  itemName,
  className,
}: {
  itemId: string;
  itemName?: string;
  className?: string;
}) => {
  const selectItemImages = useMemo(() => makeSelectItemImages(), []);
  const images = useAppSelector((s) => selectItemImages(s, itemId));
  const first = images?.[0]?.image_url;

  return (
    <div
      className={cn(
        "h-8 w-8 rounded-md ring-1 ring-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center",
        className,
      )}
    >
      {first ? (
        <img
          src={first}
          alt={itemName ?? ""}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-xs font-medium text-gray-600">
          {(itemName ?? "").slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
};
