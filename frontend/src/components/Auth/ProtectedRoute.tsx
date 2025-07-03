import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import {
  selectSelectedUser,
  selectSelectedUserLoading,
} from "@/store/slices/usersSlice";
import { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { authLoading } = useAuth(); // wait for supabase auth to finish
  const selectedUser = useAppSelector(selectSelectedUser); // pull profile from redux
  const userLoading = useAppSelector(selectSelectedUserLoading);

  if (authLoading || userLoading || !selectedUser) {
    // Wait for auth and user loading to finish
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin w-6 h-6" />
      </div>
    );
  }

  if (!selectedUser || !allowedRoles.includes(selectedUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
