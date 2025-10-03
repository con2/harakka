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
  onDeleteSuccess?: () => void;
}

const DeleteLocationButton = ({
  locationId,
  locationName = "this location",
  organizationId,
  onDeleteSuccess,
}: DeleteLocationButtonProps) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();

  const handleDelete = () => {
    const locationInfo = t.deleteLocationButton.locationInfo[lang].replace(
      "{name}",
      locationName,
    );
    const description = `${locationInfo}\n\n${t.deleteLocationButton.description[lang]}`;

    toastConfirm({
      title: t.deleteLocationButton.title[lang],
      description: description,
      confirmText: t.deleteLocationButton.buttons.delete[lang],
      cancelText: t.deleteLocationButton.buttons.cancel[lang],
      onConfirm: async () => {
        toast.promise(
          dispatch(deleteOrgLocationWithStorage(locationId)).unwrap(),
          {
            loading: t.deleteLocationButton.messages.loading[lang],
            success: t.deleteLocationButton.messages.success[lang],
            error: t.deleteLocationButton.messages.error[lang],
          },
        );

        await dispatch(
          fetchAllOrgLocations({
            orgId: organizationId,
            pageSize: 100,
            currentPage: 1,
          }),
        );

        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      },
    });
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      <Trash2 className="h-3 w-3 mr-1" />
      {t.deleteLocationButton.buttons.delete[lang]}
    </Button>
  );
};

export default DeleteLocationButton;
