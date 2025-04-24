import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "../../config/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PasswordReset = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialToken] = useState(location.hash || "");
  const [hasLoaded, setHasLoaded] = useState(false);
  const formSubmittedRef = useRef(false);

  useEffect(() => {
    // Set a small delay to ensure component is fully loaded
    const timer = setTimeout(() => {
      setHasLoaded(true);
      console.log("Component fully loaded, ready to handle auth events");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log("Setting up auth state change listener");

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change event:", event);
      console.log("Session:", session);
      console.log("Location hash:", location.hash);
      console.log("Initial token:", initialToken);
      console.log("Form submitted:", formSubmittedRef.current);

      // If we detect any of these events after form submission or page load,
      // we consider it a successful password reset
      if (
        [
          "PASSWORD_RECOVERY",
          "SIGNED_IN",
          "SIGNED_OUT",
          "TOKEN_REFRESHED",
          "USER_UPDATED",
        ].includes(event)
      ) {
        if (!hasLoaded) {
          console.log("Ignoring initial auth event");
          return;
        }

        if (formSubmittedRef.current || (!location.hash && initialToken)) {
          console.log(
            `Password reset successful (${event}), navigating to success page`,
          );
          // Navigate to success page
          navigate("/password-reset-success", { replace: true });
        }
      }
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate, location.hash, initialToken, hasLoaded]);

  // Listen for form submission
  const formSubmitListener = () => {
    const formElement = document.querySelector("form");
    if (formElement) {
      formElement.addEventListener("submit", (e) => {
        console.log("Form submitted!");
        e.preventDefault();
        formSubmittedRef.current = true;
        // Add a direct success timeout as backup
        setTimeout(() => {
          if (document.location.pathname !== "/password-reset-success") {
            console.log("Backup redirect timer triggered");
            navigate("/password-reset-success", { replace: true });
          }
        }, 300);
      });
    }
  };

  useEffect(() => {
    // Set a small delay to ensure the Auth UI has rendered
    const timer = setTimeout(formSubmitListener, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            view="update_password"
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#9537c7",
                    brandAccent: "#44195b",
                  },
                },
              },
            }}
            redirectTo={`${window.location.origin}/password-reset-success`}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordReset;
