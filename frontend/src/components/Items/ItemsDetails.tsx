import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  getItemById,
  selectSelectedItem,
  selectItemsLoading,
  selectItemsError,
} from "../../store/slices/itemsSlice";
import {
  getItemImages,
  selectItemImages,
} from "../../store/slices/itemImagesSlice";
import { Button } from "../../components/ui/button";
import { ChevronLeft, Clock, Info, LoaderCircle } from "lucide-react";
import { addToCart } from "../../store/slices/cartSlice";
import { Input } from "../ui/input";
import { toast } from "sonner";
import imagePlaceholder from "@/assets/defaultImage.jpg";
import { useTranslation } from "@/hooks/useTranslation";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { Item, ItemImageAvailabilityInfo, ItemTranslation } from "@/types";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { itemsApi } from "@/api/services/items";

const ItemsDetails: React.FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { formatDate } = useFormattedDate();

  const item = useAppSelector(selectSelectedItem);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);
  const { startDate, endDate } = useAppSelector((state) => state.timeframe);
  const itemImages = useAppSelector(selectItemImages);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isImageVisible, setIsImageVisible] = useState(false);

  const [availabilityInfo, setAvailabilityInfo] =
    useState<ItemImageAvailabilityInfo>({
      availableQuantity: item?.quantity ?? 0,
      isChecking: false,
      error: null,
    });

  const toggleImageVisibility = () => {
    setIsImageVisible(!isImageVisible);
  };

  // Get images for this specific item
  const itemImagesForCurrentItem = useMemo(
    () => itemImages.filter((img) => img.item_id === id),
    [itemImages, id],
  );

  // Get all detail images for the gallery
  const detailImages = useMemo(
    () => itemImagesForCurrentItem.filter((img) => img.image_type === "detail"),
    [itemImagesForCurrentItem],
  );

  // Get the main image - no transformation needed
  const mainImage = useMemo(() => {
    // If user selected an image, use that
    if (selectedImageUrl) return selectedImageUrl;

    // First try to find a main image
    const mainImg = itemImagesForCurrentItem.find(
      (img) => img.image_type === "main",
    );

    // If no main image, try thumbnail
    const thumbnailImg = mainImg
      ? null
      : itemImagesForCurrentItem.find((img) => img.image_type === "thumbnail");

    const anyImg = mainImg || thumbnailImg ? null : itemImagesForCurrentItem[0];

    // Return image URL or placeholder
    return (
      mainImg?.image_url ||
      thumbnailImg?.image_url ||
      anyImg?.image_url ||
      imagePlaceholder
    );
  }, [itemImagesForCurrentItem, selectedImageUrl]);

  const handleAddToCart = () => {
    if (item) {
      dispatch(
        addToCart({
          item: item as Item,
          quantity: quantity,
          startDate: startDate,
          endDate: endDate,
        }),
      );
      toast.success(`${itemContent?.item_name || "Item"} added to cart`);
    }
  };

  // Check if the item is available for the selected timeframe
  useEffect(() => {
    if (item && startDate && endDate) {
      setAvailabilityInfo((prev) => ({
        ...prev,
        isChecking: true,
        error: null,
      }));

      itemsApi
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
            availableQuantity: item.available_quantity,
            isChecking: false,
            error: "Failed to check availability",
          });
        });
    }
  }, [item, startDate, endDate]);

  const isItemAvailableForTimeframe = availabilityInfo.availableQuantity > 0;

  const { getTranslation } = useTranslation<ItemTranslation>();
  const itemContent = getTranslation(item as Item, "fi") as
    | ItemTranslation
    | undefined;
  const { lang } = useLanguage();

  // Fetch item and images
  useEffect(() => {
    if (id) {
      void dispatch(getItemById(id));

      // Fetch images for this item
      dispatch(getItemImages(id))
        .unwrap()
        .catch((error) => {
          console.error("Failed to fetch item images:", error);
        });
    }
  }, [id, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoaderCircle className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-12 text-center text-red-500">
        {t.itemDetails.error[lang]}: {error}
      </div>
    );
  }

  if (!item) {
    return (
      <div
        className="container mx-auto p-12 text-center"
        data-cy="item-details-notfound"
      >
        {t.itemDetails.notFound[lang]}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4" data-cy="item-details-root">
      {/* Back Button */}
      <div className="mb-3 mt-4 md:mt-0">
        <Button
          onClick={() => navigate(-1)}
          className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
          data-cy="item-details-back-btn"
        >
          <ChevronLeft /> {t.itemDetails.buttons.back[lang]}
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Item Images - Positioned Left */}
        <div className="md:w-1/3 w-full" data-cy="item-details-images">
          {/* Main Image */}
          <div
            className="relative mb-4 h-[300px] group w-full max-w-md mx-auto md:max-w-none aspect-[4/3]"
            data-cy="item-details-main-image"
          >
            {/* Main Image Container */}
            <div className="border rounded-md bg-slate-50 overflow-hidden h-full w-full">
              <img
                src={mainImage}
                alt={itemContent?.item_name || "Tuotteen kuva"}
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = imagePlaceholder;
                }}
                onClick={toggleImageVisibility}
              />
            </div>

            {/* overlay for enlarged preview (closes on any click) */}
            {isImageVisible && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-200"
                onClick={() => setIsImageVisible(false)}
                role="button"
                aria-label="Close image preview"
              >
                <div className="w-[90%] max-w-[420px] max-h-[80%] h-auto border rounded-lg shadow-lg bg-white flex justify-center items-center p-2">
                  <img
                    src={mainImage}
                    alt={itemContent?.item_name || "Tuotteen kuva"}
                    className="object-contain w-[400px] h-[400px] max-w-full max-h-full cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Detail Images Gallery */}
          {detailImages.length > 0 && (
            <div
              className="grid grid-cols-3 gap-2 mt-2"
              data-cy="item-details-gallery"
            >
              {detailImages.map((img) => (
                <div
                  key={img.id}
                  className="border rounded-md overflow-hidden bg-slate-50 cursor-pointer"
                  onClick={() => setSelectedImageUrl(img.image_url)}
                >
                  <img
                    src={img.image_url}
                    alt={itemContent?.item_name || "Tuotteen kuva"}
                    className="w-full h-20 object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = imagePlaceholder;
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Item Details */}
        <div
          className="md:w-2/3 w-full space-y-4 order-1 md:order-2"
          data-cy="item-details-info"
        >
          <h2
            className="text-2xl font-normal text-left mb-0"
            data-cy="item-details-name"
          >
            {itemContent?.item_name
              ? `${itemContent.item_name.charAt(0).toUpperCase()}${itemContent.item_name.slice(1)}`
              : "Tuote"}
          </h2>

          {/* Location Details Section */}
          {(item as Item).location_details && (
            <div className="text-sm mt-2" data-cy="item-details-location">
              {(item as Item).location_details?.name && (
                <div className="flex items-start">
                  <span>{t.itemDetails.locations.location[lang]}:</span>
                  <span className="ml-1">
                    {(item as Item).location_details?.name}
                  </span>
                </div>
              )}
            </div>
          )}

          <p data-cy="item-details-description">
            {itemContent?.item_description
              ? `${itemContent.item_description
                  .toLowerCase()
                  .replace(/^./, (c) => c.toUpperCase())}`
              : "Ei kuvausta saatavilla"}
          </p>

          {/* Display selected booking timeframe if it exists */}
          {startDate && endDate ? (
            <div
              className="flex flex-col justify-center items-start mt-4"
              data-cy="item-details-timeframe"
            >
              <div className="bg-slate-100 max-w-[250px] rounded-md p-2">
                <div className="flex items-center text-sm text-slate-400">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="font-medium text-xs">
                    {t.itemDetails.info.timeframe[lang]}
                  </span>
                </div>
                <p className="text-xs font-medium m-0">
                  {formatDate(startDate, "d MMM yyyy")}
                  <span> -</span> {formatDate(endDate, "d MMM yyyy")}
                </p>
              </div>

              {/* Booking Section */}
              <div
                className="flex flex-row justify-center items-center mt-3"
                data-cy="item-details-quantity-controls"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 p-0"
                  disabled={quantity <= 1}
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
                  min={1}
                  max={availabilityInfo.availableQuantity}
                  className="w-11 h-8 mx-2 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setQuantity(
                      Math.min(
                        availabilityInfo.availableQuantity,
                        quantity + 1,
                      ),
                    )
                  }
                  disabled={quantity >= availabilityInfo.availableQuantity}
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
              </div>
              {/* Availability Info */}
              <div
                className="flex items-center justify-end mt-1"
                data-cy="item-details-availability"
              >
                {availabilityInfo.isChecking ? (
                  <p className="text-xs text-slate-400 italic m-0">
                    <LoaderCircle className="animate-spin h-4 w-4 mr-1" />
                    {t.itemDetails.checkingAvailability[lang]}
                  </p>
                ) : availabilityInfo.error ? (
                  <p className="text-xs text-red-500 italic m-0">
                    {t.itemDetails.availabilityError[lang]}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic m-0">
                    {startDate && endDate
                      ? availabilityInfo.availableQuantity > 0
                        ? `${t.itemDetails.available[lang]}: ${availabilityInfo.availableQuantity}`
                        : `${t.itemDetails.notAvailable[lang]}`
                      : `${t.itemDetails.totalUnits[lang]}: ${item.available_quantity}`}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-start mt-1 mb-4 md:mb-0">
                <Button
                  className={`bg-secondary rounded-2xl text-white border-secondary border-1 flex-1 mt-3
                    hover:text-secondary hover:bg-white
                    ${!isItemAvailableForTimeframe ? "opacity-50 cursor-not-allowed hover:text-white hover:bg-secondary" : ""}
                  `}
                  onClick={handleAddToCart}
                  disabled={!isItemAvailableForTimeframe}
                  data-cy="item-details-add-to-cart-btn"
                >
                  {t.itemDetails.items.addToCart[lang]}
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-row items-center"
              data-cy="item-details-no-dates"
            >
              <Info className="mr-1 text-secondary size-4" />{" "}
              {t.itemDetails.info.noDates[lang]}
              <Link
                to="/storage"
                className="ml-1 text-secondary underline"
                data-cy="item-details-here-link"
              >
                {t.itemDetails.info.here[lang]}
              </Link>
              .
            </div>
          )}
        </div>
      </div>
    </div>
    // </div>
  );
};

export default ItemsDetails;
