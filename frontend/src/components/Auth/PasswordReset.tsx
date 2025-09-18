import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "../../config/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const PasswordReset = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  // Translation
  const { lang } = useLanguage();

  // Extract token from both URL search params and hash
  useEffect(() => {
    const extractToken = () => {
      const tokenFromQuery = searchParams.get("token");
      const type = searchParams.get("type");

      if (!tokenFromQuery || type !== "recovery") {
        setError(
          "Invalid or missing tokens. Please request a new password reset link.",
        );
        return;
      }

      setRecoveryToken(tokenFromQuery);
    };

    extractToken();
  }, [searchParams]);

  useEffect(() => {
    const formSubmitListener = () => {
      const formElement = document.querySelector("form");
      if (formElement) {
        formElement.addEventListener("submit", async (e) => {
          e.preventDefault();

          setError(null);
          setIsSubmitting(true);

          try {
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

            if (!recoveryToken) {
              setError(
                "No valid session found. Please try resetting your password again.",
              );
              return;
            }

            const { error } = await supabase.auth.updateUser({
              password: newPassword,
            });

            if (error) {
              setError(error.message);
              setIsSubmitting(false);
              return;
            }

            void navigate("/password-reset-success", { replace: true });
          } catch (error) {
            console.error("Error during password update:", error);
            setError("An unexpected error occurred");
            setIsSubmitting(false);
          }
        });
      }
    };

    const timer = setTimeout(formSubmitListener, 1500);
    return () => clearTimeout(timer);
  }, [navigate, recoveryToken]);

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
