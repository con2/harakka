import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Edit } from "lucide-react";
import DeleteLocationButton from "@/components/Admin/OrgManagement/DeleteLocationButton";
import { OrgLocationWithNames } from "@/types/organizationLocation";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

interface LocationsListProps {
  locations: OrgLocationWithNames[];
  loading: boolean;
  onEdit?: (location: OrgLocationWithNames) => void;
  showActions?: boolean; // Whether to show edit/delete actions
  organizationId?: string; // Required if actions are enabled
  setLoading?: (loading: boolean) => void;
}

const LocationsList: React.FC<LocationsListProps> = ({
  locations,
  loading,
  onEdit,
  showActions = false,
  organizationId,
}) => {
  const { lang } = useLanguage();
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_item, i) => (
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
        ))}
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <MapPin aria-hidden className="h-12 w-12 mx-auto mb-4" />
        <p>{t.locationsList.noLocations[lang]}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {locations.map((location) => (
        <Card key={location.id} className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin aria-hidden className="h-6 w-6 text-primary" />
                <CardTitle className="font-semibold">
                  {location.storage_locations?.name ||
                    `Location #${location.id}`}
                </CardTitle>
              </div>
              <Badge variant={location.is_active ? "default" : "secondary"}>
                {location.is_active
                  ? t.locationsList.active[lang]
                  : t.locationsList.inactive[lang]}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              {`${t.locationsList.address[lang]}: 
              ${
                location.storage_locations?.address ||
                t.locationsList.noAddress[lang]
              }`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                {`${t.locationsList.organization[lang]}: ${location.organizations?.name || location.organization_id}`}
              </p>
              {location.created_at && (
                <p>
                  {`${t.locationsList.created[lang]}: ${new Date(location.created_at).toLocaleDateString()}`}
                </p>
              )}
            </div>
            {showActions && organizationId && (
              <div className="flex items-center space-x-2 mt-4">
                <Button
                  aria-label={t.locationsList.aria.labels.editLocation[lang]}
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(location)}
                >
                  <Edit aria-hidden className="h-3 w-3 mr-1" />
                  {t.locationsList.edit[lang]}
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
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LocationsList;
