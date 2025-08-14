import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OrgLocationWithNames } from "@/types/organizationLocation";
import AddLocationModal from "./AddLocationModal";
import EditLocationModal from "./EditLocationModal";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import LocationsList from "./LocationsList";

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
      <LocationsList
        locations={orgLocations}
        loading={loading}
        onEdit={openEditModal}
        showActions={true}
        organizationId={organizationId}
      />
    </div>
  );
};

export default OrgLocationManagement;
