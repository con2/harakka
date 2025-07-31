import Spinner from "@/components/Spinner";
import { useAppSelector } from "@/store/hooks";
import { selectOrganizationLoading } from "@/store/slices/organizationSlice";
import { Stepper } from "@/components/Stepper";
import { steps } from "./add-item.steps";
import { stepperData } from "./add-item-stepper.data";

function AddItem() {
  const orgsLoading = useAppSelector(selectOrganizationLoading);

  /*---------------------render--------------------------------*/
  if (orgsLoading) return <Spinner height="h-4/6" />;

  return (
    <>
      <Stepper steps={steps} data={stepperData} />
    </>
  );
}

export default AddItem;
