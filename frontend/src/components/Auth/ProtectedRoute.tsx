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

  if (!selectedUser || !allowedRoles.includes(selectedUser.role)) {
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

  // Check role-based access
  if (allowedRoles.length > 0) {
    const hasRequiredRole = hasAnyRole(allowedRoles, requiredOrganization);

    if (!hasRequiredRole && !isSuperVera) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
