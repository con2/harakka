import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  createOrgLocation,
  updateOrgLocation,
  deleteOrgLocation,
} from "@/store/slices/organizationLocationsSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import {
  OrgLocationWithNames,
  OrgLocationInsert,
  OrgLocationUpdate,
} from "@/types/organizationLocation";
import { toast } from "sonner";

interface OrgLocationManagementProps {
  organizationId: string;
  orgLocations: OrgLocationWithNames[];
  loading: boolean;
}

interface LocationFormData {
  storage_location_id: string;
  is_active: boolean;
}

const OrgLocationManagement = ({
  organizationId,
  orgLocations,
  loading,
}: OrgLocationManagementProps) => {
  const dispatch = useAppDispatch();
  const [editingLocation, setEditingLocation] =
    useState<OrgLocationWithNames | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<LocationFormData>({
    storage_location_id: "",
    is_active: true,
  });

  const handleCreateLocation = async () => {
    try {
      const locationData: OrgLocationInsert = {
        organization_id: organizationId,
        storage_location_id: formData.storage_location_id,
        is_active: formData.is_active,
      };

      await dispatch(createOrgLocation(locationData)).unwrap();
      toast.success("Organization location created successfully");
      setIsCreateDialogOpen(false);
      setFormData({ storage_location_id: "", is_active: true });
    } catch (error) {
      toast.error("Failed to create organization location");
      console.error("Error creating location:", error);
    }
  };

  const handleUpdateLocation = async () => {
    if (!editingLocation) return;

    try {
      const updateData: OrgLocationUpdate = {
        storage_location_id: formData.storage_location_id,
        is_active: formData.is_active,
      };

      await dispatch(
        updateOrgLocation({
          id: editingLocation.id,
          data: updateData,
        }),
      ).unwrap();

      toast.success("Organization location updated successfully");
      setIsEditDialogOpen(false);
      setEditingLocation(null);
      setFormData({ storage_location_id: "", is_active: true });
    } catch (error) {
      toast.error("Failed to update organization location");
      console.error("Error updating location:", error);
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      await dispatch(deleteOrgLocation(locationId)).unwrap();
      toast.success("Organization location deleted successfully");
    } catch (error) {
      toast.error("Failed to delete organization location");
      console.error("Error deleting location:", error);
    }
  };

  const openEditDialog = (location: OrgLocationWithNames) => {
    setEditingLocation(location);
    setFormData({
      storage_location_id: location.storage_location_id,
      is_active: location.is_active ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ storage_location_id: "", is_active: true });
    setEditingLocation(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Manage storage locations for this organization
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Organization Location</DialogTitle>
              <DialogDescription>
                Link a storage location to this organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storage_location_id">Storage Location ID</Label>
                <Input
                  id="storage_location_id"
                  value={formData.storage_location_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      storage_location_id: e.target.value,
                    }))
                  }
                  placeholder="Enter storage location ID"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_active: checked }))
                  }
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateLocation}>Create Location</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Locations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(6)].map((_item, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))
        ) : orgLocations.length > 0 ? (
          orgLocations.map((location) => (
            <Card key={location.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">
                      {location.storage_locations?.name ||
                        `Location #${location.id}`}
                    </CardTitle>
                  </div>
                  <Badge variant={location.is_active ? "default" : "secondary"}>
                    {location.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Storage Location:{" "}
                  {location.storage_locations?.name ||
                    location.storage_location_id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>
                    Organization:{" "}
                    {location.organizations?.name || location.organization_id}
                  </p>
                  {location.created_at && (
                    <p>
                      {"Created: "}
                      {new Date(location.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(location)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Organization Location</DialogTitle>
                        <DialogDescription>
                          Update the organization location settings
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit_storage_location_id">
                            Storage Location ID
                          </Label>
                          <Input
                            id="edit_storage_location_id"
                            value={formData.storage_location_id}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                storage_location_id: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="edit_is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({
                                ...prev,
                                is_active: checked,
                              }))
                            }
                          />
                          <Label htmlFor="edit_is_active">Active</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateLocation}>
                          Update Location
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete Organization Location
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this organization
                          location? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteLocation(location.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No locations found
                </h3>
                <p className="text-muted-foreground mb-4">
                  This organization doesn't have any storage locations yet.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Location
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgLocationManagement;
