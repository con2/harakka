import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Clock, LoaderCircle } from "lucide-react";
import Rating from "../ui/rating";
import { addToCart } from "../../store/slices/cartSlice";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import imagePlaceholder from "@/assets/defaultImage.jpg";

const ItemsDetails: React.FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux selectors
  const item = useAppSelector(selectSelectedItem);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);
  const { startDate, endDate } = useAppSelector((state) => state.timeframe);
  const itemImages = useAppSelector(selectItemImages);

  // State for selected tab
  const [selectedTab, setSelectedTab] = useState("description");
  // State for cart quantity
  const [quantity, setQuantity] = useState(1);
  // Image tracking states
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

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

  // Handle cart actions
  const handleAddToCart = () => {
    if (item) {
      dispatch(
        addToCart({
          item: item,
          quantity: quantity,
          startDate: startDate,
          endDate: endDate,
        }),
      );
      toast.success(`${item.translations.fi.item_name} added to cart`);
    }
  };

  // Fetch item and images
  useEffect(() => {
    if (id) {
      dispatch(getItemById(id));

      // Fetch images for this item
      dispatch(getItemImages(id))
        .unwrap()
        .catch((error) => {
          console.error("Failed to fetch item images:", error);
        });
    }
  }, [id, dispatch]);

  // Loading and error states
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
        Error: {error}
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto p-12 text-center">Item not found</div>
    );
  }

  return (
    <div className="container mx-auto p-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Item Images - Positioned Left */}
        <div className="md:w-1/3 w-full">
          {/* Main Image */}
          <div className="border rounded-md overflow-hidden bg-slate-50 mb-4">
            <img
              src={mainImage}
              alt={item.translations.en.item_name || "Item image"}
              className="w-full h-[300px] object-contain"
              onError={(e) => {
                console.warn(`Failed to load image: ${mainImage}`);
                e.currentTarget.onerror = null;
                e.currentTarget.src = imagePlaceholder;
              }}
            />
          </div>

          {/* Detail Images Gallery */}
          {detailImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {detailImages.map((img) => (
                <div
                  key={img.id}
                  className="border rounded-md overflow-hidden bg-slate-50 cursor-pointer"
                  onClick={() => setSelectedImageUrl(img.image_url)}
                >
                  <img
                    src={img.image_url}
                    alt={img.alt_text || "Detail image"}
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
        <div className="md:w-2/3 w-full space-y-4">
          <h2 className="text-2xl font-bold">
            {item.translations.fi.item_name}
          </h2>
          <p className="text-lg text-gray-500">
            {item.translations.fi.item_description}
          </p>

          {/* Display selected booking timeframe if it exists */}
          {startDate && endDate && (
            <div className="mb-3 bg-slate-100 p-2 rounded-md">
              <div className="flex items-center text-sm text-slate-600 mb-1">
                <Clock className="h-4 w-4 mr-1" />
                <span className="font-medium">Selected booking:</span>
              </div>
              <p className="text-xs m-0">
                {format(startDate, "PPP")} - {format(endDate, "PPP")}
              </p>
            </div>
          )}

          {/* Booking Section */}
          <div className="flex items-center mt-4 gap-4">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-16 mx-2 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
            <Button
              className="bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-background hover:bg-secondary flex-1"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </div>

          {/* Rating Component */}
          <div className="flex items-center">
            <span className="text-sm text-gray-600">Average Rating: </span>
            <div className="ml-2">
              <Rating value={item.average_rating ?? 0} readOnly />
            </div>
          </div>

          {/* Back Button */}
          <Button
            onClick={() => navigate(-1)}
            className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
          >
            Back
          </Button>
        </div>
      </div>

      {/* Tabs and Tab Contents */}
      <div className="mt-10 w-full">
        <div className="flex gap-4">
          <Button
            onClick={() => setSelectedTab("description")}
            className={`${
              selectedTab === "description"
                ? "bg-secondary text-white"
                : "bg-transparent text-secondary"
            } hover:bg-secondary hover:text-white`}
          >
            Description
          </Button>
          <Button
            onClick={() => setSelectedTab("reviews")}
            className={`${
              selectedTab === "reviews"
                ? "bg-secondary text-white"
                : "bg-transparent text-secondary"
            } hover:bg-secondary hover:text-white`}
          >
            Reviews
          </Button>
        </div>

        {/* Tab Content */}
        <div className="mt-4 bg-slate-50 p-4 rounded-lg">
          {selectedTab === "description" && (
            <p>{item.translations.fi.item_description}</p>
          )}
          {selectedTab === "reviews" && <p>Reviews will be displayed here</p>}
        </div>
      </div>
    </div>
  );
};

export default ItemsDetails;
