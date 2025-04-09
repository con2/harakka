import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, SlidersIcon } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const UserPanel = () => {
  // Define the filter states
  const [filters, setFilters] = useState({
    priceRange: [0, 100],  // Example: Price range filter [min, max]
    isActive: true,        // Example: Is item active or not filter
  });

  // Handle filter change (you can modify this based on your filter UI)
  const handleFilterChange = (filterKey: string, value: any) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterKey]: value,
    }));
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-76 p-4 border-r bg-white shadow-md">
        <nav className="flex flex-col space-y-4 border-1 p-4 rounded-md">
          {/* Filter Section */}
          <div>
            <div className='flex items-center justify-between my-2'>
              <h3 className="text-secondary font-bold">Filters</h3>
              <SlidersIcon className="w-5 h-5 text-slate-500" />
            </div>
            <Separator className="my-4" />
            <div className="flex flex-col flex-wrap gap-3 text-md my-6">
              <span
                className="cursor-pointer text-slate-500 hover:text-secondary justify-between flex items-center"
                // onClick={() => handleCategoryClick('costumes')}
              >
                Costumes <ChevronRight className="w-4 h-4 inline" />
              </span>
              <span
                className="cursor-pointer text-slate-500 hover:text-secondary justify-between flex items-center"
                // onClick={() => handleCategoryClick('costumes')}
              >
                Accessories <ChevronRight className="w-4 h-4 inline" />
              </span>
              <span
                className="cursor-pointer text-slate-500 hover:text-secondary justify-between flex items-center"
                // onClick={() => handleCategoryClick('costumes')}
              >
                Furniture <ChevronRight className="w-4 h-4 inline" />
              </span>
              <span
                className="cursor-pointer text-slate-500 hover:text-secondary justify-between flex items-center"
                // onClick={() => handleCategoryClick('costumes')}
              >
                Gadgets <ChevronRight className="w-4 h-4 inline" />
              </span>
            </div>
            <Separator className="my-4" />
            <div className="my-4">
              <label className="text-secondary font-bold block mb-6">Price</label>
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
                ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </div>
            </div>
            <Separator className="my-4" />

            <div className="my-4">
              <label className="text-secondary font-bold block mb-6">Colors</label>
              <div className="mt-2 mb-6 text-secondary text-center">
                <div className="flex flex-row flex-wrap gap-3">
                  <Button className="bg-red-500 w-8 h-8 rounded-full border-1 border-primary" onClick={() => handleFilterChange("color", "red")}></Button>
                  <Button className="bg-green-500 w-8 h-8 rounded-full border-1 border-primary" onClick={() => handleFilterChange("color", "green")}></Button>
                  <Button className="bg-blue-500 w-8 h-8 rounded-full border-1 border-primary" onClick={() => handleFilterChange("color", "blue")}></Button>
                  <Button className="bg-yellow-500 w-8 h-8 rounded-full border-1 border-primary" onClick={() => handleFilterChange("color", "blue")}></Button>
                  <Button className="bg-purple-500 w-8 h-8 rounded-full border-1 border-primary" onClick={() => handleFilterChange("color", "blue")}></Button>
                  <Button className="bg-black w-8 h-8 rounded-full border-1 border-primary" onClick={() => handleFilterChange("color", "blue")}></Button>
                  <Button className="bg-white-500 w-8 h-8 rounded-full border-1 border-primary" onClick={() => handleFilterChange("color", "blue")}></Button>
                </div>
              </div>
            </div>
            <Separator className="my-4" />

            <div className="my-4">
              <label className="text-secondary font-bold block mb-6">Tags</label>
              <div className='flex flex-wrap gap-2'>
                <Button className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white">Wigs</Button>
                <Button className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white">War</Button>
                <Button className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white">Military</Button>
                <Button className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white">Lorem</Button>
                <Button className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white">Ipsum</Button>
              </div>
            </div>

          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        {/* Pass filters to the ItemsList via Outlet context */}
        <Outlet context={filters} />
      </div>
    </div>
  );
};

const SidebarLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <Link to={to} className="flex items-center gap-3 p-2 rounded hover:bg-gray-200">
    <span className="w-5 h-5">{icon}</span>
    {label}
  </Link>
);

export default UserPanel;
