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
import {
  fetchAllOrganizations,
  selectOrganizations,
} from "@/store/slices/organizationSlice";
import type { OrganizationDetails } from "@/types/organization";

const UserPanel = () => {
  const tags = useAppSelector(selectAllTags);
  const items = useAppSelector(selectAllItems);
  const locations = useAppSelector(selectAllLocations);
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const filterRef = useRef<HTMLDivElement>(null); // Ref for the filter panel position
  const organizations = useAppSelector(selectOrganizations);

  useEffect(() => {
    if (tags.length < 1) void dispatch(fetchAllTags({ page: 1, limit: 10 }));
    if (locations.length < 1)
      void dispatch(fetchAllLocations({ page: 1, limit: 10 }));
    if (organizations.length < 1)
      void dispatch(fetchAllOrganizations({ page: 1, limit: 50 }));
    // eslint-disable-next-line
  }, [dispatch]);

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
  // Shared expand/collapse state per filter list (max 5 visible by default)
  type ExpandableSection = "itemTypes" | "organizations" | "locations" | "tags";
  const MAX_VISIBLE = 5;
  const [expanded, setExpanded] = useState<Record<ExpandableSection, boolean>>({
    itemTypes: false,
    organizations: false,
    locations: false,
    tags: false,
  });
  const toggleExpanded = (key: ExpandableSection) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  const getVisible = <T,>(arr: T[], key: ExpandableSection) =>
    expanded[key] ? arr : arr.slice(0, MAX_VISIBLE);

  const visibleItemTypes = getVisible(uniqueItemTypes, "itemTypes");
  const visibleOrganizations = getVisible(organizations, "organizations");
  const visibleLocations = getVisible(locations, "locations");
  const visibleTags = getVisible(tags, "tags");

  // filter states
  const [filters, setFilters] = useState<{
    isActive: boolean;
    averageRating: number[];
    itemsNumberAvailable: [number, number];
    itemTypes: string[];
    tagIds: string[];
    locationIds: string[];
    orgIds?: string[];
  }>({
    isActive: true, // Is item active or not filter
    averageRating: [],
    itemsNumberAvailable: [0, 100], // add a range for number of items
    itemTypes: [],
    tagIds: [],
    locationIds: [],
    orgIds: [],
  });

  // --- slider thumb state so the handle moves smoothly without refetching ---
  const [tempAvailableRange, setTempAvailableRange] = useState<
    [number, number]
  >(filters.itemsNumberAvailable);

  // keep local thumb state in sync when filters reset externally
  useEffect(() => {
    setTempAvailableRange(filters.itemsNumberAvailable);
  }, [filters.itemsNumberAvailable]);

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
    count += filters.orgIds?.length ?? 0;
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
        className={`${
          isFilterVisible ? "block" : "hidden"
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
              <h3 className="text-secondary font-bold mb-0">
                {t.userPanel.filters.title[lang]}
              </h3>
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
                          orgIds: [],
                        })
                      }
                    >
                      {t.userPanel.filters.clearFilters[lang]}
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
                  aria-label={t.userPanel.filters.closeFilters[lang]}
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
                    className={`cursor-pointer text-sm justify-between flex items-center ${
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
                    {typeName.charAt(0).toUpperCase() + typeName.slice(1)}{" "}
                    <ChevronRight className="w-4 h-4 inline" />
                  </span>
                );
              })}
              {uniqueItemTypes.length > MAX_VISIBLE && (
                <Button
                  variant="ghost"
                  className="text-left text-sm text-secondary"
                  onClick={() => toggleExpanded("itemTypes")}
                >
                  {expanded.itemTypes
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
                max={100}
                value={tempAvailableRange}
                // update thumb position instantly
                onValueChange={([min, max]) =>
                  setTempAvailableRange([min, max])
                }
                // commit filter (and trigger API refetch) only on release
                onValueCommit={([min, max]) => {
                  setTempAvailableRange([min, max]);
                  handleFilterChange("itemsNumberAvailable", [min, max]);
                }}
                className="w-full"
              />
              <div className="mt-2 text-secondary text-center">
                {tempAvailableRange[0]} - {tempAvailableRange[1]}{" "}
                {t.userPanel.availability.items[lang]}
              </div>
            </div>
            <Separator className="my-4" />

            {/* Locations filter section */}
            <div className="my-4 flex flex-col">
              <label className="text-primary font-medium block mb-2">
                {t.userPanel.locations.title[lang]}
              </label>
              <div className="flex flex-col gap-2">
                {visibleLocations.map((location) => {
                  const isSelected = filters.locationIds?.includes(location.id);
                  return (
                    <label
                      key={location.id}
                      className={`flex items-center gap-2 text-sm cursor-pointer ${
                        isSelected
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
              {locations.length > MAX_VISIBLE && (
                <Button
                  variant="ghost"
                  className="text-left text-sm text-secondary"
                  onClick={() => toggleExpanded("locations")}
                >
                  {expanded.locations
                    ? t.userPanel.categories.showLess[lang]
                    : t.userPanel.categories.seeAll[lang]}
                </Button>
              )}
            </div>

            <Separator className="my-4" />
            {/* Tags */}
            <div className="my-4 flex flex-col">
              <label className="text-primary block mb-4">
                {" "}
                {t.userPanel.tags.title[lang]}
              </label>
              <div className="flex flex-wrap gap-2">
                {visibleTags.map((tag) => {
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
              {tags.length > MAX_VISIBLE && (
                <Button
                  variant="ghost"
                  className="text-left text-sm text-secondary mt-2"
                  onClick={() => toggleExpanded("tags")}
                >
                  {expanded.tags
                    ? t.userPanel.categories.showLess[lang]
                    : t.userPanel.categories.seeAll[lang]}
                </Button>
              )}
            </div>
            <Separator className="my-4" />

            {/* Organizations */}
            {organizations && organizations.length > 0 && (
              <div className="flex flex-col gap-2 mb-4">
                <label className="text-primary text-md block mb-0">
                  {t.userPanel.organizations.title[lang]}
                </label>
                <div className="flex flex-col gap-2">
                  {visibleOrganizations.map((org: OrganizationDetails) => {
                    const selected = filters.orgIds || [];
                    const isSelected = selected.includes(org.id);
                    return (
                      <label
                        key={org.id}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="accent-secondary"
                          checked={isSelected}
                          onChange={(e) => {
                            const next = new Set(selected);
                            if (e.target.checked) next.add(org.id);
                            else next.delete(org.id);
                            handleFilterChange(
                              "orgIds",
                              Array.from(next) as unknown as FilterValue,
                            );
                          }}
                        />
                        <span
                          className={
                            isSelected
                              ? "text-secondary font-medium"
                              : "text-slate-600"
                          }
                        >
                          {org.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {organizations.length > MAX_VISIBLE && (
                  <Button
                    variant="ghost"
                    className="text-left text-sm text-secondary"
                    onClick={() => toggleExpanded("organizations")}
                  >
                    {expanded.organizations
                      ? t.userPanel.categories.showLess[lang]
                      : t.userPanel.categories.seeAll[lang]}
                  </Button>
                )}
                <Separator className="my-2" />
              </div>
            )}

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
                        orgIds: [],
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
