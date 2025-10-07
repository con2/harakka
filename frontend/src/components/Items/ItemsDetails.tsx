import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getItemById,
  selectSelectedItem,
  selectItemsLoading,
  selectItemsError,
} from "@/store/slices/itemsSlice";
import {
  getItemImages,
  selectItemImages,
} from "@/store/slices/itemImagesSlice";
import {
  fetchOrganizationById,
  selectedOrganization,
} from "@/store/slices/organizationSlice";
import {
  fetchAllCategories,
  selectCategories,
} from "@/store/slices/categoriesSlice";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clock, Info, LoaderCircle } from "lucide-react";
import { addToCart } from "@/store/slices/cartSlice";
import { Input } from "../ui/input";
import { toast } from "sonner";
import imagePlaceholder from "@/assets/defaultImage.jpg";
import { useTranslation } from "@/hooks/useTranslation";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { extractCityFromLocationName } from "@/utils/locationValidation";
import {
  Item,
  ItemImage,
  ItemImageAvailabilityInfo,
  ItemTranslation,
  ItemWithTags,
} from "@/types";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { itemsApi } from "@/api/services/items";
import { cn } from "@/lib/utils";

const ItemsDetails: React.FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { formatDate } = useFormattedDate();

  // get page num from nav state (passed from ItemCard)
  const fromPage = (location.state as { fromPage?: number } | null)?.fromPage;

  const item = useAppSelector(selectSelectedItem);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);
  const { startDate, endDate } = useAppSelector((state) => state.timeframe);
  const itemImages = useAppSelector(selectItemImages);
  const organization = useAppSelector(selectedOrganization);
  const categories = useAppSelector(selectCategories);
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
    if (selectedImageUrl) return { image_url: selectedImageUrl };

    // First try to find a main image
    const mainImg = itemImagesForCurrentItem.find(
      (img) => img.image_type === "main",
    );
    const firstImg = itemImagesForCurrentItem[0];

    // Return image URL or placeholder
    return mainImg || firstImg || { image_url: imagePlaceholder };
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
      dispatch(getItemImages(id))
        .unwrap()
        .catch((error) => {
          console.error("Failed to fetch item images:", error);
        });
    }
  }, [id, dispatch]);

  // Fetch org data when item is loaded
  useEffect(() => {
    const itemWithOrgId = item as Item;
    if (
      itemWithOrgId?.org_id &&
      (!organization || organization.id !== itemWithOrgId.org_id)
    ) {
      void dispatch(fetchOrganizationById(itemWithOrgId.org_id));
    }
  }, [item, organization, dispatch]);

  // Fetch categories if not already loaded
  useEffect(() => {
    if (categories.length === 0) {
      void dispatch(fetchAllCategories({ page: 1, limit: 100 }));
    }
  }, [categories.length, dispatch]);

  // Find the category for this item
  const itemCategory = useMemo(() => {
    const itemWithCategory = item as Item;
    if (itemWithCategory?.category_id && categories.length > 0) {
      return categories.find((cat) => cat.id === itemWithCategory.category_id);
    }
    return null;
  }, [item, categories]);

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
      <div className="mb-3 mt-4 lg:mt-0">
        <Button
          onClick={() => {
            // navigate back to storage with page state if available
            if (fromPage) {
              void navigate("/storage", { state: { fromPage } });
            } else {
              void navigate(-1);
            }
          }}
          className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
          data-cy="item-details-back-btn"
        >
          <ChevronLeft /> {t.itemDetails.buttons.back[lang]}
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Item Images - Positioned Left */}
        <div className="md:w-2/5 lg:w-2/5 w-full" data-cy="item-details-images">
          {/* Main Image */}
          <div
            className="relative mb-4 h-[300px] group w-full max-w-md mx-auto md:max-w-none aspect-[4/3]"
            data-cy="item-details-main-image"
          >
            {/* Main Image Container */}
            <button
              className="border rounded-md bg-slate-50 overflow-hidden h-full w-full"
              onClick={toggleImageVisibility}
            >
              <img
                src={(mainImage as ItemImage).image_url}
                alt={itemContent?.item_name || "Tuotteen kuva"}
                className={cn(
                  "w-full h-full cursor-pointer hover:opacity-90 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out",
                  `object-${(mainImage as ItemImage)?.object_fit || "cover"}`,
                )}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = imagePlaceholder;
                }}
              />
            </button>

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
                    src={selectedImageUrl || (mainImage as ItemImage).image_url}
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
                <button
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
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Item Details */}
        <div
          className="md:w-3/5 lg:w-3/5 w-full space-y-4 order-1 md:order-2"
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

          {/* Organization, Location */}
          <div className="space-y-1 mt-4 mb-6">
            {/* Organization */}
            {organization && (
              <div
                className="flex items-center gap-2"
                data-cy="item-details-organization"
              >
                <span className="text-sm text-slate-600 font-semibold">
                  {t.itemDetails.organization[lang]}:
                </span>
                <span className="text-sm">{organization.name}</span>
              </div>
            )}

            {/* Location Details */}
            {(item as Item).location_details && (
              <div
                className="flex items-center gap-2"
                data-cy="item-details-location"
              >
                <span className="text-sm text-slate-600 font-semibold">
                  {t.itemDetails.locations.location[lang]}:
                </span>
                <span className="text-sm">
                  {extractCityFromLocationName(
                    (item as Item).location_details?.name || "",
                  )}
                </span>
              </div>
            )}
          </div>
          {/* Item description */}
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
              <div className="flex items-center justify-start mt-1 mb-4 lg:mb-0">
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
            <div className="flex flex-row" data-cy="item-details-no-dates">
              <Info className="mr-1 text-secondary size-4" />{" "}
              <div>
                {t.itemDetails.info.noDates[lang]}
                <Link
                  to="/storage"
                  className="ml-1 text-secondary underline"
                  data-cy="item-details-here-link"
                >
                  {t.itemDetails.info.here[lang]}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 space-y-2">
        {/* Category */}
        {itemCategory && (
          <div
            className="flex items-center gap-2"
            data-cy="item-details-category"
          >
            <span className="text-sm text-slate-600 font-semibold">
              {t.itemDetails.category[lang]}:
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm p-1 h-auto text-secondary hover:text-secondary hover:bg-secondary/10 underline-offset-2 hover:underline"
              onClick={() =>
                navigate("/storage", {
                  state: {
                    preSelectedFilters: {
                      categories: [itemCategory.id],
                    },
                  },
                })
              }
            >
              {itemCategory.translations[lang] || itemCategory.translations.en}
            </Button>
          </div>
        )}

        {/* Tags */}
        {(item as ItemWithTags).tags &&
        (item as ItemWithTags).tags!.length > 0 ? (
          <div
            className="flex items-baseline gap-2"
            data-cy="item-details-tags"
          >
            <span className="text-sm text-slate-600 font-semibold">
              {t.itemDetails.tags[lang]}:
            </span>
            <div className="flex flex-wrap gap-2">
              {(item as ItemWithTags).tags!.map((tag) => (
                <Button
                  key={tag.id}
                  variant="ghost"
                  size="sm"
                  className="text-sm p-1 h-auto text-secondary hover:text-secondary hover:bg-secondary/10 underline-offset-2 hover:underline"
                  onClick={() =>
                    navigate("/storage", {
                      state: {
                        preSelectedFilters: {
                          tagIds: [tag.id],
                        },
                      },
                    })
                  }
                >
                  {tag.translations?.[lang as "en" | "fi"]?.name ||
                    tag.translations?.en?.name ||
                    "Tag"}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-2"
            data-cy="item-details-no-tags"
          >
            <span className="text-sm font-semibold text-slate-600">
              {t.itemDetails.tags[lang]}:
            </span>
            <span className="text-sm italic">{t.itemDetails.noTags[lang]}</span>
          </div>
        )}
      </div>
    </div>
    // </div>
  );
};

export default ItemsDetails;
