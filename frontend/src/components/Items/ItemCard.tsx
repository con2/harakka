import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getItemById, deleteItem } from '@/store/slices/itemsSlice';
import { Item } from '../../types/item';
import { format } from 'date-fns';
import { Input } from '../ui/input';
import { addToCart } from '@/store/slices/cartSlice';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  getItemImages,
  selectItemImages,
} from '../../store/slices/itemImagesSlice';
import imagePlaceholder from '@/assets/defaultImage.jpg';
import { ordersApi } from '@/api/services/orders';

// Add this utility function near the top of your file
const transformSupabaseUrl = (url: string): string => {
  if (!url) return '';

  // Check if it's already a proper URL with the correct format
  if (url.includes('/object/public/')) return url;

  try {
    // Extract the project ID and path components
    const urlObj = new URL(url);
    const projectId = urlObj.hostname.split('.')[0];

    // Find the bucket name in the path
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.findIndex((part) => part === 'item-images');

    if (bucketIndex === -1) return url; // Can't find bucket, return original

    // Create the proper public URL format
    const filePath = pathParts.slice(bucketIndex).join('/');
    return `https://${projectId}.supabase.co/storage/v1/object/public/${filePath}`;
  } catch (e) {
    console.warn('Invalid URL format:', url, e);
    return url;
  }
};

interface ItemsCardProps {
  item: Item;
}

