import { useAppDispatch } from "@/store/hooks";
import {
  deleteOrgLocationWithStorage,
  fetchAllOrgLocations,
} from "@/store/slices/organizationLocationsSlice";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { toastConfirm } from "../../ui/toastConfirm";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

interface DeleteLocationButtonProps {
  locationId: string;
  locationName?: string;
  organizationId: string;
}

const DeleteLocationButton = ({
  locationId,
  locationName = "this location",
  organizationId,
}: DeleteLocationButtonProps) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();

  const handleDelete = () => {
    const locationInfo = t.orgLocationManagement.deleteModal.locationInfo[
      lang
    ].replace("{name}", locationName);
    const description = `${locationInfo}\n\n${t.orgLocationManagement.deleteModal.description[lang]}`;

    toastConfirm({
      title: t.orgLocationManagement.deleteModal.title[lang],
      description: description,
      confirmText: t.orgLocationManagement.deleteModal.buttons.delete[lang],
      cancelText: t.orgLocationManagement.deleteModal.buttons.cancel[lang],
      onConfirm: async () => {
        await toast.promise(
          dispatch(deleteOrgLocationWithStorage(locationId)).unwrap(),
          {
            loading: t.orgLocationManagement.deleteModal.messages.loading[lang],
            success: t.orgLocationManagement.deleteModal.messages.success[lang],
            error: t.orgLocationManagement.deleteModal.messages.error[lang],
          },
        );

        // Refresh the organization locations list
        await dispatch(
          fetchAllOrgLocations({
            orgId: organizationId,
            pageSize: 100,
            currentPage: 1,
          }),
        );
      },
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDelete}>
      <Trash2 className="h-3 w-3 mr-1" />
      {t.orgLocationManagement.deleteModal.buttons.delete[lang]}
    </Button>
  );
};

export default DeleteLocationButton;
