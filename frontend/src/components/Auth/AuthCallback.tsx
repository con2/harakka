import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabase";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../translations";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectActiveRoleName,
  fetchCurrentUserRoles,
} from "@/store/slices/rolesSlice";

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const activeRoleName = useAppSelector(selectActiveRoleName);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for authentication session
    const handleAuthCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const hashParams = new URLSearchParams(url.hash.replace("#", ""));

        // Normal authentication flow
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (data?.session) {
          const isEmailPassword =
            !hashParams.get("provider") &&
            !url.searchParams.get("provider") &&
            data.session.user?.app_metadata?.provider === "email";

          console.log(
            `Auth login type: ${isEmailPassword ? "Email/Password" : "OAuth"}`,
          );

          // For all login types: Try to fetch roles with multiple attempts
          try {
            await dispatch(fetchCurrentUserRoles()).unwrap();
            console.log("Roles fetched successfully");
          } catch (err) {
            console.warn("Failed to fetch roles in auth callback:", err);
          }

          // Check user's active role name and redirect accordingly
          const adminRoles = ["tenant_admin", "super_admin", "storage_manager"];

          // If active role is available and it's an admin role, go to admin
          if (activeRoleName && adminRoles.includes(activeRoleName)) {
            console.log(
              `Admin role detected (${activeRoleName}), navigating to admin panel`,
            );
            void navigate("/admin", { replace: true });
            return;
          }

          // If no active role yet and we haven't tried too many times
          if (!activeRoleName && attemptCount < 5) {
            console.log(`No role detected yet, attempt ${attemptCount + 1}/5`);
            setAttemptCount((prev) => prev + 1);
            return; // This will trigger another effect run
          }

          // Default: Go to storage for regular users or if roles can't be determined
          console.log("Navigating to storage as default destination");
          void navigate("/storage", { replace: true });
        } else {
          void navigate("/login");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        void navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoading) {
      void handleAuthCallback();
    }
  }, [navigate, activeRoleName, dispatch, attemptCount, isLoading]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2 text-lg">{t.authCallback.processing[lang]}</p>
    </div>
  );
};

export default AuthCallback;
