import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const AuthRedirect = () => {
  const { user, authLoading } = useAuth();
  const {
    loading: rolesLoading,
    currentUserRoles,
    hasRole,
    hasAnyRole,
    activeContext,
  } = useRoles();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTriggered = useRef(false);

  useEffect(() => {
    // Only redirect if:
    // 1. User and roles are loaded
    // 2. We're on the login page or root page (suggesting fresh login)
    // 3. Haven't already triggered a redirect
    const hasRoleData = currentUserRoles && currentUserRoles.length > 0;
    const dataReady = user && !authLoading && !rolesLoading && hasRoleData;
    const isEntry = location.pathname === "/login" || location.pathname === "/";

    if (!dataReady || !isEntry || redirectTriggered.current) return;

    // Evaluate admin after roles are ready to avoid early false
    const isAnyTypeOfAdmin = hasAnyRole([
      "tenant_admin",
      "super_admin",
      "storage_manager",
    ]);

    setTimeout(() => {
      redirectTriggered.current = true;
      if (isAnyTypeOfAdmin) {
        void navigate("/admin");
      } else if (hasRole("user") || hasRole("requester")) {
        void navigate("/storage");
      } else {
        void navigate("/storage");
      }
    }, 50);
  }, [
    user,
    authLoading,
    rolesLoading,
    currentUserRoles,
    hasRole,
    hasAnyRole,
    navigate,
    location.pathname,
    activeContext,
  ]);

  return null;
};
