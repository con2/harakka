import { ReactNode } from "react";
import OrgStep from "./Steps/OrgStep";
import AddItemForm from "./Steps/AddItemForm";
import Summary from "./Steps/Summary";
import { Step } from "@/components/Stepper";
import { Box, Building2, ClipboardList } from "lucide-react";

/* Titles and icons for steps */
export const steps: Step[] = [
  {
    title: "Choose organization and location",
    icon: <Building2 />,
  },
  {
    title: "Create your item",
    icon: <Box />,
  },
  {
    title: "Item summary",
    icon: <ClipboardList />,
  },
];

/* The components shown for each step */
export const stepperData: ReactNode[] = [
  <OrgStep />,
  <AddItemForm />,
  <Summary />,
];
