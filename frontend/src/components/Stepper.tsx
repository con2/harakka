import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setStepper, stepperCurrentNum } from "@/store/slices/uiSlice";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { Translation } from "@common/database.types";

export interface Step {
  icon?: ReactNode;
  stepLabel: Translation;
}

export interface StepperProps {
  parent: string;
  steps: Step[];
  data: ReactNode[];
  disabled?: boolean;
}

/**
 *
 * @param parent Used to index the translations. See @translations/modules/stepper.ts for more info.
 * @returns
 */
export function Stepper({
  parent,
  steps,
  data,
  disabled = false,
}: StepperProps) {
  const { lang } = useLanguage();
  const currentStep = useAppSelector(stepperCurrentNum);
  const dispatch = useAppDispatch();

  return (
    <div className="space-y-6">
      {/* Step Buttons */}
      <div className="flex items-start md:items-center gap-4">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          return (
            <div
              key={idx}
              className="flex gap-x-4 flex-wrap w-fit justify-center md:justify-start"
            >
              <Button
                variant={isActive ? "outline" : "default"}
                size="lg"
                type="button"
                className="w-10 h-10 p-0 rounded-full text-lg font-semibold"
                onClick={
                  !disabled ? () => dispatch(setStepper(stepNum)) : undefined
                }
                aria-label={`${t.stepper.general.goToStep[lang]}: ${step.stepLabel[lang]}`}
              >
                {step.icon ?? stepNum}
              </Button>
              <div className="mt-2 text-center">
                <p className="text-sm font-medium">
                  {stepNum}. {t.stepper[parent][String(idx + 1)][lang]}
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
