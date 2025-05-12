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
import { ChevronLeft, Clock, LoaderCircle } from "lucide-react";
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
  //const [selectedTab, setSelectedTab] = useState("description");
  // State for cart quantity
  const [quantity, setQuantity] = useState(1);
  // Image tracking states
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  // State for larger image view
  const [isImageVisible, setIsImageVisible] = useState(false);

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
    <div className="container mx-auto px-4">
      {/* Back Button */}
      <div className="mb-3">
        <Button
          onClick={() => navigate(-1)}
          className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
        >
          <ChevronLeft /> Back
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Item Images - Positioned Left */}
        <div className="md:w-1/3 w-full">
          {/* Main Image */}
          <div className="relative mb-4 h-[300px] group">
            {/* Main Image Container */}
            <div className="border rounded-md bg-slate-50 overflow-hidden h-full w-full">
              <img
                src={mainImage}
                alt={item.translations.en.item_name || "Item image"}
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = imagePlaceholder;
                }}
                onClick={toggleImageVisibility}
              />
            </div>

            {/* Floating Enlarged Preview on Hover */}
            <div
              className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ${isImageVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"} transition-all duration-400 ease-in-out z-50 pointer-events-none`}
            >
              <div className="w-[400px] h-[400px] border rounded-lg shadow-lg bg-white flex justify-center items-center enlarged-image">
                <img
                  src={mainImage}
                  alt="Full preview"
                  className="object-contain max-w-full max-h-full"
                />
              </div>
            </div>
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
        <div className="md:w-2/3 w-full space-y-6 order-1 md:order-2">
          <h2 className="text-2xl font-normal text-left">
            {item.translations.fi.item_name.charAt(0).toUpperCase() +
              item.translations.fi.item_name.slice(1)}
          </h2>
          {/* Rating Component */}
          {item.average_rating ? (
            <div className="flex items-center justify-start">
              <Rating value={item.average_rating ?? 0} readOnly />
            </div>
          ) : (
            ""
          )}
          <p className="text-md text-primary">
            {item.translations.fi.item_description}
          </p>

          {/* Display selected booking timeframe if it exists */}
          {startDate && endDate && (
            <div className="bg-slate-100 max-w-[250px] rounded-md mb-2 p-2">
              <div className="flex items-center text-sm text-slate-400">
                <Clock className="h-4 w-4 mr-1" />
                <span className="font-medium text-xs">Selected booking</span>
              </div>
              <p className="text-xs font-medium m-0">
                {format(startDate, "PPP")} - {format(endDate, "PPP")}
              </p>
            </div>
          )}

          {/* Booking Section */}
          <div className="flex flex-col justify-center items-start mt-4 gap-4">
            <div className="flex flex-row justify-center items-center">
              <span className="text-sm font-medium w-20">Quantity</span>
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
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-11 h-8 mx-2 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8 p-0"
              >
                +
              </Button>
            </div>
            <div className="flex items-center justify-start">
              <Button
                className="bg-secondary rounded-2xl text-white border-secondary border-1 hover:text-secondary hover:bg-white flex-1 mt-6"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Tab Contents */}
      {/* <div className="mt-10 w-full"> */}
      {/* <div className="flex gap-4">
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
      </div> */}

      {/* Tab Content */}
      {/* <div className="mt-4 bg-slate-50 p-4 rounded-lg">
        {selectedTab === "description" && (
          <p>{item.translations.fi.item_description}</p>
        )}
        {selectedTab === "reviews" && <p>Reviews will be displayed here</p>}
      </div> */}
    </div>
    // </div>
  );
};

export default ItemsDetails;
