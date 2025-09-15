import imagePlaceholder from "@/assets/defaultImage.jpg";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/context/LanguageContext";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { getItemById } from "@/store/slices/itemsSlice";
import { t } from "@/translations";
import { ItemTranslation } from "@/types";
import { ItemImageAvailabilityInfo } from "@/types/storage";
import { Clock, MapPin } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  getItemImages,
  selectItemImages,
} from "../../store/slices/itemImagesSlice";
import { Item } from "../../types/item";
import { Input } from "../ui/input";
import { itemsApi } from "@/api/services/items";

interface ItemsCardProps {
  item: Item;
}

const ItemCard: React.FC<ItemsCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const itemImages = useAppSelector(selectItemImages);

  // Get global timeframe from Redux
  const { startDate, endDate } = useAppSelector((state) => state.timeframe);

  // Only keep quantity as local state
  const [quantity, setQuantity] = useState(0);

  const [availabilityInfo, setAvailabilityInfo] =
    useState<ItemImageAvailabilityInfo>({
      availableQuantity: item.quantity || 0,
      isChecking: false,
      error: null,
    });

  // Translation
  const { getTranslation } = useTranslation<ItemTranslation>();
  const itemContent = getTranslation(item, "fi") as ItemTranslation | undefined;
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();

  // Enhanced image finding with memoization to prevent recalculation on every render
  const itemImagesForCurrentItem = useMemo(
    () => itemImages.filter((img) => img.item_id === item.id),
    [itemImages, item.id],
  );

  // Add this persistent ref to track already-failed image URLs
  const failedImageUrlsRef = useRef<Set<string>>(new Set());

  // Stable URL calculation that won't change between renders
  const stableImageUrl = useMemo(() => {
    // Get all possible images for this item
    const validImages = itemImagesForCurrentItem.filter(
      (img) => !failedImageUrlsRef.current.has(img.image_url),
    );

    // Find thumbnail image for this item
    const thumbnailImage = validImages.find(
      (img) => img.image_type === "thumbnail",
    );

    // If no thumbnail found, try to get main image
    const mainImage = thumbnailImage
      ? null
      : validImages.find((img) => img.image_type === "main");

    // Use thumbnail or main image URL
    return thumbnailImage?.image_url || mainImage?.image_url || "";
  }, [itemImagesForCurrentItem]);

  // Image handling states
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const imageLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set the image URL just once when it changes
  useEffect(() => {
    if (stableImageUrl && !failedImageUrlsRef.current.has(stableImageUrl)) {
      // Clear any existing timeout
      if (imageLoadingTimeoutRef.current) {
        clearTimeout(imageLoadingTimeoutRef.current);
      }

      setCurrentImageUrl(stableImageUrl);
      setIsImageLoading(true);
      setLoadFailed(false);

      // Set a timeout to prevent infinite loading
      imageLoadingTimeoutRef.current = setTimeout(() => {
        setIsImageLoading(false);
        failedImageUrlsRef.current.add(stableImageUrl); // Mark as failed due to timeout
        console.warn(`Image loading timed out for ${stableImageUrl}`);
      }, 5000); // 5 seconds timeout
    } else {
      // If no URL or URL previously failed
      setCurrentImageUrl("");
      setIsImageLoading(false);
      setLoadFailed(true);
    }

    // Cleanup function to clear timeout
    return () => {
      if (imageLoadingTimeoutRef.current) {
        clearTimeout(imageLoadingTimeoutRef.current);
      }
    };
  }, [stableImageUrl]);

  // Fetch images only once per item
  useEffect(() => {
    // Only fetch if we don't already have images for this item
    if (!itemImagesForCurrentItem.length) {
      dispatch(getItemImages(item.id))
        .unwrap()
        .catch((error) => {
          console.error("Failed to fetch item images:", error);
        });
    }
  }, [dispatch, item.id, itemImagesForCurrentItem.length]);

  // Navigate to the item's detail page
  const handleItemClick = (itemId: string) => {
    void dispatch(getItemById(itemId)); // Fetch the item by ID when clicked
    void navigate(`/storage/items/${itemId}`);
  };

  // Handle adding item to cart
  const handleAddToCart = () => {
    if (item) {
      void dispatch(
        addToCart({
          item: item,
          quantity: quantity,
          startDate: startDate ? startDate : undefined,
          endDate: endDate ? endDate : undefined,
        }),
      );
      toast.success(
        `${itemContent?.item_name} ${t.itemCard.addedToCart[lang]}`,
      );
    }
  };

  // Update availability info based on dates selection
  useEffect(() => {
    if (startDate && endDate) {
      setAvailabilityInfo((prev) => ({
        ...prev,
        isChecking: true,
        error: null,
      }));
      void itemsApi
        .checkAvailability(item.id, new Date(startDate), new Date(endDate))
        .then((response) => {
          setAvailabilityInfo({
            availableQuantity: response.availableQuantity,
            isChecking: false,
            error: null,
          });
        })
        .catch((error) => {
          console.error("Error checking availability:", error);
          setAvailabilityInfo({
            availableQuantity: item.available_quantity || 0,
            isChecking: false,
            error: "Failed to check availability",
          });
        });
    } else {
      // When no dates selected, show total quantity
      setAvailabilityInfo({
        availableQuantity: item.quantity || 0,
        isChecking: false,
        error: null,
      });
    }
  }, [startDate, endDate, item.id, item.available_quantity, item.quantity]);

  const isItemAvailableForTimeframe = availabilityInfo.availableQuantity > 0;

  const isAddToCartDisabled =
    !startDate ||
    !endDate ||
    quantity > availabilityInfo.availableQuantity ||
    quantity <= 0 ||
    !isItemAvailableForTimeframe ||
    availabilityInfo.isChecking;

  return (
    <Card
      data-cy="items-card"
      className="w-full flex flex-col justify-between p-4 flex-[1_0_250px]"
    >
      {/* Image Section */}
      <div
        className="h-40 bg-gray-200 flex items-center justify-center rounded relative overflow-hidden border border-1-[var(--subtle-grey)] basis-[250px]"
        data-cy="item-image-section"
      >
        {isImageLoading && !loadFailed && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-secondary rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={currentImageUrl || imagePlaceholder}
          alt={itemContent?.item_name || "Tuotteen kuva"}
          className="w-full h-full object-cover transition-opacity duration-300"
          onLoad={() => {
            if (imageLoadingTimeoutRef.current) {
              clearTimeout(imageLoadingTimeoutRef.current);
              imageLoadingTimeoutRef.current = null;
            }
            setIsImageLoading(false);
            setLoadFailed(false);
          }}
          onError={(e) => {
            // Prevent infinite loops by tracking which URLs have failed
            if (currentImageUrl) {
              console.warn(`Failed to load image: ${currentImageUrl}`);
              failedImageUrlsRef.current.add(currentImageUrl);
            }

            // Clear the timeout
            if (imageLoadingTimeoutRef.current) {
              clearTimeout(imageLoadingTimeoutRef.current);
              imageLoadingTimeoutRef.current = null;
            }

            // Critical: remove the error handler before changing the source
            e.currentTarget.onerror = null;

            // Set to placeholder directly - only once
            e.currentTarget.src = imagePlaceholder;
            setIsImageLoading(false);
            setLoadFailed(true);
          }}
          loading="lazy"
        />
      </div>

      {/* Item Details */}
      <div data-cy="item-details">
        <h2
          className="text-lg text-primary font-normal text-center mb-1"
          data-cy="item-name"
        >
          {itemContent?.item_name
            ? `${itemContent.item_name.charAt(0).toUpperCase()}${itemContent.item_name.slice(1)}`
            : "Tuote"}
        </h2>
        {/* Display location name */}
        {item.location_details && (
          <div
            className="flex items-center justify-center gap-1 text-xs text-muted-foreground"
            data-cy="item-location"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>{item.location_details.name}</span>
          </div>
        )}
      </div>

      {/* Display selected booking timeframe if it exists */}
      {startDate && endDate && (
        <div
          className="bg-slate-100 p-2 rounded-md mb-1 flex flex-col items-center"
          data-cy="item-timeframe"
        >
          <div className="flex items-center text-sm text-slate-400">
            <Clock className="h-4 w-4 mr-1" />
            <span className="font-medium text-xs">
              {t.itemCard.timeframe[lang]}
            </span>
          </div>
          <p className="text-xs font-medium m-0">
            {formatDate(startDate, "d MMM yyyy")} -{" "}
            {formatDate(endDate, "d MMM yyyy")}
          </p>
        </div>
      )}

      {/* Quantity Input */}
      <div data-cy="item-quantity-section">
        <div className="flex flex-col flex-wrap items-center space-y-2 justify-between">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(0, quantity - 1))}
              className="h-8 w-8 p-0"
              disabled={quantity <= 0}
            >
              -
            </Button>
            <Input
              type="text"
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setQuantity(
                  Math.min(
                    availabilityInfo.availableQuantity,
                    Math.max(0, value),
                  ),
                );
              }}
              className="w-11 h-8 mx-2 text-center"
              min="0"
              max={availabilityInfo.availableQuantity}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuantity(
                  Math.min(availabilityInfo.availableQuantity, quantity + 1),
                );
              }}
              className="h-8 w-8 p-0"
              disabled={quantity >= availabilityInfo.availableQuantity}
            >
              +
            </Button>
          </div>

          <div className="flex items-center justify-end mb-3 mt-1">
            {availabilityInfo.isChecking ? (
              <p className="text-xs text-slate-400 italic m-0">
                {t.itemCard.checkingAvailability[lang]}
              </p>
            ) : availabilityInfo.error ? (
              <p className="text-xs text-red-500 italic m-0">
                {t.itemCard.availabilityError[lang]}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic m-0">
                {startDate && endDate
                  ? availabilityInfo.availableQuantity > 0
                    ? `${t.itemCard.available[lang]}: ${availabilityInfo.availableQuantity}`
                    : `${t.itemCard.notAvailable[lang]}`
                  : `${t.itemCard.totalUnits[lang]}: ${item.quantity}`}
              </p>
            )}
          </div>
        </div>

        {/* Add to Cart Button with Tooltip */}
        <TooltipProvider>
          <Tooltip open={isAddToCartDisabled ? undefined : false}>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                className={
                  isAddToCartDisabled
                    ? "inline-block w-full cursor-not-allowed"
                    : "inline-block w-full"
                }
              >
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-white hover:bg-secondary"
                  disabled={isAddToCartDisabled}
                  style={{
                    pointerEvents: isAddToCartDisabled ? "none" : "auto",
                  }}
                  data-cy="item-add-to-cart-btn"
                >
                  {t.itemDetails.items.addToCart[lang]}
                </Button>
              </span>
            </TooltipTrigger>
            {isAddToCartDisabled && (
              <TooltipContent>
                {!startDate || !endDate ? (
                  <p>{t.itemCard.selectDatesFirst[lang]}</p>
                ) : (
                  <p>{t.itemCard.selectValidQuantity[lang]} </p>
                )}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* View Details Button */}
      <Button
        onClick={() => handleItemClick(item.id)}
        className="w-full bg-background rounded-2xl text-primary/80 border-primary/80 border-1 hover:text-white hover:bg-primary/90"
        data-cy="item-view-details-btn"
      >
        {t.itemCard.viewDetails ? t.itemCard.viewDetails[lang] : "Katso tiedot"}
      </Button>
    </Card>
  );
};

export default ItemCard;
