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
} from "@/store/slices/organizationLocationsSlice";
import { useEffect } from "react";
import {
  selectItemCreation,
  selectOrg,
  selectOrgLocation,
} from "@/store/slices/itemsSlice";
import { setNextStep } from "@/store/slices/uiSlice";

function OrgStep() {
  const { lang } = useLanguage();
  const orgs = useAppSelector(selectCurrentUserOrganizations);
  const orgLocations = useAppSelector(selectCurrentOrgLocations);
  const {
    selectedOrg,
    selectedLocation: storage,
    items,
  } = useAppSelector(selectItemCreation);
  const dispatch = useAppDispatch();

  /*---------------------handlers------------------------------------------------*/
  const handleOrgChange = (org_id: string) => {
    const newOrg = orgs.find((org) => org.organization_id === org_id);
    if (!newOrg) return dispatch(selectOrg(undefined));
    void dispatch(selectOrgLocation(undefined));
    void dispatch(fetchLocationsByOrgId(newOrg.organization_id));
    void dispatch(selectOrg(newOrg));
  };
  /*---------------------side effects--------------------------------------------*/
  useEffect(() => {
    if (orgLocations?.length === 1) {
      const newOrg = orgLocations[0];
      dispatch(
        selectOrgLocation({
          org_id: newOrg.id,
          name: newOrg.storage_locations.name,
          address: newOrg.storage_locations.address,
        }),
      );
    }
  }, [orgLocations, dispatch]);

  return (
    <div className="bg-white flex flex-wrap rounded border mt-4 max-w-[900px] flex-col p-10 gap-4">
      <p className="scroll-m-20 text-2xl font-semibold tracking-tight w-full">
        Organization
      </p>
      <div>
        <Select
          value={selectedOrg?.organization_name ?? ""}
          onValueChange={handleOrgChange}
          required
          name="organization"
          disabled={items.length > 0}
        >
          <SelectTrigger
            disabled={orgs.length === 1}
            className="min-w-[250px] border shadow-none border-grey w-[300px]"
          >
            <SelectValue placeholder={t.addItem.placeholders.selectOrg[lang]}>
              {selectedOrg?.organization_name ?? ""}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {orgs.map((org) => (
              <SelectItem key={org.organization_id} value={org.organization_id}>
                {org.organization_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location Selection */}
      <div className="flex justify-between items-center">
        {orgLocations && (
          <div className="flex gap-2">
            {orgLocations.map((loc) => (
              <Button
                key={loc.storage_location_id}
                variant={storage?.org_id === loc.id ? "outline" : "default"}
                className="gap-2"
                onClick={() =>
                  dispatch(
                    selectOrgLocation({
                      org_id: loc.id,
                      name: loc.storage_locations.name,
                      address: loc.storage_locations.address,
                    }),
                  )
                }
              >
                <MapPin />
                {loc.storage_locations?.name || `Location #${loc.id}`}
              </Button>
            ))}
            {orgLocations.length > 1 && (
              <Button
                variant={storage === null ? "outline" : "default"}
                onClick={() => dispatch(selectOrgLocation(null))}
              >
                {t.addItem.buttons.chooseLocation[lang]}
              </Button>
            )}
          </div>
        )}
        <Button
          variant="outline"
          className="ml-[auto] px-10"
          onClick={() => dispatch(setNextStep())}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default OrgStep;
