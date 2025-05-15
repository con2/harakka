import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllTags, selectAllTags } from "@/store/slices/tagSlice";
import { selectAllItems } from "@/store/slices/itemsSlice";
import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, MapPin, SlidersIcon } from "lucide-react";
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

  useEffect(() => {
    dispatch(fetchAllTags());
    dispatch(fetchAllLocations());
  }, [dispatch]);

  // Unique item_type.fi values from items
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
        .map((type) => type.charAt(0).toUpperCase() + type.slice(1))
        .sort((a, b) => a.localeCompare(b)),
    ),
  );
  const [showAllItemTypes, setShowAllItemTypes] = useState(false);
  const visibleItemTypes = showAllItemTypes
    ? uniqueItemTypes
    : uniqueItemTypes.slice(0, 7);

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

  // Handle filter change (you can modify this based on your filter UI)
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
    )
      count++;
    if (filters.averageRating.length > 0) count++;
    if (filters.itemTypes.length > 0) count++;
    if (filters.tagIds.length > 0) count++;
    if (filters.locationIds.length > 0) count++;
    return count;
  };

  // Mobile filter toggle visibility state
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  return (
    <div className="flex min-h-screen w-full overflow-y-auto md:px-10">
      {/* Sidebar: Filters Panel */}
      {/* TODO: fix mobile view filter toggle */}
      <aside
        className={`${
          isFilterVisible ? "block" : "hidden"
        } md:flex flex-col w-full md:w-76 p-4 bg-white md:pb-10 fixed inset-0 z-20 md:static transition-all duration-300 ease-in-out`}
        style={{ maxHeight: "calc(100vh - 50px)" }} // to make the sidebar scroll
      >
        {/* Filter Section */}
        <nav className="flex flex-col space-y-4 border-1 p-4 rounded-md">
          <div>
            <div className="flex items-center justify-between my-2">
              <h3 className="text-secondary font-bold mb-0">Filters</h3>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">
                  {countActiveFilters()} {t.userPanel.filters.active[lang]}
                </div>
                <SlidersIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Clear filters button */}
            {countActiveFilters() > 0 && (
              <div className="flex justify-start">
                <Button
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
            <Separator className="my-4" />

            {/* Categories / item_types*/}
            <div className="flex flex-col flex-wrap gap-3 text-sm my-6">
              {visibleItemTypes.map((typeName) => {
                const isSelected = filters.itemTypes?.includes(typeName);
                return (
                  <span
                    key={typeName}
                    className={`cursor-pointer justify-between flex items-center ${
                      isSelected
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
                    {typeName} <ChevronRight className="w-4 h-4 inline" />
                  </span>
                );
              })}
              {uniqueItemTypes.length > 5 && (
                <Button
                  variant="ghost"
                  className="text-left text-sm text-secondary mt-2"
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
              <label className="text-primary font-medium block mb-4">
                {t.userPanel.locations.title[lang]}
              </label>
              <div className="flex flex-col gap-2">
                {locations.map((location) => {
                  const isSelected = filters.locationIds?.includes(location.id);
                  return (
                    <label
                      key={location.id}
                      className={`flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? "text-secondary font-medium"
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
                        <MapPin className="h-3.5 w-3.5" />
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
              <label className="text-primary block mb-6">
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
                      className={`px-4 border-secondary border-1 rounded-2xl ${
                        (filters.tagIds || []).includes(tag.id)
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
            <Separator className="my-4" />

            {/* color filter */}
            <div className="my-4">
              <label className="text-primary font-medium block mb-6">
                {t.userPanel.colors.title[lang]}
              </label>
              <div className="mt-2 mb-6 text-secondary text-center">
                <div className="flex flex-row flex-wrap gap-3">
                  <Button
                    className="bg-red-500 w-8 h-8 rounded-full border-1 border-primary"
                    onClick={() => handleFilterChange("color", "red")}
                  ></Button>
                  <Button
                    className="bg-green-500 w-8 h-8 rounded-full border-1 border-primary"
                    onClick={() => handleFilterChange("color", "green")}
                  ></Button>
                  <Button
                    className="bg-blue-500 w-8 h-8 rounded-full border-1 border-primary"
                    onClick={() => handleFilterChange("color", "blue")}
                  ></Button>
                  <Button
                    className="bg-yellow-500 w-8 h-8 rounded-full border-1 border-primary"
                    onClick={() => handleFilterChange("color", "yellow")}
                  ></Button>
                  <Button
                    className="bg-purple-500 w-8 h-8 rounded-full border-1 border-primary"
                    onClick={() => handleFilterChange("color", "purple")}
                  ></Button>
                  <Button
                    className="bg-black w-8 h-8 rounded-full border-1 border-primary"
                    onClick={() => handleFilterChange("color", "black")}
                  ></Button>
                  <Button
                    className="bg-white-500 w-8 h-8 rounded-full border-1 border-primary"
                    onClick={() => handleFilterChange("color", "white")}
                  ></Button>
                </div>
              </div>
            </div>

            {countActiveFilters() > 0 && (
              <div>
                <Separator className="my-4" />
                <div className="flex justify-center mt-4">
                  <Button
                    className="text-xs px-1 py-0.5 bg-white text-highlight2 border-1 border-highlight2 hover:bg-highlight2 hover:text-white"
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
            <div className="md:hidden">
              <Button
                onClick={() => setIsFilterVisible(false)}
                variant="outline"
                size="sm"
                className="text-white"
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
        <div className="md:hidden absolute top-4 left-4 z-10">
          <Button
            onClick={() => setIsFilterVisible(true)}
            variant="outline"
            size="sm"
            className="text-white"
          >
            <SlidersIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Pass filters to the ItemsList via Outlet context */}
        <Outlet context={filters} />
      </div>
    </div>
  );
};

export default UserPanel;
