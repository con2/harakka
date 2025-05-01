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
import ItemsLoader from "../../context/ItemsLoader";
import { useAuth } from "../../context/AuthContext";
import TimeframeSelector from "../TimeframeSelector";

// Access the filters via useOutletContext
const ItemsList: React.FC = () => {
  const filters = useOutletContext<any>(); // Get filters from context
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux state selectors
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);

  // Auth state from AuthContext
  const { user } = useAuth();

  // Check if the user is an admin
  // const isAdmin = user?.user_metadata?.role === 'admin';
  const isAdmin = user?.role === "admin" || user?.role === "superVera";
  //state for search query
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all items when the component mounts
  useEffect(() => {
    dispatch(fetchAllItems());
  }, [dispatch]);

  const userQuery = searchQuery.toLowerCase().trim();

  // Apply filters to the items
  const filteredItems = items.filter((item) => {
    // Filter by price range
    const isWithinPriceRange =
      item.price >= filters.priceRange[0] &&
      item.price <= filters.priceRange[1];
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
      isWithinPriceRange &&
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
        <ItemsLoader /> {/* Displaying loader component */}
      </div>
    );
  }

  // Error handling
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {/* Show the create button only for admins */}
      {isAdmin && (
        <Button
          className="mb-4"
          onClick={() => navigate("/admin/items/create")}
        >
          Create New Item
        </Button>
      )}

      {/* Search Bar */}
      <div className="flex justify-center mb-4">
        <Input
          placeholder="Search items by name, category, tags, or description"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white rounded-md sm:max-w-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
        />
      </div>

      {/* Global Timeframe Selector */}
      <TimeframeSelector />

      {/* Render the list of filtered items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
