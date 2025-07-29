import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Calendar, Shield } from "lucide-react";
import { OrgLocationRow } from "@/types/organizationLocation";

interface OrgInfoCardProps {
  organization: {
    organization_id: string;
    roles: string[];
    supabase_org_name?: string;
    created_at?: string;
  };
  orgLocations: OrgLocationRow[];
  loading: boolean;
}

const OrgInfoCard = ({
  organization,
  orgLocations,
  loading,
}: OrgInfoCardProps) => {
  const activeLocations = orgLocations.filter((location) => location.is_active);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Organization Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Organization Details</CardTitle>
          </div>
          <CardDescription>Basic organization information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Organization ID
            </p>
            <p className="text-lg font-semibold">
              {organization.organization_id}
            </p>
          </div>
          {organization.supabase_org_name && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Organization Name
              </p>
              <p className="font-medium">{organization.supabase_org_name}</p>
            </div>
          )}
          {organization.created_at && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created
                </p>
                <p className="text-sm">
                  {new Date(organization.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Roles */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Your Roles</CardTitle>
          </div>
          <CardDescription>
            Your permissions in this organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {organization.roles.map((role) => (
              <Badge key={role} variant="secondary">
                {role
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Locations Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle>Storage Locations</CardTitle>
          </div>
          <CardDescription>Organization location overview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Locations
                </span>
                <span className="font-semibold">{orgLocations.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Active Locations
                </span>
                <span className="font-semibold text-green-600">
                  {activeLocations.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Inactive Locations
                </span>
                <span className="font-semibold text-red-600">
                  {orgLocations.length - activeLocations.length}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgInfoCard;
