import { useAppDispatch } from "@/store/hooks";
import { Stepper } from "@/components/Stepper";
import { useEffect } from "react";
import { loadItemsFromStorage } from "@/store/slices/itemsSlice";
import {
  stepperData,
  steps,
} from "@/components/Admin/Items/AddItem/add-item-stepper.data";

function AddItem() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(loadItemsFromStorage());
  }, [dispatch]);

  /*---------------------render--------------------------------*/

  return <Stepper parent="addItem" steps={steps} data={stepperData} />;
}

export default AddItem;
