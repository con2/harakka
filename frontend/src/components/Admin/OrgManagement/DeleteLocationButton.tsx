import { useAppDispatch } from "@/store/hooks";
import {
  deleteOrgLocationWithStorage,
  fetchAllOrgLocations,
} from "@/store/slices/organizationLocationsSlice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

  const handleDelete = async () => {
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
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Organization Location</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-semibold">{locationName}</span> from this
            organization? This action cannot be undone, but the storage location
            data will be preserved in the system for potential future use.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remove Location
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteLocationButton;
