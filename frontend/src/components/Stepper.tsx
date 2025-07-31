import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setStepper, stepperCurrentNum } from "@/store/slices/uiSlice";

export interface Step {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export interface StepperProps {
  steps: Step[];
  data: ReactNode[];
}

export function Stepper({ steps, data }: StepperProps) {
  const currentStep = useAppSelector(stepperCurrentNum);
  const dispatch = useAppDispatch();

  return (
    <div className="space-y-6">
      {/* Step Buttons */}
      <div className="flex items-center space-x-4">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          return (
            <div key={idx} className="flex gap-4 flex-wrap">
              <Button
                variant={isActive ? "outline" : "default"}
                size="lg"
                className={cn(
                  "w-10 h-10 p-0 rounded-full text-lg font-semibold",
                )}
                onClick={() => dispatch(setStepper(stepNum))}
                aria-label={`Go to step ${stepNum}`}
              >
                {step.icon ?? stepNum}
              </Button>
              <div className="mt-2 text-center">
                <p className="text-sm font-medium">
                  {stepNum}. {step.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content for Current Step */}
      <div>{data[currentStep - 1]}</div>
    </div>
  );
}
