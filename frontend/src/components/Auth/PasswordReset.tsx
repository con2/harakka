import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "../../config/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const PasswordReset = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialToken] = useState(location.hash || "");
  const [hasLoaded, setHasLoaded] = useState(false);
  const formSubmittedRef = useRef(false);
  // Add states to manage loading and errors
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Translation
  const { lang } = useLanguage();

  useEffect(() => {
    // Ensure we're not authenticated when on password reset page
    const ensureSignedOut = async () => {
      try {
        // Force sign out when on password reset page
        await supabase.auth.signOut({ scope: "local" });
      } catch (error) {
        console.error("Error during forced logout for password reset:", error);
      }
    };

    void ensureSignedOut();
  }, []); // Run only once on component mount

  useEffect(() => {
    // Set a small delay to ensure component is fully loaded
    const timer = setTimeout(() => {
      setHasLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // Watch for PASSWORD_RECOVERY or USER_UPDATED events
      if (["PASSWORD_RECOVERY", "USER_UPDATED"].includes(event)) {
        if (!hasLoaded) {
          return;
        }

        // Only redirect after form is submitted and we get confirmation
        if (formSubmittedRef.current) {
          // Add a small delay to ensure password update completes
          setTimeout(() => {
            void navigate("/password-reset-success", { replace: true });
          }, 1000);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.hash, initialToken, hasLoaded]);

  useEffect(() => {
    // Form submission handler
    const formSubmitListener = () => {
      const formElement = document.querySelector("form");
      if (formElement) {
        formElement.addEventListener("submit", async (e) => {
          e.preventDefault(); // Prevent the default Auth UI submission

          // Clear previous errors and set submitting state
          setError(null);
          setIsSubmitting(true);

          try {
            // Get the password from the form
            const newPassword = (
              document.querySelector(
                'input[type="password"]',
              ) as HTMLInputElement
            )?.value;

            if (!newPassword) {
              setError("Password field not found or empty");
              setIsSubmitting(false);
              return;
            }

            // Mark as submitted for our tracking
            formSubmittedRef.current = true;

            // Get token from hash
            const hashParams = new URLSearchParams(
              location.hash.replace("#", ""),
            );
            const accessToken = hashParams.get("access_token");

            if (!accessToken) {
              setError("No access token found in URL");
              setIsSubmitting(false);
              return;
            }

            // Use the Supabase REST API directly instead of the JS client for password reset
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                  apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                },
                body: JSON.stringify({
                  password: newPassword,
                }),
              },
            );

            if (!response.ok) {
              const errorData = await response.json();
              setError(errorData.message || "Error updating password");
              setIsSubmitting(false);
              return;
            }

            // Success - navigate to success page
            // Keep isSubmitting true to show loading state until navigation
            void navigate("/password-reset-success", { replace: true });
          } catch (error) {
            console.error("Error during password update:", error);
            setError("An unexpected error occurred");
            setIsSubmitting(false);
          }
        });
      }
    };

    // Set a small delay to ensure the Auth UI has rendered
    const timer = setTimeout(formSubmitListener, 1500);
    return () => clearTimeout(timer);
  }, [navigate, location.hash]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            {t.passwordReset.title[lang]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {isSubmitting ? (
            <div className="flex flex-col items-center justify-center py-8">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-center text-muted-foreground">
                {t.passwordReset.updating[lang]}
              </p>
            </div>
          ) : (
            <Auth
              supabaseClient={supabase}
              view="update_password"
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "#2f5D9E",
                      brandAccent: "#267C6F",
                    },
                    fonts: {
                      bodyFontFamily: "var(--main-font)",
                      inputFontFamily: "var(--main-font)",
                      labelFontFamily: "var(--main-font)",
                      buttonFontFamily: "var(--main-font)",
                    },
                  },
                },
              }}
              queryParams={{
                disableAutoLogin: "true",
              }}
              localization={{
                variables: {
                  update_password: {
                    password_label:
                      t.passwordReset.auth_ui.password_label[lang],
                    password_input_placeholder:
                      t.passwordReset.auth_ui.password_input_placeholder[lang],
                    button_label: t.passwordReset.auth_ui.button_label[lang],
                  },
                },
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordReset;
