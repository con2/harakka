import React from "react";
import { cn } from "@/lib/utils"; // DOESNT WORK PROPERLY!!!!!!
// Just added it to be able to use the app without installing that thing

interface SwitchProps
  extends Omit<React.HTMLAttributes<HTMLButtonElement>, "onChange"> {
  // we need to omit the onChange prop from the HTML attributes because it is defined with a different type (FormEventHandler) which conflicts with this custom boolean-based onChange?????
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onChange, disabled, className, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(false);

    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const toggle = () => {
      if (disabled) return;
      const newValue = !isChecked;
      if (!isControlled) setInternalChecked(newValue);
      onChange?.(newValue);
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        ref={ref}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          isChecked ? "bg-primary" : "bg-input",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
            isChecked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };

/* import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
 */
