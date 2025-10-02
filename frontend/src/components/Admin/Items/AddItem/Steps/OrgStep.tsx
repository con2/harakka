import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { ClipboardPenLine, FileUp, Info, MapPin } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

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

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) throw new Error("No file selected");
      validateFile(file);
      await dispatch(uploadCSV(file)).unwrap();
      dispatch(setStepper(3));
    } catch (error) {
      console.error(error);
      toast.error(typeof error === "string" ? error : "Failed to process file");
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
    <div className="bg-white flex flex-col flex-wrap rounded border mt-4 max-w-[900px]">
      <div className="flex flex-col gap-2 flex-3  p-10">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight w-full mb-4 text-start text-primary font-main">
          {t.orgStep.heading.location[lang]}
        </h2>
        <>
          {items.length > 0 && (
            <div className="bg-blue-50 justify-between rounded-xl flex items-center w-full p-4 border border-1 border-slate-300 mb-4 text-slate-700">
              <div className="flex items-center gap-3">
                <Info className="text-slate-600 self-center" />
                <p className="text-sm font-medium leading-[1.1rem]">
                  {t.orgStep.info.unfinishedItems[lang]}
                </p>
              </div>
              <Button
                variant="outline"
                className="bg-slate-700 hover:bg-slate-600 hover:text-white hover:border-slate-600"
                onClick={() => dispatch(setStepper(3))}
              >
                {t.orgStep.buttons.reviewItems[lang]}
              </Button>
            </div>
          )}
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
                      className="gap-3 h-fit"
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
                      <MapPin className="size-5" />
                      <div className="flex flex-col text-start">
                        <span className="text-base leading-[1.1]">
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
                  className="h-auto gap-3"
                  variant={selectedLoc === null ? "outline" : "default"}
                  onClick={() => dispatch(selectOrgLocation(null))}
                >
                  <MapPin className="size-5" />
                  {t.orgStep.buttons.chooseLocation[lang]}
                </Button>
              )}

              {!locationLoading && orgLocations.length === 0 && (
                <p>
                  {t.orgStep.info.noLocationsFound[lang]}
                  <br />
                  <Link
                    to="/admin/locations"
                    className="underline underline-offset-3"
                  >
                    {t.orgStep.links.createLocation[lang]}
                  </Link>
                </p>
              )}
            </div>
          </div>
        </>
      </div>

      <Separator />

      {/* Item Creations Choices: Manual or CSV Upload */}
      <div className="p-10">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight w-full mb-4 text-start text-primary font-main">
          {t.orgStep.heading.method[lang]}
        </h2>
        <div className="gap-4 flex items-end flex-wrap items-start">
          <div className="flex flex-col flex-1">
            <Button
              disabled={selectedLoc === undefined || orgLocations.length === 0}
              variant="outline"
              className="gap-2 py-8 px-8"
              onClick={() => dispatch(setNextStep())}
            >
              <ClipboardPenLine className="size-6" />
              {t.orgStep.buttons.fillForm[lang]}
            </Button>
          </div>
          <div className="flex flex-col flex-1">
            <Button
              variant="outline"
              className="gap-2 py-8 px-8"
              disabled={selectedLoc === undefined || orgLocations.length === 0}
              onClick={(e) => {
                e.preventDefault();
                if (!itemsLoading)
                  document.getElementById("csv-uploader")?.click();
              }}
            >
              <FileUp className="size-6" />
              {t.orgStep.buttons.uploadCSV[lang]}
              <span className="align-top text-sm">(beta)</span>
            </Button>
            <p className="text-sm text-end py-1">
              {t.orgStep.buttons.downloadTemplate[lang]}{" "}
              <a
                className="underline underline-offset-2"
                href="/Item-Template.xlsx"
                download
              >
                {t.orgStep.buttons.downloadTemplateHere[lang]}
              </a>
            </p>

            <input
              id="csv-uploader"
              type="file"
              accept="text/csv"
              className="hidden"
              onChange={handleCSV}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrgStep;
