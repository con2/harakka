import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCurrentUserOrganizations } from "@/store/slices/rolesSlice";
import {
  fetchLocationsByOrgId,
  selectCurrentOrgLocations,
  selectOrgLocationsLoading,
} from "@/store/slices/organizationLocationsSlice";
import { useEffect } from "react";
import {
  selectItemCreation,
  selectOrg,
  selectOrgLocation,
} from "@/store/slices/itemsSlice";
import { setNextStep } from "@/store/slices/uiSlice";
import { Skeleton } from "@/components/ui/skeleton";

function OrgStep() {
  const { lang } = useLanguage();
  const orgs = useAppSelector(selectCurrentUserOrganizations);
  const locationLoading = useAppSelector(selectOrgLocationsLoading);
  const orgLocations = useAppSelector(selectCurrentOrgLocations);
  const {
    org: selectedOrg,
    location: selectedLoc,
    items,
  } = useAppSelector(selectItemCreation);
  const dispatch = useAppDispatch();

  /*---------------------handlers------------------------------------------------*/
  const handleOrgChange = (org_id: string) => {
    const newOrg = orgs.find((org) => org.organization_id === org_id);
    if (!newOrg) return dispatch(selectOrg(undefined));
    void dispatch(selectOrgLocation(undefined));
    void dispatch(fetchLocationsByOrgId(newOrg.organization_id));
    void dispatch(
      selectOrg({
        id: newOrg.organization_id,
        name: newOrg.organization_name,
      }),
    );
  };
  /*---------------------side effects--------------------------------------------*/
  useEffect(() => {
    if (orgLocations?.length === 1) {
      const newOrg = orgLocations[0];
      dispatch(
        selectOrgLocation({
          id: newOrg.storage_location_id,
          name: newOrg.storage_locations.name,
          address: newOrg.storage_locations.address,
        }),
      );
    }
  }, [orgLocations, dispatch]);

  useEffect(() => {
    if (selectedOrg && orgLocations.length < 1)
      void dispatch(fetchLocationsByOrgId(selectedOrg?.id));
  }, [dispatch, orgLocations, selectedOrg]);

  /*---------------------render--------------------------------------------------*/
  return (
    <div className="bg-white flex flex-wrap rounded border mt-4 max-w-[900px] p-10 gap-4">
      <div className="flex flex-col gap-2 flex-3">
        <p className="scroll-m-20 text-2xl font-semibold tracking-tight w-full">
          {t.orgStep.heading.org[lang]}
        </p>
        <div>
          {/* Select Organization */}
          <Select
            value={selectedOrg?.name ?? ""}
            onValueChange={handleOrgChange}
            required
            name="organization"
            disabled={items.length > 0}
          >
            <SelectTrigger
              disabled={orgs.length === 1}
              className="min-w-[250px] border shadow-none border-grey w-[300px]"
            >
              <SelectValue placeholder={t.orgStep.placeholders.selectOrg[lang]}>
                {selectedOrg?.name ?? ""}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {orgs.map((org) => (
                <SelectItem
                  key={org.organization_id}
                  value={org.organization_id}
                >
                  {org.organization_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                          id: loc.storage_location_id,
                          name: loc.storage_locations.name,
                          address: loc.storage_locations.address,
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
      </div>
      {/* Info and Next Button */}
      <div className="flex flex-2 flex-col justify-end">
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
