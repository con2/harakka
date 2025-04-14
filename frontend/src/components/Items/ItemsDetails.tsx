import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  getItemById,
  selectSelectedItem,
  selectItemsLoading,
  selectItemsError,
} from '../../store/slices/itemsSlice';
import { Button } from '../../components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { Calendar } from '../../components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { format } from 'date-fns'; // For date formatting
import { CalendarIcon } from 'lucide-react';
import Rating from '../ui/rating';

const ItemsDetails: React.FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux selectors
  const item = useAppSelector(selectSelectedItem);
  const loading = useAppSelector(selectItemsLoading);
  const error = useAppSelector(selectItemsError);

  // State for selected tab and date range
  const [selectedTab, setSelectedTab] = useState('description');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  useEffect(() => {
    if (id) {
      dispatch(getItemById(id));
    }
  }, [id, dispatch]);

  // Loading and error states
  if (loading) {
    return (
      <div>
        <LoaderCircle className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!item) {
    return <div>Item not found</div>;
  }

  return (
    <div className="container mx-auto p-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Item Images - Positioned Left */}
        <div className="md:w-1/3 w-full flex justify-center items-center border rounded-md">
          <p>Image comes here</p>
        </div>

        {/* Right Side - Item Details */}
        <div className="md:w-2/3 w-full space-y-4">
          <h2 className="text-2xl font-bold">
            {item.translations.fi.item_name}
          </h2>
          <p className="text-lg text-gray-500">
            {item.translations.fi.item_description}
          </p>

          {/* Booking Section */}
          <div className="flex flex-col space-y-2">
            {/* Start Date Picker */}
            <div>
              <span className="text-sm font-semibold">Start Date: </span>
              <Popover>
                <PopoverTrigger>
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
                <PopoverTrigger>
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
                  <Calendar
                    mode="single"
                    selected={endDate || undefined}
                    onSelect={(date) => setEndDate(date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Rating Component */}
          <div className="flex items-center">
            <span className="text-sm text-gray-600">Average Rating: </span>
            <div className="ml-2">
              <Rating value={item.average_rating ?? 0} readOnly />
            </div>
          </div>

          {/* Back Button */}
          <Button
            onClick={() => navigate(-1)}
            className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
          >
            Back
          </Button>
        </div>
      </div>

      {/* Tabs and Tab Contents - Positioned Below */}
      <div className="mt-10 w-full">
        <div className="flex gap-4">
          <Button
            onClick={() => setSelectedTab('description')}
            className="bg-transparent text-secondary"
          >
            Description
          </Button>
          <Button
            onClick={() => setSelectedTab('reviews')}
            className="bg-transparent text-secondary"
          >
            Reviews
          </Button>
        </div>

        {/* Tab Content */}
        <div className="mt-4 bg-slate-50 p-4 rounded-lg">
          {selectedTab === 'description' && (
            <p>{item.translations.fi.item_description}</p>
          )}
          {selectedTab === 'reviews' && <p>Reviews will be displayed here</p>}
        </div>
      </div>
    </div>
  );
};

export default ItemsDetails;
