import { forwardRef } from "react";
import { CalendarIcon } from "lucide-react";

// DatePickerButton component using forwardRef
const DatePickerButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string;
    placeholder: string;
  }
>(({ value, placeholder, ...props }, ref) => (
  <button
    ref={ref}
    {...props} // Forwards data-cy and any other props
    value={value ?? ""}
    className="flex items-center w-[280px] justify-start rounded-md border border-input bg-background px-3 py-2 text-sm text-left font-normal shadow-sm hover:bg-accent hover:text-accent-foreground"
  >
    <CalendarIcon className="mr-2 h-4 w-4" />
    {value ? value : <span>{placeholder}</span>}
  </button>
));

DatePickerButton.displayName = "DatePickerButton";

export default DatePickerButton;
