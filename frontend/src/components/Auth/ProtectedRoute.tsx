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
  const { loading: rolesLoading, hasRoleInContext, activeContext } = useRoles();

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
      // Check if user has any of the allowed roles in current context
      const userHasAccess = allowedRoles.some((role) =>
        hasRoleInContext(role, requiredOrganization),
      );

      setHasAccess(userHasAccess);
      setAccessChecked(true);
    }
  }, [
    authLoading,
    rolesLoading,
    allowedRoles,
    hasRoleInContext,
    requiredOrganization,
    accessChecked,
    user,
    activeContext,
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
