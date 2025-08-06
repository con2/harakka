import Spinner from "@/components/Spinner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectOrganizationLoading } from "@/store/slices/organizationSlice";
import { Stepper } from "@/components/Stepper";
import { useEffect } from "react";
import { loadItemsFromStorage } from "@/store/slices/itemsSlice";
import {
  stepperData,
  steps,
} from "@/components/Admin/Items/AddItem/add-item-stepper.data";

function AddItem() {
  const orgsLoading = useAppSelector(selectOrganizationLoading);
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(loadItemsFromStorage());
  }, [dispatch]);

  /*---------------------render--------------------------------*/
  if (orgsLoading) return <Spinner height="h-4/6" />;

  return <Stepper parent="addItem" steps={steps} data={stepperData} />;
}

export default AddItem;
