import { useAppDispatch } from "@/store/hooks";
import {
  deleteOrgLocationWithStorage,
  fetchAllOrgLocations,
} from "@/store/slices/organizationLocationsSlice";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

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
    // Show confirmation toast
    toast(
      `Are you sure you want to remove "${locationName}" from this organization?`,
      {
        description:
          "The storage location data will be preserved in the system for potential future use.",
        action: {
          label: "Remove",
          onClick: async () => {
            try {
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
            } catch (error) {
              // Error is already handled by toast.promise
              console.error("Error deleting location:", error);
            }
          },
        },
        cancel: {
          label: "Cancel",
          onClick: () => {
            // Do nothing, just dismiss
          },
        },
      },
    );
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDelete}>
      <Trash2 className="h-3 w-3 mr-1" />
      Delete
    </Button>
  );
};

export default DeleteLocationButton;
