import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Info, MapPin } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectActiveRoleContext } from "@/store/slices/rolesSlice";
import {
  fetchAllOrgLocations,
  selectOrgLocations,
  selectOrgLocationsLoading,
} from "@/store/slices/organizationLocationsSlice";
import { useEffect } from "react";
import {
  selectItemCreation,
  selectOrg,
  selectOrgLocation,
} from "@/store/slices/itemsSlice";
import { setNextStep, setStepper } from "@/store/slices/uiSlice";
import { Skeleton } from "@/components/ui/skeleton";

function OrgStep() {
  const { lang } = useLanguage();
  const { organizationId: orgId, organizationName: orgName } = useAppSelector(
    selectActiveRoleContext,
  );
  const locationLoading = useAppSelector(selectOrgLocationsLoading);
  const orgLocations = useAppSelector(selectOrgLocations);
  const {
    org: selectedOrg,
    location: selectedLoc,
    items,
  } = useAppSelector(selectItemCreation);
  const dispatch = useAppDispatch();

  /*---------------------side effects--------------------------------------------*/

  useEffect(() => {
    dispatch(selectOrg({ id: orgId, name: orgName }));
    void dispatch(fetchAllOrgLocations({ orgId: orgId!, pageSize: 20 }));
  }, [dispatch, orgId, orgName]);

  /*---------------------render--------------------------------------------------*/
  return (
    <div className="bg-white flex flex-wrap rounded border mt-4 max-w-[900px] p-10 gap-4">
      <div className="flex flex-col gap-2 flex-3">
        <p className="scroll-m-20 text-2xl font-semibold tracking-tight w-full">
          {t.orgStep.heading.org[lang]}
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
                          className={`animate-pulse h-8 rounded-[1rem] bg-muted ${idx % 2 === 0 ? "w-16" : "w-20"} mb-2`}
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
                        className="gap-2"
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
                        {loc.storage_locations?.name ||
                          `Location #${loc.storage_location_id}`}
                      </Button>
                    ))}

                {/* Choose location for each item */}
                {!locationLoading && orgLocations.length > 1 && (
                  <Button
                    disabled={items.length > 0}
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
      {/* Info and Next Button */}
      <div className="flex flex-2 justify-end gap-3">
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
      </div>
    </div>
  );
}

export default OrgStep;
