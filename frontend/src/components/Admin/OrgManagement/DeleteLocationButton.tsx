import { useAppDispatch } from "@/store/hooks";
import {
  deleteOrgLocationWithStorage,
  fetchAllOrgLocations,
} from "@/store/slices/organizationLocationsSlice";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { toastConfirm } from "../../ui/toastConfirm";

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

  const handleDelete = () => {
    toastConfirm({
      title: "Remove Organization Location",
      description: `Are you sure you want to remove "${locationName}" from this organization? The storage location data will be preserved in the system for potential future use.`,
      confirmText: "Remove",
      cancelText: "Cancel",
      onConfirm: async () => {
        await toast.promise(
          dispatch(deleteOrgLocationWithStorage(locationId)).unwrap(),
          {
            loading: "Removing location from organization...",
            success: "Location removed from organization successfully",
            error: "Failed to remove location",
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
      Delete
    </Button>
  );
};

export default DeleteLocationButton;
