import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setTimeframe, clearTimeframe } from "../store/slices/timeframeSlice";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import DatePickerButton from "./ui/DatePickerButton";
import { Button } from "./ui/button";
import { selectCartItems } from "../store/slices/cartSlice";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Info } from "lucide-react";

const TimeframeSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const { startDate: startDateStr, endDate: endDateStr } = useAppSelector(
    (state) => state.timeframe,
  );
  const startDate = startDateStr ? new Date(startDateStr) : undefined;
  const endDate = endDateStr ? new Date(endDateStr) : undefined;

  const cartItems = useAppSelector(selectCartItems);

  const handleDateChange = (type: "start" | "end", date: Date | undefined) => {
    if (cartItems.length > 0) {
      toast.warning(
        "Changing dates will clear your cart. Please complete or clear your current booking first.",
      );
      return;
    }

    if (type === "start") {
      dispatch(
        setTimeframe({
          startDate: date ? date.toISOString() : undefined,
          endDate: endDateStr,
        }),
      );
    } else {
      dispatch(
        setTimeframe({
          startDate: startDateStr,
          endDate: date ? date.toISOString() : undefined,
        }),
      );
    }
  };

  const handleClearTimeframe = () => {
    if (cartItems.length > 0) {
      toast.warning(
        "Clearing dates will clear your cart. Please complete or clear your current booking first.",
      );
      return;
    }
    dispatch(clearTimeframe());
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 bg-slate-50 p-6 rounded-lg mb-6 flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-3 flex items-center justify-center">
        Select Booking Timeframe
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer text-muted-foreground">
              <Info className="ml-1 text-secondary w-4 h-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" align="start" className="max-w-sm break-words">
            Select a timeframe to see available items. All items in your cart will use this booking period.
          </TooltipContent>
        </Tooltip>
      </h2>
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full justify-center">
        {/* Start Date Picker */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col items-start">
            <span className="text-xs font-small mb-1 text-muted-foreground">Start Date</span>
            <Popover>
              <PopoverTrigger asChild>
                <DatePickerButton
                  value={startDate ? format(startDate, "PPP") : null}
                  placeholder="Select start date"
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto max-w-xs p-0 break-words">
                <Calendar
                  mode="single"
                  selected={startDate || undefined}
                  onSelect={(date) => handleDateChange("start", date)}
                  initialFocus
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* End Date Picker */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col items-start">
            <span className="text-xs font-small mb-1 text-muted-foreground">End Date</span>
            <Popover>
              <PopoverTrigger asChild>
                <DatePickerButton
                  value={endDate ? format(endDate, "PPP") : null}
                  placeholder="Select end date"
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto max-w-xs p-0 break-words">
                <Calendar
                  mode="single"
                  selected={endDate || undefined}
                  onSelect={(date) => handleDateChange("end", date)}
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
        </div>

        {/* Clear Button */}
        {/* {(startDate || endDate) && (
          <Button
            size="sm"
            onClick={handleClearTimeframe}
            className="mt-5 bg-white text-highlight2 border-highlight2 hover:bg-highlight2 hover:text-white"
          >
            Clear Dates
          </Button>
        )} */}
        <div className="flex w-full lg:w-auto items-center justify-center">
          <Button
            size="sm"
            onClick={handleClearTimeframe}
            className={`mt-6 bg-white text-highlight2 border border-highlight2 hover:bg-highlight2 hover:text-white ${
              startDate || endDate ? "visible" : "invisible"
            }`}
          >
            Clear Dates
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TimeframeSelector;
