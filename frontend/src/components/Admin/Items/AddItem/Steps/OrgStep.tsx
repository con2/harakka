import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { FileUp, Info, MapPin } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectActiveRoleContext } from "@/store/slices/rolesSlice";
import {
  fetchAllOrgLocations,
  selectOrgLocations,
  selectOrgLocationsLoading,
} from "@/store/slices/organizationLocationsSlice";
import { useCallback, useEffect } from "react";
import {
  selectItemCreation,
  selectItemsLoading,
  selectOrg,
  selectOrgLocation,
  uploadCSV,
} from "@/store/slices/itemsSlice";
import { setNextStep, setStepper } from "@/store/slices/uiSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Spinner from "@/components/Spinner";

function OrgStep() {
  const { lang } = useLanguage();
  const { organizationId: orgId, organizationName: orgName } = useAppSelector(
    selectActiveRoleContext,
  );
  const itemsLoading = useAppSelector(selectItemsLoading);
  const locationLoading = useAppSelector(selectOrgLocationsLoading);
  const orgLocations = useAppSelector(selectOrgLocations);
  const { location: selectedLoc, items } = useAppSelector(selectItemCreation);
  const dispatch = useAppDispatch();

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) throw new Error("No file selected");
      validateFile(file);
      void dispatch(uploadCSV(file)).unwrap();
      dispatch(setStepper(3));
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file");
    }
  };

  const validateFile = useCallback((file: File) => {
    if (!file.type.startsWith("text/csv")) {
      throw new Error(`${file.name} is not a CSV file`);
    }
  }, []);

  /*---------------------side effects--------------------------------------------*/
  useEffect(() => {
    dispatch(selectOrg({ id: orgId, name: orgName }));
    void dispatch(fetchAllOrgLocations({ orgId: orgId!, pageSize: 20 }));
  }, [dispatch, orgId, orgName]);

  /*---------------------render--------------------------------------------------*/
  return (
    <div className="bg-white flex flex-col flex-wrap rounded border mt-4 max-w-[900px] p-10 gap-8">
      <div className="flex flex-col gap-2 flex-3">
        <p className="scroll-m-20 text-2xl font-semibold tracking-tight w-full mb-2">
          {/* {t.orgStep.heading.org[lang]} */}
          Choose Location
        </p>
        {items.length > 0 && (
          <div className="flex align-center gap-3 p-4 border rounded justify-center">
            <Info color="#3d3d3d" className="self-center" />
            <p className="text-sm font-medium leading-[1.1rem]">
              {t.addItemForm.paragraphs.unfinishedItems[lang]}
            </p>
          </div>
        )}
        {items.length < 1 && (
          <>
            {/* Location Selection */}
            <div className="flex justify-between items-center">
              <div className="flex flex-wrap gap-2">
                {/* Locations of selected org */}
                {locationLoading
                  ? Array(5)
                      .fill("")
                      .map((_, idx) => (
                        <Skeleton
                          key={idx}
                          className={`animate-pulse h-[50px] rounded-[1rem] bg-muted ${idx % 2 === 0 ? "w-16" : "w-20"} mb-2`}
                        />
                      ))
                  : orgLocations.map((loc) => (
                      <Button
                        key={loc.storage_location_id}
                        variant={
                          selectedLoc?.id === loc.storage_location_id
                            ? "outline"
                            : "default"
                        }
                        className="gap-2 h-fit"
                        disabled={items.length > 0}
                        onClick={() =>
                          dispatch(
                            selectOrgLocation({
                              id: loc?.storage_location_id,
                              name: loc?.storage_locations?.name,
                              address: loc?.storage_locations?.address,
                            }),
                          )
                        }
                      >
                        <MapPin />
                        <div className="flex flex-col text-start">
                          <span>
                            {loc.storage_locations?.name ||
                              `Location #${loc.storage_location_id}`}
                          </span>
                          <span>{loc.storage_locations?.address}</span>
                        </div>
                      </Button>
                    ))}

                {/* Choose location for each item */}
                {!locationLoading && orgLocations.length > 1 && (
                  <Button
                    disabled={items.length > 0}
                    className="h-auto"
                    variant={selectedLoc === null ? "outline" : "default"}
                    onClick={() => dispatch(selectOrgLocation(null))}
                  >
                    {t.orgStep.buttons.chooseLocation[lang]}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div>
        <p className="scroll-m-20 text-2xl font-semibold tracking-tight w-full mb-2">
          {/* {t.orgStep.heading.org[lang]} */}
        </p>
        <div className="gap-4 flex items-end">
          <div className="flex flex-col">
            <p className="font-semibold">Fill out our form</p>
            <Button
              disabled={selectedLoc === undefined}
              variant="outline"
              className="gap-2 flex-col h-25"
              onClick={() => dispatch(setNextStep())}
            >
              Manually Create Items
            </Button>
          </div>
          <div className="flex flex-col">
            <p className="font-semibold">Upload CSV file (beta)</p>
            <p className="text-sm">Download our template here</p>
            <Button
              variant="outline"
              className="gap-2 flex-col h-25"
              disabled={selectedLoc === undefined}
              onClick={(e) => {
                e.preventDefault();
                if (!itemsLoading) document.getElementById("csv")?.click();
              }}
            >
              <FileUp className="w-10 h-10" />
              Upload CSV file
            </Button>
            <input
              id="csv"
              type="file"
              accept="text/csv"
              className="hidden"
              onChange={handleCSV}
            />
          </div>
        </div>
      </div>

      {/* Modal whilst item upload is loading */}
      {itemsLoading && (
        <Dialog open>
          <DialogContent className="w-fit px-20">
            <Spinner />
            <p className="font-semibold">Processing items...</p>
          </DialogContent>
        </Dialog>
      )}

      {/* Info and Next Button */}
      {/* <div className="flex flex-2 justify-end gap-3">
        {items.length > 0 && (
          <Button
            variant="default"
            className="w-fit self-end"
            disabled={!selectedOrg || selectedLoc === undefined}
            onClick={() => dispatch(setStepper(3))}
          >
            {t.addItemForm.buttons.goToSummary[lang]}
          </Button>
        )}
        <Button
          variant="outline"
          className="w-fit px-10 self-end"
          disabled={!selectedOrg || selectedLoc === undefined}
          onClick={() => dispatch(setNextStep())}
        >
          {t.orgStep.buttons.next[lang]}
        </Button>
      </div> */}
    </div>
  );
}

export default OrgStep;
