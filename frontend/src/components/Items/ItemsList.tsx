import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  selectAllItems,
  selectItemsLoading,
  selectItemsError,
  selectItemsLimit,
  fetchOrderedItems,
} from "../../store/slices/itemsSlice";
import ItemCard from "./ItemCard";
import { Input } from "../ui/input";
import { useOutletContext } from "react-router-dom";
import TimeframeSelector from "../TimeframeSelector";
import { LoaderCircle, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { FiltersState } from "@/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

// Access the filters via useOutletContext
const ItemsList: React.FC = () => {
  const filters = useOutletContext<FiltersState>(); // Get filters from context
  const dispatch = useAppDispatch();
  const pageLimit = useAppSelector(selectItemsLimit);
  // Redux state selectors
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);
  const [currentPage, setCurrentPage] = useState(1);

  // Translation
  const { lang } = useLanguage();

  // Get all filters from the UserPanel
  const { isActive, itemTypes, tagIds, locationIds } = filters;

  //state for search query
  const [searchQuery, setSearchQuery] = useState("");
  const userQuery = searchQuery.toLowerCase().trim();
  const debouncedSearchQuery = useDebouncedValue(userQuery);

  // Fetch all items when the component mounts
  useEffect(() => {
    const active = isActive ? "active" : "inactive";
    dispatch(
      fetchOrderedItems({
        ordered_by: "created_at",
        ascending: true,
        page: currentPage,
        limit: pageLimit,
        searchquery: debouncedSearchQuery,
        tag_filters: tagIds,
        activity_filter: active,
        categories: itemTypes,
        location_filter: locationIds,
      }),
    );
  }, [
    dispatch,
    items.length,
    currentPage,
    isActive,
    itemTypes,
    debouncedSearchQuery,
    locationIds,
    tagIds,
    pageLimit,
  ]);

  // Handle page change
  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <LoaderCircle className="animate-spin w-10 h-10 text-secondary" />{" "}
      </div>
    );
  }

  // Error handling
  if (error) {
    return (
      <div>
        {t.itemsList.error[lang]}
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Search Bar */}
      <div className="flex justify-center mb-4 p-4 rounded-md bg-slate-50">
        <div className="relative w-full sm:max-w-md bg-white">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            placeholder={t.itemsList.searchPlaceholder[lang]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-md w-full focus:outline-none focus:ring-0 focus:ring-secondary focus:border-secondary focus:bg-white"
          />
        </div>
      </div>

      {/* Global Timeframe Selector */}
      <TimeframeSelector />

      {/* Render the list of filtered items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 mb-4">
        {items.length === 0 ? (
          <p>{t.itemsList.noItemsFound[lang]}</p> // Message when no items exist
        ) : (
          items.map((item) => <ItemCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
};

export default ItemsList;
