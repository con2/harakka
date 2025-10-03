import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OrgLocationWithNames } from "@/types/organizationLocation";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import LocationsList from "./LocationsList";

interface OrgLocationManagementProps {
  organizationId: string;
  orgLocations: OrgLocationWithNames[];
  loading: boolean;
}

const OrgLocationManagement = ({
  orgLocations,
  loading,
}: OrgLocationManagementProps) => {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const handleEditLocation = (location: OrgLocationWithNames) => {
    void navigate(`/admin/locations/${location.id}`);
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
        <Button
          onClick={() => navigate("/admin/locations/add")}
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t.orgLocationManagement.header.addButton[lang]}
        </Button>
      </div>

      {/* Locations List */}
      <LocationsList
        locations={orgLocations}
        loading={loading}
        onEdit={handleEditLocation}
      />
    </div>
  );
};

export default OrgLocationManagement;
