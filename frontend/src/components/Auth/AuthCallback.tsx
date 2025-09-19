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
import { toast } from "sonner";

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
        // Normal authentication flow
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (data?.session) {
          // For all login types: Try to fetch roles with multiple attempts
          try {
            await dispatch(fetchCurrentUserRoles()).unwrap();
          } catch {
            toast.info(t.authCallback.assignedUserRole[lang]);
          }

          // Check user's active role name and redirect accordingly
          const adminRoles = ["tenant_admin", "super_admin", "storage_manager"];

          // If active role is available and it's an admin role, go to admin
          if (activeRoleName && adminRoles.includes(activeRoleName)) {
            void navigate("/admin", { replace: true });
            return;
          }

          // If no active role yet and we haven't tried too many times
          if (!activeRoleName && attemptCount < 5) {
            setAttemptCount((prev) => prev + 1);
            return;
          }

          // Default: Go to storage for regular users or if roles can't be determined
          void navigate("/storage", { replace: true });
        } else {
          void navigate("/login");
        }
      } catch {
        toast.error(t.authCallback.error[lang]);
        void navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoading) {
      void handleAuthCallback();
    }
  }, [navigate, activeRoleName, dispatch, attemptCount, isLoading, lang]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2 text-lg">{t.authCallback.processing[lang]}</p>
    </div>
  );
};

export default AuthCallback;
