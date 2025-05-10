import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAllItems,
  selectAllItems,
  selectItemsLoading,
  selectItemsError,
} from "../../store/slices/itemsSlice";
import ItemCard from "./ItemCard";
import { Button } from "../../components/ui/button";
import { Input } from "../ui/input";
import { useNavigate, useOutletContext } from "react-router-dom";
import TimeframeSelector from "../TimeframeSelector";
import { LoaderCircle, Search } from "lucide-react";

// Access the filters via useOutletContext
const ItemsList: React.FC = () => {
  const filters = useOutletContext<any>(); // Get filters from context
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux state selectors
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);

  //state for search query
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all items when the component mounts
  useEffect(() => {
    dispatch(fetchAllItems());
  }, [dispatch]);

  const userQuery = searchQuery.toLowerCase().trim();

  // Apply filters to the items
  const filteredItems = items.filter((item) => {
    // Filter by active status
    const isActive = filters.isActive ? item.is_active : true;
    const isWithinAvailabilityRange =
      item.items_number_available >= filters.itemsNumberAvailable[0] &&
      item.items_number_available <= filters.itemsNumberAvailable[1];
    // Filter by timeframe availability (TODO: replace placeholder - needs backend implementation)

    // filter by average rating
    const matchesRating =
      filters.averageRating.length === 0 ||
      filters.averageRating.includes(Math.floor(item.average_rating ?? 0));

    const matchesSearch =
      item.translations.fi.item_name.toLowerCase().includes(userQuery) ||
      item.translations.fi.item_type?.toLowerCase().includes(userQuery) ||
      item.translations.fi.item_description
        ?.toLowerCase()
        .includes(userQuery) ||
      item.translations.en.item_name.toLowerCase().includes(userQuery) ||
      item.translations.en.item_type?.toLowerCase().includes(userQuery) ||
      item.translations.en.item_description?.toLowerCase().includes(userQuery);
    // Filter by item types
    const matchesItemTypes =
      !filters.itemTypes?.length ||
      filters.itemTypes.includes(item.translations.fi.item_type);
    // Filter by tags
    const matchesTags =
      !filters.tagIds?.length ||
      (item.storage_item_tags || []).some((tag) =>
        filters.tagIds.includes(tag.id),
      );
    // add tags filter here
    // right now the englih tags are not found
    return (
      isActive &&
      isWithinAvailabilityRange &&
      matchesRating &&
      matchesSearch &&
      matchesItemTypes &&
      matchesTags
    );
  });

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <LoaderCircle className="animate-spin w-10 h-10 text-secondary" /> {/* Displaying loader component */}
      </div>
    );
  }

  // Error handling
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Search Bar */}
      <div className="flex justify-center mb-4 p-4 rounded-md bg-slate-50">
        <div className="relative w-full sm:max-w-md bg-white">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            placeholder="Search items by name, category, tags, or description"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-md w-full focus:outline-none focus:ring-0 focus:ring-secondary focus:border-secondary focus:bg-white"
          />
        </div>
      </div>

      {/* Global Timeframe Selector */}
      <TimeframeSelector />

      {/* Render the list of filtered items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
        {filteredItems.length === 0 ? (
          <p>No items found</p> // Message when no items exist
        ) : (
          filteredItems.map((item) => <ItemCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
};

export default ItemsList;
