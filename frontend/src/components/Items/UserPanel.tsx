import { useState, useEffect, useRef, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchFilteredTags, selectAllTags } from "@/store/slices/tagSlice";
import { Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SlidersIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
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
import {
  fetchAllCategories,
  selectCategories,
} from "@/store/slices/categoriesSlice";
import { buildCategoryTree } from "@/store/utils/format";
import CategoryTree from "@/components/Items/CategoryTree";

interface LocationState {
  preSelectedFilters?: {
    categories?: string[];
    tagIds?: string[];
  };
}

const UserPanel = () => {
  const tags = useAppSelector(selectAllTags);
  const categories = useAppSelector(selectCategories);
  const locations = useAppSelector(selectAllLocations);
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const filterRef = useRef<HTMLDivElement>(null); // Ref for the filter panel position
  const organizations = useAppSelector(selectOrganizations);
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const MAX_VISIBLE = 5;

  useEffect(() => {
    void dispatch(fetchAllCategories({ page: 1, limit: 50 }));
    void dispatch(
      fetchFilteredTags({
        page: 1,
        limit: 10,
        sortOrder: "desc",
        sortBy: "popularity_rank",
      }),
    );
    if (locations.length < 1)
      void dispatch(fetchAllLocations({ page: 1, limit: 10 }));
    if (organizations.length < 1)
      void dispatch(fetchAllOrganizations({ page: 1, limit: 50 }));
    // eslint-disable-next-line
  }, []);

  const [expanded, setExpanded] = useState<Record<ExpandableSection, boolean>>({
    itemTypes: false,
    organizations: false,
    locations: false,
    tags: false,
    categories: false,
  });
  const getVisible = <T,>(arr: T[], key: ExpandableSection) =>
    expanded[key] ? arr : arr.slice(0, MAX_VISIBLE);

  // Filter out organizations that shouldn't have items
  const filterableOrganizations = useMemo(() => {
    const filtered = organizations.filter(
      (org: OrganizationDetails) =>
        org.name.toLowerCase() !== "high council" &&
        org.name.toLowerCase() !== "global" &&
        org.name.toLowerCase() !== "users united union (u3)",
    );

    return filtered;
  }, [organizations]);

  const visibleOrganizations = getVisible(
    filterableOrganizations,
    "organizations",
  );

  // Shared expand/collapse state per filter list (max 5 visible by default)
  type ExpandableSection =
    | "itemTypes"
    | "organizations"
    | "locations"
    | "tags"
    | "categories";

  const toggleExpanded = (key: ExpandableSection) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  // const visibleOrganizations = getVisible(organizations, "organizations");
  const visibleLocations = getVisible(locations, "locations");
  const visibleTags = getVisible(tags, "tags");
  const mappedCategories = buildCategoryTree(categories);
  const visibleCategories = getVisible(mappedCategories, "categories");

  // Expanded state for category nodes
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  // Build lookups to support path-exclusive selection (switch within a branch)
  const parentById = useMemo(() => {
    const m = new Map<string, string | null>();
    categories.forEach((c) => m.set(c.id, c.parent_id));
    return m;
  }, [categories]);
  const childrenById = useMemo(() => {
    const m = new Map<string, string[]>();
    categories.forEach((c) => {
      if (c.parent_id) {
        const arr = m.get(c.parent_id) || [];
        arr.push(c.id);
        m.set(c.parent_id, arr);
      }
    });
    return m;
  }, [categories]);
  const collectAncestors = (id: string) => {
    const res: string[] = [];
    let p = parentById.get(id) || null;
    const guard = new Set<string>();
    while (p && !guard.has(p)) {
      res.push(p);
      guard.add(p);
      p = parentById.get(p) || null;
    }
    return res;
  };
  const collectDescendants = (id: string) => {
    const res: string[] = [];
    const stack = [...(childrenById.get(id) || [])];
    while (stack.length) {
      const cur = stack.pop() as string;
      res.push(cur);
      const kids = childrenById.get(cur);
      if (kids && kids.length) stack.push(...kids);
    }
    return res;
  };

  // filter states
  const [filters, setFilters] = useState<{
    isActive: boolean;
    itemsNumberAvailable: [number, number];
    categories: string[];
    tagIds: string[];
    locationIds: string[];
    orgIds?: string[];
  }>(() => ({
    isActive: true, // Is item active or not filter
    itemsNumberAvailable: [0, 100], // add a range for number of items
    categories: locationState?.preSelectedFilters?.categories || [],
    tagIds: locationState?.preSelectedFilters?.tagIds || [],
    locationIds: [],
    orgIds: [],
  }));

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
    count += filters.categories.length;
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
    <div className="flex min-h-screen w-full overflow-y-auto justify-around pt-4 md:pt-0 gap-4">
      {/* Sidebar: Filters Panel */}
      <aside
        ref={filterRef}
        className={`${
          isFilterVisible ? "block" : "hidden"
        } md:flex pr-0 md:flex-col md:min-h-[calc(100vh-60px)] w-full md:w-76 p-4 bg-white md:pb-10 fixed inset-0 z-40 md:static transition-all duration-300 ease-in-out md:overflow-visible overflow-y-auto`}
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
                      className="text-xs px-1 bg-white text-highlight2 border-highlight2 hover:bg-highlight2 hover:text-white h-fit"
                      onClick={() =>
                        setFilters({
                          isActive: true,
                          itemsNumberAvailable: [0, 100],
                          categories: [],
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

            {/* Categories/ item_types*/}
            <div className="flex flex-col flex-wrap gap-3">
              <label className="text-primary text-md block mb-0">
                {" "}
                {t.userPanel.filters.categories[lang]}
              </label>
              <CategoryTree
                nodes={visibleCategories}
                lang={lang}
                selectedIds={new Set(filters.categories)}
                onToggleSelect={(id) => {
                  setFilters((prev) => {
                    const next = new Set(prev.categories);
                    if (next.has(id)) {
                      // toggle off
                      next.delete(id);
                    } else {
                      // Switch within branch: deselect ancestors and descendants of id
                      const toRemove = new Set<string>([
                        ...collectAncestors(id),
                        ...collectDescendants(id),
                      ]);
                      toRemove.forEach((x) => next.delete(x));
                      next.add(id);
                    }
                    return { ...prev, categories: Array.from(next) };
                  });
                }}
                expandedIds={expandedCategories}
                onToggleExpand={(id) => {
                  setExpandedCategories((prev) => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  });
                }}
              />
              {mappedCategories.length > MAX_VISIBLE && (
                <Button
                  variant="ghost"
                  className="text-left text-sm text-secondary"
                  onClick={() => toggleExpanded("categories")}
                >
                  {expanded.categories
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
            {organizations && filterableOrganizations.length > 0 && (
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
                {filterableOrganizations.length > MAX_VISIBLE && (
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
              </div>
            )}

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
                        itemsNumberAvailable: [0, 100],
                        categories: [],
                        tagIds: [],
                        locationIds: [],
                        orgIds: [],
                      })
                    }
                  >
                    {t.userPanel.filters.clearFilters[lang]}
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
      <div className="flex-1 md:p-4 relative  lg:max-w-[calc(100vw-25%)] px-4 md:px-0">
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
