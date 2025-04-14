import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAllItems,
  selectAllItems,
  selectItemsLoading,
  selectItemsError,
} from '../../store/slices/itemsSlice';
import ItemCard from './ItemCard';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import ItemsLoader from '../../context/ItemsLoader';
import { useAuth } from '../../context/AuthContext';
import { useOutletContext } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';

// Access the filters via useOutletContext
const ItemsList: React.FC = () => {
  const filters = useOutletContext<any>(); // Get filters from context

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux state selectors
  const items = useAppSelector(selectAllItems);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);

  // Timeframe filter states
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [useTimeFilter, setUseTimeFilter] = useState(false);

  // Auth state from AuthContext
  const { user, authLoading } = useAuth();

  // Check if the user is an admin
  const isAdmin = user?.user_metadata?.role === 'admin';

  // Fetch all items when the component mounts
  useEffect(() => {
    dispatch(fetchAllItems());
  }, [dispatch]);

  // Apply filters to the items
  const filteredItems = items.filter((item) => {
    // Filter by price range
    const isWithinPriceRange =
      item.price >= filters.priceRange[0] &&
      item.price <= filters.priceRange[1];
    // Filter by active status
    const isActive = filters.isActive ? item.is_active : true;

    // Filter by timeframe availability (TODO: replace placeholder - needs backend implementation)
    const timeframeMatch =
      !useTimeFilter || (startDate && endDate) ? true : true;

    return isWithinPriceRange && isActive && timeframeMatch;
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
    <div className="container">
      {/* Show the create button only for admins */}
      {isAdmin && (
        <Button
          className="mb-4"
          onClick={() => navigate('/admin/items/create')}
        >
          Create New Item
        </Button>
      )}

      {/* Timeframe filter section */}
      <div className="border-t pt-4 mt-2">
        <div className="flex items-center mb-2">
          <label className="flex items-center text-sm font-medium">
            <input
              type="checkbox"
              checked={useTimeFilter}
              onChange={() => setUseTimeFilter(!useTimeFilter)}
              className="mr-2 h-4 w-4 rounded"
            />
            Filter by availability timeframe
          </label>
        </div>

        {useTimeFilter && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date Picker */}
            <div>
              <span className="text-sm font-semibold">Start Date: </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[280px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, 'PPP')
                    ) : (
                      <span>Pick a start date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate || undefined}
                    onSelect={(date) => setStartDate(date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date Picker */}
            <div>
              <span className="text-sm font-semibold">End Date: </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[280px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, 'PPP')
                    ) : (
                      <span>Pick an end date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  {/* Calendar content remains the same */}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </div>

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
