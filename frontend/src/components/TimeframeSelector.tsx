import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setTimeframe, clearTimeframe } from '../store/slices/timeframeSlice';
import { format } from 'date-fns';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import DatePickerButton from './ui/DatePickerButton';
import { Button } from './ui/button';
import { selectCartItems } from '../store/slices/cartSlice';
import { toast } from 'sonner';

const TimeframeSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const { startDate, endDate } = useAppSelector((state) => state.timeframe);
  const cartItems = useAppSelector(selectCartItems);

  const handleDateChange = (type: 'start' | 'end', date: Date | undefined) => {
    if (cartItems.length > 0) {
      toast.warning(
        'Changing dates will clear your cart. Please complete or clear your current booking first.',
      );
      return;
    }

    if (type === 'start') {
      dispatch(setTimeframe({ startDate: date, endDate }));
    } else {
      dispatch(setTimeframe({ startDate, endDate: date }));
    }
  };

  const handleClearTimeframe = () => {
    if (cartItems.length > 0) {
      toast.warning(
        'Clearing dates will clear your cart. Please complete or clear your current booking first.',
      );
      return;
    }
    dispatch(clearTimeframe());
  };

  return (
    <div className="bg-slate-50 p-4 rounded-lg mb-6">
      <h2 className="text-lg font-semibold mb-3">Select Booking Timeframe</h2>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Start Date Picker */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Start Date:</span>
          <Popover>
            <PopoverTrigger asChild>
              <DatePickerButton
                value={startDate ? format(startDate, 'PPP') : null}
                placeholder="Select start date"
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate || undefined}
                onSelect={(date) => handleDateChange('start', date)}
                initialFocus
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date Picker */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">End Date:</span>
          <Popover>
            <PopoverTrigger asChild>
              <DatePickerButton
                value={endDate ? format(endDate, 'PPP') : null}
                placeholder="Select end date"
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate || undefined}
                onSelect={(date) => handleDateChange('end', date)}
                initialFocus
                disabled={(date) => {
                  // Always return a boolean value:
                  const isBeforeToday =
                    date < new Date(new Date().setHours(0, 0, 0, 0));
                  const isBeforeStartDate = startDate
                    ? date < startDate
                    : false;
                  return isBeforeToday || isBeforeStartDate;
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Clear Button */}
        {(startDate || endDate) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearTimeframe}
            className="ml-auto"
          >
            Clear Dates
          </Button>
        )}
      </div>

      {/* Instructions */}
      <p className="text-sm text-muted-foreground mt-2">
        Select a timeframe to see available items. All items in your cart will
        use this booking period.
      </p>
    </div>
  );
};

export default TimeframeSelector;
