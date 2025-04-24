import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabase";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for authentication session
    const handleAuthCallback = async () => {
      try {
        // Check if this is a recovery action
        const url = new URL(window.location.href);
        const error = url.searchParams.get("error");
        const errorDescription = url.searchParams.get("error_description");
        const type = url.searchParams.get("type");

        // Check hash parameters too (Supabase sometimes puts type in the hash)
        const hashParams = new URLSearchParams(url.hash.replace("#", ""));
        const hashType = hashParams.get("type");

        console.log("Auth callback URL parameters:", {
          searchParams: Object.fromEntries(url.searchParams.entries()),
          hash: url.hash,
        });

        if (error) {
          console.error("Auth error:", error, errorDescription);
          navigate(
            "/login?error=" +
              encodeURIComponent(errorDescription || "Authentication failed"),
          );
          return;
        }

        // Check if this is a password recovery flow
        const isRecovery =
          url.hash.includes("type=recovery") ||
          type === "recovery" ||
          hashType === "recovery";

        if (isRecovery) {
          // Check for access_token in hash
          const hash = url.hash;
          if (hash && hash.includes("access_token=")) {
            // For recovery with token already in hash, just redirect to password reset page
            navigate("/password-reset" + hash, { replace: true });
          } else {
            // If token is in query but not hash, rebuild it
            const token = url.searchParams.get("token");
            if (token) {
              // Construct a hash with the token for the password reset page
              navigate(`/password-reset#access_token=${token}&type=recovery`, {
                replace: true,
              });
            } else {
              toast.error("Invalid password reset link");
              navigate("/login", { replace: true });
            }
          }
          return;
        }

        // Then proceed with normal session checks
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (data?.session) {
          // For other auth flows, redirect to home or dashboard
          navigate("/");
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2 text-lg">Processing authentication...</p>
    </div>
  );
};

export default AuthCallback;
