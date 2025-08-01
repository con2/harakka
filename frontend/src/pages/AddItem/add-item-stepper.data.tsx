import { ReactNode } from "react";
import OrgStep from "./Steps/OrgStep";
import AddItemForm from "./Steps/AddItemForm";
import Summary from "./Steps/Summary";

export const stepperData: ReactNode[] = [
  <OrgStep />,
  <AddItemForm />,
  <Summary />,
];
