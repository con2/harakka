import { Navigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { Org_Roles } from "@common/role.types";
interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Accepts one or more roles from the Org_Roles union.
   * Writing `<ProtectedRoute allowedRoles={["admin", "super_admin"]} />`
   * now gives IntelliSense suggestions and compile‑time safety.
   */
  allowedRoles: Org_Roles[];
  requiredOrganization?: string;
}

const ProtectedRoute = ({
  children,
  allowedRoles = [],
  requiredOrganization,
}: ProtectedRouteProps) => {
  const { authLoading, user } = useAuth(); // wait for supabase auth to finish
  const { loading: rolesLoading, hasAnyRole, isSuperVera } = useRoles(); // roles from the new schema

  // Use a state variable to track if access check has been performed
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // Reset access check when loading states change
  useEffect(() => {
    if (authLoading || rolesLoading) {
      setAccessChecked(false);
      setHasAccess(false);
    }
  }, [authLoading, rolesLoading]);

  useEffect(() => {
    // Only perform the check once when data is loaded AND user is authenticated
    if (!authLoading && !rolesLoading && !accessChecked && user) {
      // NEW SYSTEM: Check if user has role in JWT-based roles across all organizations
      const hasNewRole = hasAnyRole(allowedRoles, requiredOrganization);

      // Allow access if user has required role OR is SuperVera (development bypass)
      const userHasAccess = hasNewRole || isSuperVera;

      setHasAccess(userHasAccess);
      setAccessChecked(true);
    }
  }, [
    authLoading,
    rolesLoading,
    allowedRoles,
    hasAnyRole,
    isSuperVera,
    requiredOrganization,
    accessChecked,
    user,
  ]);

  // Show loading state while authentication or checking is in progress
  if (authLoading || rolesLoading || !accessChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin w-6 h-6" />
      </div>
    );
  }

  // Check access and redirect if necessary
  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User has access, render children
  return <>{children}</>;
};

export default ProtectedRoute;
