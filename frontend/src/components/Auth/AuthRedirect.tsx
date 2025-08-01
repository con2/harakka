import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const AuthRedirect = () => {
  const { user } = useAuth();
  const {
    hasRole,
    isAdmin,
    isSuperAdmin,
    isSuperVera,
    loading: rolesLoading,
  } = useRoles();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTriggered = useRef(false);

  useEffect(() => {
    // Only redirect if:
    // 1. User and roles are loaded
    // 2. We're on the login page or root page (suggesting fresh login)
    // 3. Haven't already triggered a redirect
    if (
      user &&
      !rolesLoading &&
      !redirectTriggered.current &&
      (location.pathname === "/login" || location.pathname === "/")
    ) {
      redirectTriggered.current = true;

      // Check if user has admin privileges
      if (isAdmin || isSuperAdmin || isSuperVera) {
        void navigate("/admin"); // redirect to Admin Panel for admin users
      } else if (hasRole("user") || hasRole("requester")) {
        void navigate("/storage"); // redirect to Storage Page for regular users
      } else {
        // Fallback: if no specific role found, redirect to storage page
        void navigate("/storage");
      }
    }
  }, [
    user,
    rolesLoading,
    hasRole,
    isAdmin,
    isSuperAdmin,
    isSuperVera,
    navigate,
    location.pathname,
  ]);

  return null;
};
