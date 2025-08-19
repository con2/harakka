import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  selectAllItems,
  selectItemsLoading,
  selectItemsError,
  fetchOrderedItems,
  selectItemsPagination,
} from "../../store/slices/itemsSlice";
import ItemCard from "./ItemCard";
import { Input } from "../ui/input";
import { useOutletContext } from "react-router-dom";
import TimeframeSelector from "../TimeframeSelector";
import { LoaderCircle, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { FiltersState, Item } from "@/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Button } from "../ui/button";

// Access the filters via useOutletContext
const ItemsList: React.FC = () => {
  const filters = useOutletContext<FiltersState>(); // Get filters from context
  const dispatch = useAppDispatch(); // Redux state selectors
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);
  const pagination = useAppSelector(selectItemsPagination);
  const ITEMS_PER_PAGE = 10;
  const [page, setPage] = useState(1);
  // Translation
  const { lang } = useLanguage();

  // Get all filters from the UserPanel
  const { isActive, itemTypes, tagIds, locationIds, orgIds } = filters;

  //state for search query
  const [searchQuery, setSearchQuery] = useState("");
  const userQuery = searchQuery.toLowerCase().trim();
  const debouncedSearchQuery = useDebouncedValue(userQuery);
  // Stable dependencies for effects
  const itemTypesKey = useMemo(() => itemTypes.join("|"), [itemTypes]);
  const locationsKey = useMemo(() => locationIds.join("|"), [locationIds]);
  const tagsKey = useMemo(() => tagIds.join("|"), [tagIds]);
  const orgsKey = useMemo(() => (orgIds || []).join("|"), [orgIds]);
  const availMin = filters.itemsNumberAvailable[0];
  const availMax = filters.itemsNumberAvailable[1];

  // Fetch all items when the component mounts
  useEffect(() => {
    const active = isActive ? "active" : "inactive";
    void dispatch(
      fetchOrderedItems({
        ordered_by: "created_at",
        ascending: true,
        page,
        limit: ITEMS_PER_PAGE,
        searchquery: debouncedSearchQuery,
        tag_filters: tagIds,
        activity_filter: active,
        categories: itemTypes,
        location_filter: locationIds,
        availability_min: availMin,
        availability_max: availMax,
        org_ids: orgIds && orgIds.length > 0 ? orgIds : undefined,
      }),
    );
  }, [
    dispatch,
    isActive,
    itemTypes,
    page,
    debouncedSearchQuery,
    availMin,
    availMax,
    locationIds,
    tagIds,
    orgIds,
    ITEMS_PER_PAGE,
  ]);

  // Reset pagination to first page when filters or search change
  useEffect(() => {
    setPage(1);
  }, [
    isActive,
    itemTypesKey,
    debouncedSearchQuery,
    availMin,
    availMax,
    locationsKey,
    tagsKey,
    orgsKey,
  ]);

  // Apply availability filter to items (client‑side filtering for availability range)
  const filteredItems = items.filter((item) => {
    // Prefer the new column; fall back to total if not present
    const availableQuantity =
      item.items_number_currently_in_storage ?? item.items_number_total ?? 0;

    return (
      availableQuantity >= filters.itemsNumberAvailable[0] &&
      availableQuantity <= filters.itemsNumberAvailable[1]
    );
  });
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
        {filteredItems.length === 0 ? (
          <p>{t.itemsList.noItemsFound[lang]}</p> // Message when no items exist
        ) : (
          filteredItems.map((item) => (
            <ItemCard key={item.id} item={item as Item} />
          ))
        )}
      </div>
      {/* Pagination controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-4 my-6">
          <Button
            variant="outline" // or "secondary" or "ghost"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <span className="self-center">
            {page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline" // or "secondary" or "ghost"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default ItemsList;
