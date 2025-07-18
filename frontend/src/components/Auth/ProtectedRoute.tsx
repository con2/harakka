import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import {
  selectSelectedUser,
  selectSelectedUserLoading,
} from "@/store/slices/usersSlice";
import { ReactNode, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  requiredOrganization?: string;
  requireSuperVera?: boolean;
}

const ProtectedRoute = ({
  children,
  allowedRoles = [],
  requiredOrganization,
}: ProtectedRouteProps) => {
  const { authLoading } = useAuth(); // wait for supabase auth to finish
  const { loading: rolesLoading, hasAnyRole, isSuperVera } = useRoles(); //roles from the new schema
  const selectedUser = useAppSelector(selectSelectedUser); // pull profile from redux
  const userLoading = useAppSelector(selectSelectedUserLoading);

  // Use a state variable to track if access check has been performed
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Only perform the check once when data is loaded
    if (
      !authLoading &&
      !userLoading &&
      !rolesLoading &&
      selectedUser &&
      !accessChecked
    ) {
      // OLD SYSTEM: Check if user has role in selectedUser.role
      const hasOldRole = allowedRoles.includes(selectedUser.role || "");

      // NEW SYSTEM: Check if user has role in JWT-based roles
      const hasNewRole = hasAnyRole(allowedRoles, requiredOrganization);

      // Allow access if user has required role in EITHER system OR is SuperVera
      const userHasAccess = hasOldRole || hasNewRole || isSuperVera;

      setHasAccess(userHasAccess);
      setAccessChecked(true);
    }
  }, [
    authLoading,
    userLoading,
    rolesLoading,
    selectedUser,
    allowedRoles,
    hasAnyRole,
    isSuperVera,
    requiredOrganization,
    accessChecked,
  ]);

  // Show loading state while authentication or checking is in progress
  if (authLoading || userLoading || rolesLoading || !accessChecked) {
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
