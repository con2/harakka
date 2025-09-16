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
import { LoaderCircle, Search, X } from "lucide-react";
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
  const ITEMS_PER_PAGE = 12;
  const [page, setPage] = useState(1);
  // Translation
  const { lang } = useLanguage();

  // Get all filters from the UserPanel
  const { isActive, category, tagIds, locationIds, orgIds } = filters;

  //state for search query
  const [searchQuery, setSearchQuery] = useState("");
  const userQuery = searchQuery.toLowerCase().trim();
  const debouncedSearchQuery = useDebouncedValue(userQuery);
  const availMin = filters.itemsNumberAvailable[0];
  const availMax = filters.itemsNumberAvailable[1];

  // Consolidated request parameters to simplify dependencies -memoized object with all fetch inputs
  const requestParams = useMemo(
    () => ({
      ordered_by: "created_at" as const,
      ascending: true,
      page,
      limit: ITEMS_PER_PAGE,
      searchquery: debouncedSearchQuery,
      tag_filters: tagIds,
      activity_filter: isActive ? ("active" as const) : ("inactive" as const),
      category: category,
      location_filter: locationIds,
      availability_min: availMin,
      availability_max: availMax,
      org_ids: orgIds && orgIds.length > 0 ? orgIds : undefined,
    }),
    [
      page,
      ITEMS_PER_PAGE,
      debouncedSearchQuery,
      tagIds,
      isActive,
      category,
      locationIds,
      availMin,
      availMax,
      orgIds,
    ],
  );
  // Signature for the current request - used to track changes and reset pagination
  // Used as the useEffect dependency to refetch when anything changes
  const requestSig = useMemo(
    () => JSON.stringify(requestParams),
    [requestParams],
  );
  // Signature excluding page; used to reset to page 1 when filters/search change
  const baseSig = useMemo(() => {
    const { page: _p, ...rest } = requestParams;
    return JSON.stringify(rest);
  }, [requestParams]);
  // State to track the last settled request signature
  // last request that actually finished (success or error). It’s set when the thunk resolves.
  const [lastSettledSig, setLastSettledSig] = useState<string>("");

  // Fetch all items when the component mounts
  useEffect(() => {
    const dispatchedSig = requestSig;
    const promise = dispatch(fetchOrderedItems(requestParams));
    void promise
      .unwrap()
      .then(() => setLastSettledSig(dispatchedSig))
      .catch(() => setLastSettledSig(dispatchedSig));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, requestSig]);

  // Reset pagination to first page when filters or search change
  useEffect(() => {
    setPage(1);
  }, [baseSig]);

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
    <div className="container mx-auto">
      {/* Search Bar */}
      <div className="flex justify-center mb-4 p-4 rounded-md bg-slate-50">
        <div className="relative w-full sm:max-w-md bg-white rounded-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            placeholder={t.itemsList.searchPlaceholder[lang]}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && searchQuery) {
                setSearchQuery("");
              }
            }}
            className="pl-10 pr-9 w-full  focus:outline-none focus:ring-0 focus:ring-secondary focus:border-secondary focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Global Timeframe Selector */}
      <TimeframeSelector />

      {/* Render the list of items */}
      <div className="flex flex-wrap gap-8 mb-4 min-h-24">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-6">
            <LoaderCircle className="animate-spin w-8 h-8 text-secondary" />
          </div>
        ) : items.length === 0 ? (
          // Show empty state only when the latest settled request matches the current inputs
          lastSettledSig === requestSig ? (
            <p className="col-span-full">{t.itemsList.noItemsFound[lang]}</p>
          ) : null
        ) : (
          items.map((item) => <ItemCard key={item.id} item={item as Item} />)
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