const ItemCard: React.FC<ItemsCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.role === 'admin'; // Admin check
  const itemImages = useAppSelector(selectItemImages);

  // Get global timeframe from Redux
  const { startDate, endDate } = useAppSelector((state) => state.timeframe);

  // Only keep quantity as local state
  const [quantity, setQuantity] = useState(0);

  const [availabilityInfo, setAvailabilityInfo] = useState<{
    availableQuantity: number;
    isChecking: boolean;
    error: string | null;
  }>({
    availableQuantity: item.items_number_available,
    isChecking: false,
    error: null,
  });

  // Add a state to track if we've successfully loaded an image
  const [hasLoadedImage, setHasLoadedImage] = useState(false);
  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);

  // Enhanced image finding with memoization to prevent recalculation on every render
  const itemImagesForCurrentItem = useMemo(
    () => itemImages.filter((img) => img.item_id === item.id),
    [itemImages, item.id],
  );

  // Memoize the image URL calculation to prevent flickering
  const imageToDisplay = useMemo(() => {
    // If we've already successfully loaded an image, use that
    if (hasLoadedImage && loadedImageUrl) {
      return loadedImageUrl;
    }

    // Find thumbnail image for this item
    const thumbnailImage = itemImagesForCurrentItem.find(
      (img) => img.image_type === 'thumbnail',
    );

    // If no thumbnail found, try to get main image
    const mainImage =
      !thumbnailImage &&
      itemImagesForCurrentItem.find((img) => img.image_type === 'main');

    // Use thumbnail, main, or placeholder image
    const rawImageUrl = thumbnailImage?.image_url || mainImage?.image_url || '';
    return rawImageUrl ? transformSupabaseUrl(rawImageUrl) : imagePlaceholder;
  }, [itemImagesForCurrentItem, hasLoadedImage, loadedImageUrl]);

  // Fetch images only once per item
  useEffect(() => {
    // Clear loaded image state when item changes
    setHasLoadedImage(false);
    setLoadedImageUrl(null);

    // Only fetch if we don't already have images for this item
    if (!itemImagesForCurrentItem.length) {
      dispatch(getItemImages(item.id))
        .unwrap()
        .catch((error) => {
          console.error('Failed to fetch item images:', error);
        });
    }
  }, [dispatch, item.id]); // Remove itemImages from dependencies

  // Navigate to the item's detail page
  const handleItemClick = (itemId: string) => {
    dispatch(getItemById(itemId)); // Fetch the item by ID when clicked
    navigate(`/items/${itemId}`);
  };

  // Handle item deletion
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await dispatch(deleteItem(item.id)).unwrap(); // Delete item via Redux action
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  // Handle item update (for admin only)
  const handleUpdate = () => {
    // Navigate to the update form or trigger a modal to edit the item
    navigate(`/admin/items/${item.id}/edit`);
  };

  // Handle adding item to cart
  const handleAddToCart = () => {
    if (item) {
      dispatch(
        addToCart({
          item: item,
          quantity: quantity,
          startDate: startDate ? startDate : undefined,
          endDate: endDate ? endDate : undefined,
        }),
      );
      toast.success(`${item.translations.fi.item_name} added to cart`);
    }
  };

  // Check if the item is available for the selected timeframe
  useEffect(() => {
    // Only check availability if dates are selected
    if (startDate && endDate) {
      setAvailabilityInfo((prev) => ({
        ...prev,
        isChecking: true,
        error: null,
      }));

      ordersApi
        .checkAvailability(item.id, startDate, endDate)
        .then((response) => {
          setAvailabilityInfo({
            availableQuantity: response.availableQuantity,
            isChecking: false,
            error: null,
          });
        })
        .catch((error) => {
          console.error('Error checking availability:', error);
          setAvailabilityInfo({
            availableQuantity: item.items_number_available,
            isChecking: false,
            error: 'Failed to check availability',
          });
        });
    }
  }, [item.id, startDate, endDate]);

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
      className="w-full max-w-[350px] flex flex-col justify-between p-4"
    >
      {/* Image Section */}
      <div className="h-40 bg-gray-200 flex items-center justify-center rounded">
        <img
          src={imageToDisplay}
          alt={item.translations?.en?.item_name || 'Storage item'}
          className="w-full h-full object-cover"
          onLoad={() => {
            // Mark this image as successfully loaded
            if (imageToDisplay !== imagePlaceholder) {
              setHasLoadedImage(true);
              setLoadedImageUrl(imageToDisplay);
            }
          }}
          onError={(e) => {
            console.warn(`Failed to load image: ${imageToDisplay}`);
            e.currentTarget.onerror = null;
            e.currentTarget.src = imagePlaceholder;
          }}
          loading="lazy"
        />
      </div>

      {/* Item Details */}
      <div>
        <h2 className="text-lg font-semibold text-center mb-0">
          {item.translations.fi.item_name.charAt(0).toUpperCase() +
            item.translations.fi.item_name.slice(1)}
        </h2>
        {/* TODO: return this span when back will provide location name */}
        {/* <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <BoxIcon className="h-4 w-4" />
          <span>{item.location_id}</span>
        </div> */}
        {/* <p className="text-lg font-semibold text-center text-primary">
          €{item.price.toFixed(2)} / day
        </p> */}
      </div>

      {/* Display selected booking timeframe if it exists */}
      {startDate && endDate && (
        <div className="bg-slate-100 p-2 rounded-md mb-2">
          <div className="flex items-center text-sm text-slate-400">
            <Clock className="h-4 w-4 mr-1" />
            <span className="font-medium text-xs">Selected booking</span>
          </div>
          <p className="text-sm font-medium m-0">
            {format(startDate, 'PPP')} - {format(endDate, 'PPP')}
          </p>
        </div>
      )}

      {/* Quantity Input */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold w-20">Quantity</span>
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
              onClick={() =>
                setQuantity(
                  Math.min(availabilityInfo.availableQuantity, quantity + 1),
                )
              }
              className="h-8 w-8 p-0"
              disabled={quantity >= availabilityInfo.availableQuantity}
            >
              +
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-end mb-3 mt-1">
          {availabilityInfo.isChecking ? (
            <p className="text-xs text-slate-400 italic m-0">
              Checking availability...
            </p>
          ) : availabilityInfo.error ? (
            <p className="text-xs text-red-500 italic m-0">
              {availabilityInfo.error}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic m-0">
              {startDate && endDate
                ? `Available: ${availabilityInfo.availableQuantity} units`
                : `Total units: ${item.items_number_available}`}
            </p>
          )}
        </div>

        {/* Add to Cart Button with Tooltip */}
        <TooltipProvider>
          <Tooltip open={isAddToCartDisabled ? undefined : false}>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                className={
                  isAddToCartDisabled
                    ? 'inline-block w-full cursor-not-allowed'
                    : 'inline-block w-full'
                }
              >
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-background rounded-2xl text-secondary border-secondary border-1 hover:text-white hover:bg-secondary"
                  disabled={isAddToCartDisabled}
                  style={{
                    pointerEvents: isAddToCartDisabled ? 'none' : 'auto',
                  }}
                >
                  Add to Cart
                </Button>
              </span>
            </TooltipTrigger>
            {isAddToCartDisabled && (
              <TooltipContent>
                {!startDate || !endDate ? (
                  <p>Please select booking dates first</p>
                ) : (
                  <p>Please select valid quantity</p>
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
      >
        View Details
      </Button>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={handleUpdate}>
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ItemCard;
