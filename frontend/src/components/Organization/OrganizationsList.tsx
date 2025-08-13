import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllOrganizations,
  selectOrganizations,
  selectOrganizationLoading,
  selectOrganizationError,
} from "@/store/slices/organizationSlice";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useRoles } from "@/hooks/useRoles";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const OrganizationsList = () => {
  const dispatch = useAppDispatch();
  const organizations = useAppSelector(selectOrganizations);
  const loading = useAppSelector(selectOrganizationLoading);
  const error = useAppSelector(selectOrganizationError);
  const { currentUserOrganizations } = useRoles();

  useEffect(() => {
    void dispatch(fetchAllOrganizations({ page: 1, limit: 50 }));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  // Extract organization roles for the current user
  const userOrgRoles = currentUserOrganizations.reduce(
    (acc, org) => {
      acc[org.organization_id] = org.roles; // Map org ID to roles
      return acc;
    },
    {} as Record<string, string[]>,
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Building2 className="h-6 w-6 text-blue-500" />
          All Organizations
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {organizations.map((org) => (
          <Card key={org.id} className="relative flex flex-col h-full">
            <CardHeader>
              {/* TODO: this is a temporary placeholder for organization logo, replace with actual logo when available */}
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <Building2 className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg font-semibold">
                  {org.name}
                </CardTitle>
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                {org.description || "No description available"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              {userOrgRoles[org.id] && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    My Roles:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {userOrgRoles[org.id].map((role) => (
                      <Badge
                        key={role}
                        variant="secondary"
                        className="bg-green-100 text-green-600"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-auto">
                <Link
                  to={`/organization/${org.slug}`}
                  className="text-blue-500 hover:underline text-sm"
                >
                  View Details
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrganizationsList;
