import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { selectSelectedUser } from "@/store/slices/usersSlice";
import { useAuth } from "@/context/AuthContext";
import { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { authLoading } = useAuth(); // wait for supabase auth to finish
  const selectedUser = useAppSelector(selectSelectedUser); // pull profile from redux

  if (authLoading) {
    // still loading auth
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle />
      </div>
    );
  }

  // If the user is not logged in (selectedUser is null), allow access to public pages
  if (!selectedUser) {
    return <Navigate to="/" replace />; // Redirect to public landing page if not logged in
  }

  // Check if user has the appropriate role
  const userRole = selectedUser.role;

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
