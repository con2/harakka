import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import DatePickerButton from "./ui/DatePickerButton";
import { useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

type Props = {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (type: "start" | "end", date: Date | null) => void;
  minDate?: Date;
  maxRangeDays?: number;
};

export default function InlineTimeframePicker({
  startDate,
  endDate,
  onChange,
  minDate = new Date(),
  maxRangeDays = 14,
}: Props) {
  const { lang } = useLanguage();
  const endPopoverRef = useRef<HTMLButtonElement>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Start Date */}
      <div>
        <span className="text-sm font-medium block mb-1">
          {t.timeframeSelector.startDate.label[lang]}
        </span>
        <Popover open={startOpen} onOpenChange={setStartOpen}>
          <PopoverTrigger asChild>
            <DatePickerButton
              value={startDate ? startDate.toLocaleDateString() : ""}
              placeholder="Select start date"
            />
          </PopoverTrigger>
          <PopoverContent
            style={{ pointerEvents: "auto" }}
            className="z-[60] w-auto p-0"
          >
            <Calendar
              weekStartsOn={1}
              mode="single"
              selected={startDate ?? undefined}
              onSelect={(date) => {
                onChange("start", date ?? null);
                setStartOpen(false);
                setTimeout(() => {
                  setEndOpen(true);
                }, 150);
              }}
              disabled={(date) => date < minDate}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* End Date */}
      <div>
        <span className="text-sm font-medium block mb-1">
          {t.timeframeSelector.endDate.label[lang]}
        </span>
        <Popover open={endOpen} onOpenChange={setEndOpen}>
          <PopoverTrigger asChild>
            <DatePickerButton
              ref={endPopoverRef}
              value={endDate ? endDate.toLocaleDateString() : ""}
              placeholder="Select end date"
            />
          </PopoverTrigger>
          <PopoverContent
            style={{ pointerEvents: "auto" }}
            className="z-[60] w-auto p-0"
          >
            <Calendar
              weekStartsOn={1}
              mode="single"
              selected={endDate ?? undefined}
              onSelect={(date) => {
                onChange("end", date ?? null);
                setEndOpen(false);
              }}
              disabled={(date) => {
                const isBeforeMin = date < minDate;
                const isBeforeStart = startDate ? date < startDate : false;
                const isTooFar =
                  !!startDate &&
                  date.getTime() >
                    new Date(
                      startDate.getTime() + maxRangeDays * 86400000,
                    ).getTime();
                return isBeforeMin || isBeforeStart || isTooFar;
              }}
              month={startDate ?? undefined}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
