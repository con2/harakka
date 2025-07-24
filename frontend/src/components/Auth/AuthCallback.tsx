import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabase";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for authentication session
    const handleAuthCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const hashParams = new URLSearchParams(url.hash.replace("#", ""));
        console.log("url in auth callback: ", url);

        // Check if this is a recovery flow FIRST before any other auth handling
        const isRecovery =
          url.hash.includes("type=recovery") ||
          hashParams.get("type") === "recovery" ||
          url.searchParams.get("type") === "recovery";

        if (isRecovery) {
          // Clear any existing auth state
          localStorage.removeItem("userId");
          sessionStorage.clear();

          // Get token from hash
          const accessToken = hashParams.get("access_token");

          if (accessToken) {
            // Navigate directly to password reset page
            void navigate(
              `/password-reset#access_token=${accessToken}&type=recovery`,
              {
                replace: true,
              },
            );
            return;
          }
        }

        // Then proceed with normal session checks
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (data?.session) {
          // For other auth flows, redirect to home or dashboard
          void navigate("/");
        } else {
          void navigate("/login");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        void navigate("/login");
      }
    };

    void handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2 text-lg">Processing authentication...</p>
    </div>
  );
};

export default AuthCallback;
