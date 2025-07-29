import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthRedirect = () => {
  const { user } = useAuth();
  const { hasRole, isAdmin, isSuperVera } = useRoles();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Check if user has admin privileges (admin role or superVera)
      if (isAdmin || isSuperVera) {
        void navigate("/admin"); // redirect to Admin Panel for admin users
      } else if (hasRole("user")) {
        void navigate("/"); // redirect to Landing Page for regular users
      } else {
        // Fallback: if no specific role found, redirect to landing page
        void navigate("/");
      }
    }
  }, [user, hasRole, isAdmin, isSuperVera, navigate]);

  return null;
};
