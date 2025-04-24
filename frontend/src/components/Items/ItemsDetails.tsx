import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  getItemById,
  selectSelectedItem,
  selectItemsLoading,
  selectItemsError,
} from "../../store/slices/itemsSlice";
import { Button } from "../../components/ui/button";
import { Clock, LoaderCircle } from "lucide-react";
import Rating from "../ui/rating";
import { addToCart } from "../../store/slices/cartSlice";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { format } from "date-fns";

const ItemsDetails: React.FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux selectors
  const item = useAppSelector(selectSelectedItem);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);
  const { startDate, endDate } = useAppSelector((state) => state.timeframe);

  // State for selected tab
  const [selectedTab, setSelectedTab] = useState("description");
  // State for cart quantity
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (item) {
      dispatch(
        addToCart({
          item: item,
          quantity: quantity,
          startDate: startDate, // Use global timeframe
          endDate: endDate, // Use global timeframe
        }),
      );
      toast.success(`${item.translations.fi.item_name} added to cart`);
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(getItemById(id));
    }
  }, [id, dispatch]);

  // Loading and error states
  if (loading) {
    return (
      <div>
        <LoaderCircle className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!item) {
    return <div>Item not found</div>;
  }

  return (
    <div className="container mx-auto p-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Item Images - Positioned Left */}
        <div className="md:w-1/3 w-full flex justify-center items-center border rounded-md">
          <p>Image comes here</p>
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

      {/* Tabs and Tab Contents - Positioned Below */}
      <div className="mt-10 w-full">
        <div className="flex gap-4">
          <Button
            onClick={() => setSelectedTab("description")}
            className="bg-transparent text-secondary hover:bg-secondary hover:text-white"
          >
            Description
          </Button>
          <Button
            onClick={() => setSelectedTab("reviews")}
            className="bg-transparent text-secondary hover:bg-secondary hover:text-white"
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
