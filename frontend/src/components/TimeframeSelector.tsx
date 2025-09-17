import React, { useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setTimeframe, clearTimeframe } from "../store/slices/timeframeSlice";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import DatePickerButton from "./ui/DatePickerButton";
import { Button } from "./ui/button";
import { selectCartItems } from "../store/slices/cartSlice";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Info } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useFormattedDate } from "@/hooks/useFormattedDate";

const TimeframeSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const { startDate: startDateStr, endDate: endDateStr } = useAppSelector(
    (state) => state.timeframe,
  );
  const startDate = startDateStr ? new Date(startDateStr) : undefined;
  const endDate = endDateStr ? new Date(endDateStr) : undefined;
  const endDatePopoverRef = useRef<HTMLButtonElement>(null);

  const cartItems = useAppSelector(selectCartItems);

  // Translation
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();

  const handleDateChange = (type: "start" | "end", date: Date | undefined) => {
    if (cartItems.length > 0) {
      toast.warning(t.timeframeSelector.toast.warning[lang]);
      return;
    }

    if (type === "start") {
      dispatch(
        setTimeframe({
          startDate: date ? date.toISOString() : undefined,
          endDate: endDateStr,
        }),
      );
      // auto open the end date popover after selecting a start date
      setTimeout(() => {
        endDatePopoverRef.current?.click(); // trigger popover
      }, 150);
    } else {
      dispatch(
        setTimeframe({
          startDate: startDateStr,
          endDate: date ? date.toISOString() : undefined,
        }),
      );
      // auto-close after selecting end date
      setTimeout(() => {
        endDatePopoverRef.current?.click();
      }, 100);
    }
  };

  const handleClearTimeframe = () => {
    if (cartItems.length > 0) {
      toast.warning(t.timeframeSelector.toast.warning[lang]);
      return;
    }
    dispatch(clearTimeframe());
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 bg-slate-50 p-6 rounded-lg mb-6 flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-3 flex items-center justify-center">
        {t.timeframeSelector.title[lang]}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer text-muted-foreground">
              <Info className="ml-1 text-secondary w-4 h-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="start"
            className="max-w-sm break-words"
          >
            {t.timeframeSelector.tooltip[lang]}
          </TooltipContent>
        </Tooltip>
      </h2>
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full justify-center">
        {/* Start Date Picker */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col items-start">
            <span className="text-xs font-small mb-1 text-muted-foreground">
              {t.timeframeSelector.startDate.label[lang]}
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <DatePickerButton
                  data-cy="timeframe-start-btn"
                  value={startDate ? formatDate(startDate, "d MMM yyyy") : ""}
                  placeholder={t.timeframeSelector.startDate.placeholder[lang]}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto max-w-xs p-0 break-words">
                <Calendar
                  weekStartsOn={1}
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
            <span className="text-xs font-small mb-1 text-muted-foreground">
              {t.timeframeSelector.endDate.label[lang]}
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <DatePickerButton
                  ref={endDatePopoverRef}
                  data-cy="timeframe-end-btn"
                  value={endDate ? formatDate(endDate, "d MMM yyyy") : ""}
                  placeholder={t.timeframeSelector.endDate.placeholder[lang]}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto max-w-xs p-0 break-words">
                <Calendar
                  weekStartsOn={1}
                  mode="single"
                  selected={endDate || undefined}
                  onSelect={(date) => handleDateChange("end", date)}
                  initialFocus
                  defaultMonth={startDate} // Problem: Currently does not let user change month
                  disabled={(date) => {
                    // Always return a boolean value:
                    const isBeforeToday =
                      date < new Date(new Date().setHours(0, 0, 0, 0));
                    // Prevent same-day bookings - end date must be after start date
                    const isBeforeOrEqualStartDate = startDate
                      ? date <= startDate
                      : false;
                    // prevent dates more than 14 days from start
                    const isTooFarFromStart = startDate
                      ? date.getTime() >
                        new Date(startDate.getTime() + 35 * 86400000).getTime()
                      : false;

                    return (
                      isBeforeToday ||
                      isBeforeOrEqualStartDate ||
                      isTooFarFromStart
                    );
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex w-full lg:w-auto items-center justify-center">
          <Button
            size="sm"
            onClick={handleClearTimeframe}
            className={`mt-6 bg-white text-highlight2 border border-highlight2 hover:bg-highlight2 hover:text-white ${
              startDate || endDate ? "visible" : "invisible"
            }`}
          >
            {t.timeframeSelector.clearDates[lang]}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TimeframeSelector;
