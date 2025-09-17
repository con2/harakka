import React, { useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setTimeframe, clearTimeframe } from "../store/slices/timeframeSlice";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import DatePickerButton from "./ui/DatePickerButton";
import { Button } from "./ui/button";
import { selectCartItems, clearCart } from "../store/slices/cartSlice";
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

  const [confirmClearDates, setConfirmClearDates] = React.useState(false);

  const handleDateChange = (type: "start" | "end", date: Date | undefined) => {
    if (cartItems.length > 0) {
      toast.warning(t.timeframeSelector.toast.warning[lang]);
      return;
    }

    if (type === "start") {
      const newStartDate = date ? date : undefined;
      const newEndDate = endDateStr ? new Date(endDateStr) : undefined;

      if (newStartDate && newEndDate) {
        const diffTime = newEndDate.getTime() - newStartDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // These only fire when the user changes start date after both dates are set
        if (diffDays < 1) {
          toast.error(t.timeframeSelector.toast.errorSameDay[lang]);
          return;
        }
        if (diffDays > 42) {
          toast.error(t.timeframeSelector.toast.errorTooLong[lang]);
          return;
        }
      }

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
      // Guard: end date must be strictly after start date
      if (date && startDateStr) {
        const start = new Date(startDateStr);
        const startDay = new Date(start.setHours(0, 0, 0, 0)).getTime();
        const endDay = new Date(date.setHours(0, 0, 0, 0)).getTime();
        if (endDay <= startDay) {
          toast.error(t.timeframeSelector.toast.errorEndBeforeStart[lang]);
          return;
        }
      }

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
    // If there are items in the cart, require a confirming second click
    if (cartItems.length > 0) {
      if (!confirmClearDates) {
        setConfirmClearDates(true);
        toast.warning(t.timeframeSelector.toast.warning[lang], {
          id: "timeframe-toast",
        });
        // auto-reset the confirm flag after a short window to avoid accidental clears later
        window.setTimeout(() => setConfirmClearDates(false), 4000);
        return;
      }
      // Second click within the window: clear cart and timeframe
      dispatch(clearCart());
      dispatch(clearTimeframe());
      setConfirmClearDates(false);
      toast.success(t.cart.toast.cartCleared[lang], { id: "timeframe-toast" });
      return;
    }

    // No items in cart – just clear dates
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
                    const todayMidnight = new Date(
                      new Date().setHours(0, 0, 0, 0),
                    );
                    const isBeforeToday = date < todayMidnight;

                    const isBeforeOrSameAsStartDate = startDate
                      ? date <= new Date(startDate.setHours(0, 0, 0, 0))
                      : false;

                    // prevent dates more than 42 days from start
                    const isTooFarFromStart = startDate
                      ? date.getTime() >
                        new Date(startDate.getTime() + 42 * 86400000).getTime()
                      : false;

                    return (
                      isBeforeToday ||
                      isBeforeOrSameAsStartDate ||
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
