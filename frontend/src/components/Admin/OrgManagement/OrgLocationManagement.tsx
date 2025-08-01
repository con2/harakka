import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, MapPin } from "lucide-react";
import { OrgLocationWithNames } from "@/types/organizationLocation";
import AddLocationModal from "./AddLocationModal";
import EditLocationModal from "./EditLocationModal";
import DeleteLocationButton from "./DeleteLocationButton";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

interface OrgLocationManagementProps {
  organizationId: string;
  orgLocations: OrgLocationWithNames[];
  loading: boolean;
}

const OrgLocationManagement = ({
  organizationId,
  orgLocations,
  loading,
}: OrgLocationManagementProps) => {
  const { lang } = useLanguage();
  const [editingLocation, setEditingLocation] =
    useState<OrgLocationWithNames | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const openEditModal = (location: OrgLocationWithNames) => {
    setEditingLocation(location);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingLocation(null);
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            {t.orgLocationManagement.header.description[lang]}
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          {t.orgLocationManagement.header.addButton[lang]}
        </Button>
      </div>

      {/* Add Location Modal */}
      <AddLocationModal
        organizationId={organizationId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Edit Location Modal */}
      <EditLocationModal
        location={editingLocation}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
      />

      {/* Locations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_item, i) => (
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
                    {location.is_active
                      ? t.orgLocationManagement.status.active[lang]
                      : t.orgLocationManagement.status.inactive[lang]}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {t.orgLocationManagement.locationCard.address[lang]}:{" "}
                  {location.storage_locations?.address ||
                    t.orgLocationManagement.locationCard.noAddress[lang]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>
                    {t.orgLocationManagement.locationCard.organization[lang]}:{" "}
                    {location.organizations?.name || location.organization_id}
                  </p>
                  {location.created_at && (
                    <p>
                      {t.orgLocationManagement.locationCard.created[lang]}:{" "}
                      {new Date(location.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(location)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    {t.orgLocationManagement.locationCard.editButton[lang]}
                  </Button>

                  <DeleteLocationButton
                    locationId={location.id}
                    locationName={
                      location.storage_locations?.name ||
                      `Location #${location.id}`
                    }
                    organizationId={organizationId}
                  />
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
                  {t.orgLocationManagement.emptyState.title[lang]}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t.orgLocationManagement.emptyState.description[lang]}
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.orgLocationManagement.header.addFirstButton[lang]}
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
