import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const AuthRedirect = () => {
  const { user, authLoading } = useAuth();
  const {
    hasRole,
    hasAnyRole,
    loading: rolesLoading,
    currentUserRoles,
  } = useRoles();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTriggered = useRef(false);

  const isAnyTypeOfAdmin = hasAnyRole([
    "admin",
    "superVera",
    "main_admin",
    "super_admin",
    "store_manager",
  ]);

  useEffect(() => {
    // Only redirect if:
    // 1. User and roles are loaded
    // 2. We're on the login page or root page (suggesting fresh login)
    // 3. Haven't already triggered a redirect
    const hasRoleData = currentUserRoles && currentUserRoles.length > 0;
    const dataReady = user && !authLoading && !rolesLoading && hasRoleData;

    // Only redirect if on login or root page
    const shouldRedirect =
      dataReady &&
      !redirectTriggered.current &&
      (location.pathname === "/login" || location.pathname === "/");

    if (shouldRedirect) {
      // Small timeout to ensure state is fully updated
      setTimeout(() => {
        redirectTriggered.current = true;

        // Use isAnyTypeOfAdmin for admin check
        if (isAnyTypeOfAdmin) {
          void navigate("/admin");
        } else if (hasRole("user") || hasRole("requester")) {
          void navigate("/storage");
        } else {
          void navigate("/storage");
        }
      }, 100);
    }
  }, [
    user,
    authLoading,
    rolesLoading,
    currentUserRoles,
    isAnyTypeOfAdmin,
    hasRole,
    navigate,
    location.pathname,
  ]);

  return null;
};
