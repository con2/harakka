import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import {
  selectSelectedUser,
  selectSelectedUserLoading,
} from "@/store/slices/usersSlice";
import { ReactNode } from "react";
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
  requireSuperVera = false,
}: ProtectedRouteProps) => {
  const { authLoading } = useAuth(); // wait for supabase auth to finish
  const {
    loading: rolesLoading,
    error: rolesError,
    hasAnyRole,
    isSuperVera,
  } = useRoles(); //roles from the new schema
  const selectedUser = useAppSelector(selectSelectedUser); // pull profile from redux
  const userLoading = useAppSelector(selectSelectedUserLoading);

  if (authLoading || userLoading || !selectedUser || rolesLoading) {
    // Wait for auth, roles and user loading to finish
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin w-6 h-6" />
      </div>
    );
  }

  if (
    !selectedUser ||
    !selectedUser.role ||
    !allowedRoles.includes(selectedUser.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Handle role loading errors
  if (rolesError) {
    console.error("Role authorization error:", rolesError);
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if SuperVera is required
  if (requireSuperVera && !isSuperVera) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check role-based access using BOTH old and new systems
  if (allowedRoles.length > 0) {
    // OLD SYSTEM: Check if user has role in selectedUser.role
    const hasOldRole = selectedUser.role
      ? allowedRoles.includes(selectedUser.role)
      : false;

    // NEW SYSTEM: Check if user has role in JWT-based roles
    const hasNewRole = hasAnyRole(allowedRoles, requiredOrganization);

    // Allow access if user has required role in EITHER system OR is SuperVera
    const hasAccess = hasOldRole || hasNewRole || isSuperVera;

    // Debug logging (remove later)
    console.log("🔍 Role Check Debug:", {
      allowedRoles,
      oldRole: selectedUser.role,
      hasOldRole,
      hasNewRole,
      isSuperVera,
      hasAccess,
      requiredOrganization,
    });

    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
