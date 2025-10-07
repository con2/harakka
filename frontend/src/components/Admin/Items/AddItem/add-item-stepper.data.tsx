import { ReactNode } from "react";
import OrgStep from "./Steps/OrgStep";
import AddItemForm from "./Steps/AddItemForm";
import Summary from "./Steps/Summary";
import { Step } from "@/components/Stepper";
import { Box, Building2, ClipboardList } from "lucide-react";
import { t } from "@/translations";

/* Titles and icons for steps */
export const steps: Step[] = [
  {
    icon: <Building2 />,
    stepLabel: t.stepper.addItem[1],
  },
  {
    icon: <Box />,
    stepLabel: t.stepper.addItem[2],
  },
  {
    icon: <ClipboardList />,
    stepLabel: t.stepper.addItem[3],
  },
];

/* The components shown for each step */
export const stepperData: ReactNode[] = [
  <OrgStep />,
  <AddItemForm initialData={undefined} />,
  <Summary />,
];
