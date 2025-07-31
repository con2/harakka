import { Step } from "@/components/Stepper";
import { Box, Building2, ClipboardList } from "lucide-react";

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
