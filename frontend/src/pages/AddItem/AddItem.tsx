import Spinner from "@/components/Spinner";
import { useAppSelector } from "@/store/hooks";
import { selectOrganizationLoading } from "@/store/slices/organizationSlice";
import { ItemFormData } from "@/types";
import { useState } from "react";
import { Stepper } from "@/components/Stepper";
import { steps } from "./add-item.steps";
import { stepperData } from "./add-item-stepper.data";

function AddItem() {
  const orgsLoading = useAppSelector(selectOrganizationLoading);
  const [newItems, setNewItems] = useState<ItemFormData[]>([
    {
      translations: {
        fi: {
          item_name: "sairaalan tarvikkeet",
          item_type: "lääkintätarvikkeet",
          item_description: "",
        },
        en: {
          item_name: "medbay supplies",
          item_type: "medical supplies",
          item_description: "",
        },
      },
      id: "22f82e0c-5f66-4678-b12d-324af534f785",
      items_number_total: 5,
      items_number_currently_in_storage: 5,
      price: 12,
      is_active: true,
      location_id: "244514fd-4cab-46ac-a2aa-9e0f9fca6e50",
      location_details: {
        name: "Akaa",
        address: "",
      },
    },
  ]);
  /*---------------------handlers-----------------------------*/

  /*---------------------render--------------------------------*/
  if (orgsLoading) return <Spinner height="h-4/6" />;

  return (
    <>
      <Stepper steps={steps} data={stepperData} />
    </>
  );
}

export default AddItem;
