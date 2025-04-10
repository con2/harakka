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

  if (!selectedUser || !allowedRoles.includes(selectedUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
