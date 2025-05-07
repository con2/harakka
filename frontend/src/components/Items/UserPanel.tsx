import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllTags, selectAllTags } from "@/store/slices/tagSlice";
import { selectAllItems } from "@/store/slices/itemsSlice";
import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, SlidersIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Star } from "lucide-react";

const UserPanel = () => {
  const tags = useAppSelector(selectAllTags);
  const items = useAppSelector(selectAllItems);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAllTags());
  }, [dispatch]);

  // Unique item_type.fi values from items
  const uniqueItemTypes = Array.from(
    new Set(
      items
        .map((item) => item.translations?.fi?.item_type)
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
    priceRange: [number, number];
    isActive: boolean;
    averageRating: number[];
    itemsNumberAvailable: [number, number];
    itemTypes: string[];
    tagIds: string[];
  }>({
    priceRange: [0, 100], // edit price range filter [min, max]
    isActive: true, // Is item active or not filter
    averageRating: [],
    itemsNumberAvailable: [0, 100], // add a range for number of items
    itemTypes: [],
    tagIds: [],
  });

  // Handle filter change (you can modify this based on your filter UI)
  const handleFilterChange = (filterKey: string, value: any) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: value,
    }));
  };

  const countActiveFilters = () => {
    let count = 0;
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 100) count++;
    if (filters.itemsNumberAvailable[0] !== 0 || filters.itemsNumberAvailable[1] !== 100) count++;
    if (filters.averageRating.length > 0) count++;
    if (filters.itemTypes.length > 0) count++;
    if (filters.tagIds.length > 0) count++;
    return count;
  };  

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-76 p-4 border-r bg-white shadow-md overflow-y-auto max-h-screen pb-10">
        <nav className="flex flex-col space-y-4 border-1 p-4 rounded-md">
          {/* Filter Section */}
          <div>
            <div className="flex items-center justify-between my-2">
              <h3 className="text-secondary font-bold mb-0">Filters</h3>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">
                  {countActiveFilters()} active
                </div>
                <SlidersIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>
            {countActiveFilters() > 0 && (
              <div className="flex justify-end">
                <Button
                  size={"sm"}
                  className="text-xs px-1 bg-white text-highlight2 border-highlight2 hover:bg-highlight2 hover:text-white"
                  onClick={() =>
                    setFilters({
                      priceRange: [0, 100],
                      isActive: true,
                      averageRating: [],
                      itemsNumberAvailable: [0, 100],
                      itemTypes: [],
                      tagIds: [],
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
                  {showAllItemTypes ? "Show less" : "See all"}
                </Button>
              )}
            </div>

            <Separator className="my-4" />

            {/* Price filter */}
            <div className="my-4">
              <label className="text-secondary font-bold block mb-6">
                Price
              </label>
              <Slider
                min={0}
                max={100}
                step={1}
                value={filters.priceRange}
                onValueChange={([min, max]) =>
                  handleFilterChange("priceRange", [min, max])
                }
                className="w-full"
              />
              <div className="mt-2 text-secondary text-center">
                €{filters.priceRange[0]} - €{filters.priceRange[1]}
              </div>
            </div>
            <Separator className="my-4" />

            {/* Rating filter */}
            <div className="my-4">
              <label className="text-secondary font-bold block mb-4">
                Average Rating
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

            {/* availability filter */}
            <div className="my-4">
              <label className="text-secondary font-bold block mb-6">
                Items Available
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
                {filters.itemsNumberAvailable[1]} items
              </div>
            </div>
            <Separator className="my-4" />

            {/* color filter */}
            <div className="my-4">
              <label className="text-secondary font-bold block mb-6">
                Colors
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
                    onClick={() => handleFilterChange("color", "blue")}
                  ></Button>
                  <Button
                    className="bg-purple-500 w-8 h-8 rounded-full border-1 border-primary"
                    onClick={() => handleFilterChange("color", "blue")}
                  ></Button>
                  <Button
                    className="bg-black w-8 h-8 rounded-full border-1 border-primary"
                    onClick={() => handleFilterChange("color", "blue")}
                  ></Button>
                  <Button
                    className="bg-white-500 w-8 h-8 rounded-full border-1 border-primary"
                    onClick={() => handleFilterChange("color", "blue")}
                  ></Button>
                </div>
              </div>
            </div>
            <Separator className="my-4" />

            {/* Tags */}
            <div className="my-4">
              <label className="text-secondary font-bold block mb-6">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const tagName =
                    tag.translations?.fi?.name ||
                    tag.translations?.en?.name ||
                    "Unnamed";
                  return (
                    <Button
                      key={tag.id}
                      className={`px-6 border-secondary border-1 rounded-2xl ${
                        (filters.tagIds || []).includes(tag.id)
                          ? "bg-secondary text-white"
                          : "bg-white text-secondary hover:bg-secondary hover:text-white"
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
            {countActiveFilters() > 0 && (
              <div>
                <Separator className="my-4" />
                <div className="flex justify-center mt-4">
                  <Button
                    className="text-xs px-1 py-0.5 bg-white text-highlight2 border-1 border-highlight2 hover:bg-highlight2 hover:text-white"
                    onClick={() =>
                      setFilters({
                        priceRange: [0, 100],
                        isActive: true,
                        averageRating: [],
                        itemsNumberAvailable: [0, 100],
                        itemTypes: [],
                        tagIds: [],
                      })
                    }
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto max-h-screen">
        {/* Pass filters to the ItemsList via Outlet context */}
        <Outlet context={filters} />
      </div>
    </div>
  );
};

// const SidebarLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
//   <Link to={to} className="flex items-center gap-3 p-2 rounded hover:bg-gray-200">
//     <span className="w-5 h-5">{icon}</span>
//     {label}
//   </Link>
// );

export default UserPanel;
