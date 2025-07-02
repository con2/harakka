import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllTags, selectAllTags } from "@/store/slices/tagSlice";
import { selectAllItems } from "@/store/slices/itemsSlice";
import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, SlidersIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Star } from "lucide-react";
import {
  fetchAllLocations,
  selectAllLocations,
} from "@/store/slices/locationsSlice";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { FilterValue } from "@/types";

const UserPanel = () => {
  const tags = useAppSelector(selectAllTags);
  const items = useAppSelector(selectAllItems);
  const locations = useAppSelector(selectAllLocations);
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const filterRef = useRef<HTMLDivElement>(null); // Ref for the filter panel position

  useEffect(() => {
    if (tags.length < 1) dispatch(fetchAllTags({ page: 1, limit: 10 }));
    if (locations.length < 1)
      dispatch(fetchAllLocations({ page: 1, limit: 10 }));
  }, [dispatch, tags, locations]);

  // Unique item_type values from items
  const uniqueItemTypes = Array.from(
    new Set(
      items
        .map((item) => {
          const itemType =
            item.translations?.[lang]?.item_type ||
            item.translations?.[lang === "fi" ? "en" : "fi"]?.item_type;
          return itemType;
        })
        .filter(Boolean)
        .map((type) => type)
        .sort((a, b) => a.localeCompare(b)),
    ),
  );
  const [showAllItemTypes, setShowAllItemTypes] = useState(false);
  const visibleItemTypes = showAllItemTypes
    ? uniqueItemTypes
    : uniqueItemTypes.slice(0, 5);

  // filter states
  const [filters, setFilters] = useState<{
    isActive: boolean;
    averageRating: number[];
    itemsNumberAvailable: [number, number];
    itemTypes: string[];
    tagIds: string[];
    locationIds: string[];
  }>({
    isActive: true, // Is item active or not filter
    averageRating: [],
    itemsNumberAvailable: [0, 100], // add a range for number of items
    itemTypes: [],
    tagIds: [],
    locationIds: [],
  });

  // Handle filter change
  const handleFilterChange = (filterKey: string, value: FilterValue) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: value,
    }));
  };

  const countActiveFilters = () => {
    let count = 0;
    if (
      filters.itemsNumberAvailable[0] !== 0 ||
      filters.itemsNumberAvailable[1] !== 100
    ) {
      count++;
    }
    count += filters.averageRating.length;
    count += filters.itemTypes.length;
    count += filters.tagIds.length;
    count += filters.locationIds.length;
    return count;
  };

  // Mobile filter toggle visibility state
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    if (isFilterVisible && filterRef.current) {
      filterRef.current.scrollTop = 0;
    }
  }, [isFilterVisible]);

  return (
    <div className="flex min-h-screen w-full overflow-y-auto md:px-10">
      {/* Sidebar: Filters Panel */}
      <aside
        ref={filterRef}
        className={`${isFilterVisible ? "block" : "hidden"
          } md:flex md:flex-col md:min-h-[calc(100vh-60px)] w-full md:w-76 p-4 bg-white md:pb-10 fixed inset-0 z-40 md:static transition-all duration-300 ease-in-out md:overflow-visible overflow-y-auto`}
        style={{
          top: "60px",
          backgroundColor: "#fff",
        }}
      >
        {/* Filter Section */}
        <nav className="flex flex-col space-y-4 border-1 p-4 rounded-md">
          <div>
            <div className="flex items-center justify-between my-2">
              <h3 className="text-secondary font-bold mb-0">Filters</h3>
              <div className="flex items-center gap-2">
                {/* Clear filters button */}
                {countActiveFilters() > 0 && (
                  <div className="flex justify-start">
                    <Button
                      variant="ghost"
                      size={"sm"}
                      className="text-xs px-1 bg-white text-highlight2 border-highlight2 hover:bg-highlight2 hover:text-white"
                      onClick={() =>
                        setFilters({
                          isActive: true,
                          averageRating: [],
                          itemsNumberAvailable: [0, 100],
                          itemTypes: [],
                          tagIds: [],
                          locationIds: [],
                        })
                      }
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {countActiveFilters()} {t.userPanel.filters.active[lang]}
                </div>
                {/* SlidersIcon as a close button (only in mobile view) */}
                <Button
                  onClick={() => setIsFilterVisible(false)}
                  className="md:hidden p-1 rounded hover:bg-slate-100 transition-colors"
                  aria-label="Close Filters"
                >
                  <SlidersIcon className="w-5 h-5 text-highlight2" />
                </Button>
              </div>
            </div>
            <Separator className="my-4" />

            {/* Categories / item_types*/}
            <div className="flex flex-col flex-wrap gap-3">
              <label className="text-primary text-md block mb-0">
                {" "}
                {t.userPanel.filters.itemTypes[lang]}
              </label>
              {visibleItemTypes.map((typeName) => {
                const isSelected = filters.itemTypes?.includes(typeName);
                return (
                  <span
                    key={typeName}
                    className={`cursor-pointer text-sm justify-between flex items-center ${isSelected
                      ? "text-secondary font-bold"
                      : "text-slate-500 hover:text-secondary"
                      }`}
                    onClick={() => {
                      const updated = isSelected
                        ? filters.itemTypes.filter((t) => t !== typeName)
                        : [...(filters.itemTypes || []), typeName];
                      handleFilterChange("itemTypes", updated);
                    }}
                  >
                    {typeName.charAt(0).toUpperCase() + typeName.slice(1)}{" "}
                    <ChevronRight className="w-4 h-4 inline" />
                  </span>
                );
              })}
              {uniqueItemTypes.length > 5 && (
                <Button
                  variant="ghost"
                  className="text-left text-sm text-secondary"
                  onClick={() => setShowAllItemTypes((prev) => !prev)}
                >
                  {showAllItemTypes
                    ? t.userPanel.categories.showLess[lang]
                    : t.userPanel.categories.seeAll[lang]}
                </Button>
              )}
            </div>

            <Separator className="my-4" />

            {/* availability filter */}
            <div className="my-4">
              <label className="text-primary block mb-6">
                {" "}
                {t.userPanel.availability.title[lang]}
              </label>
              <Slider
                min={0}
                max={100} // edit upper limit
                value={filters.itemsNumberAvailable}
                onValueChange={([min, max]) =>
                  handleFilterChange("itemsNumberAvailable", [min, max])
                }
                className="w-full"
              />
              <div className="mt-2 text-secondary text-center">
                {filters.itemsNumberAvailable[0]} -{" "}
                {filters.itemsNumberAvailable[1]}{" "}
                {t.userPanel.availability.items[lang]}
              </div>
            </div>
            <Separator className="my-4" />

            {/* Locations filter section */}
            <div className="my-4">
              <label className="text-primary font-medium block mb-2">
                {t.userPanel.locations.title[lang]}
              </label>
              <div className="flex flex-col gap-2">
                {locations.map((location) => {
                  const isSelected = filters.locationIds?.includes(location.id);
                  return (
                    <label
                      key={location.id}
                      className={`flex items-center gap-2 text-sm cursor-pointer ${isSelected
                        ? "text-secondary"
                        : "text-slate-600 hover:text-secondary"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const updated = isSelected
                            ? filters.locationIds.filter(
                              (id) => id !== location.id,
                            )
                            : [...filters.locationIds, location.id];
                          handleFilterChange("locationIds", updated);
                        }}
                        className="accent-secondary"
                      />
                      <div className="flex items-center gap-1">
                        <span>{location.name}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <Separator className="my-4" />
            {/* Tags */}
            <div className="my-4">
              <label className="text-primary block mb-4">
                {" "}
                {t.userPanel.tags.title[lang]}
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const tagName =
                    tag.translations?.[lang]?.name ||
                    tag.translations?.[lang === "fi" ? "en" : "fi"]?.name ||
                    t.userPanel.tags.unnamed[lang];
                  return (
                    <Button
                      key={tag.id}
                      className={`px-4 border-secondary border-1 rounded-2xl ${(filters.tagIds || []).includes(tag.id)
                        ? "bg-secondary text-white hover:bg-secondary/80 hover:text-white hover:border-secondary"
                        : "bg-white text-secondary hover:bg-secondary hover:text-white hover:border-secondary"
                        }`}
                      onClick={() => {
                        const selected = filters.tagIds || [];
                        const isSelected = selected.includes(tag.id);
                        const updated = isSelected
                          ? selected.filter((id) => id !== tag.id)
                          : [...selected, tag.id];
                        handleFilterChange("tagIds", updated);
                      }}
                    >
                      {tagName.toLowerCase()}
                    </Button>
                  );
                })}
              </div>
            </div>
            <Separator className="my-4" />

            {/* Rating filter */}
            <div className="my-4">
              <label className="text-primary block mb-4">
                {" "}
                {t.userPanel.rating.title[lang]}
              </label>
              <div className="flex flex-col gap-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const isChecked = filters.averageRating.includes(rating);
                  return (
                    <label
                      key={rating}
                      className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-secondary hover:cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const updated = isChecked
                            ? filters.averageRating.filter((r) => r !== rating)
                            : [...filters.averageRating, rating];
                          handleFilterChange("averageRating", updated);
                        }}
                        className="accent-secondary"
                      />
                      <div className="flex items-center">
                        {Array.from({ length: rating }, (_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-secondary text-secondary"
                          />
                        ))}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {countActiveFilters() > 0 && (
              <div>
                <Separator className="my-4" />
                <div className="flex justify-center mt-2">
                  <Button
                    variant={"outline"}
                    size={"sm"}
                    onClick={() =>
                      setFilters({
                        isActive: true,
                        averageRating: [],
                        itemsNumberAvailable: [0, 100],
                        itemTypes: [],
                        tagIds: [],
                        locationIds: [],
                      })
                    }
                  >
                    {t.userPanel.filters.clearAllFilters[lang]}
                  </Button>
                </div>
              </div>
            )}

            {/* Close Filter Button */}
            <div className="md:hidden text-center mt-4">
              <Button
                onClick={() => setIsFilterVisible(false)}
                variant="ghost"
                size="sm"
              >
                {t.userPanel.filters.closeFilters[lang]}
              </Button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:p-4 relative">
        {/* Filter Button visible on mobile */}
        <div className="md:hidden absolute top-2 left-2 z-10">
          <Button
            onClick={() => setIsFilterVisible(true)}
            variant="outline"
            size="sm"
            className="text-white relative"
          >
            <SlidersIcon className="w-5 h-5" />
            {/* Show badge only if filters are applied and filter panel is closed */}
            {countActiveFilters() > 0 && !isFilterVisible && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border border-white" />
            )}
          </Button>
        </div>

        {/* Pass filters to the ItemsList via Outlet context */}
        <Outlet context={filters} />
      </div>
    </div>
  );
};

export default UserPanel;
