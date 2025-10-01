import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/config/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import hero from "@/assets/hero.jpg";

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
      // Check query parameters first
      let tokenFromQuery = searchParams.get("token");
      let type = searchParams.get("type");

      // If not found in query params, check hash fragment
      if (!tokenFromQuery || !type) {
        const hashParams = new URLSearchParams(window.location.hash.slice(1)); // Remove the '#' and parse
        tokenFromQuery = hashParams.get("access_token");
        type = hashParams.get("type");
      }

      if (!tokenFromQuery || type !== "recovery") {
        setError(t.passwordReset.errors.invalidSession[lang]);
        return;
      }

      setRecoveryToken(tokenFromQuery);
    };

    extractToken();
  }, [searchParams, lang]);

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
              setError(t.passwordReset.errors.noPassword[lang]);
              setIsSubmitting(false);
              return;
            }

            if (!recoveryToken) {
              setError(t.passwordReset.errors.invalidSession[lang]);
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

            void navigate("/login", {
              replace: true,
              state: {
                message: t.login.resetSuccess,
              },
            });
          } catch (error) {
            console.error("Error during password update:", error);
            setError(t.passwordReset.errors.unknownError[lang]);
            setIsSubmitting(false);
          }
        });
      }
    };

    const timer = setTimeout(formSubmitListener, 1500);
    return () => clearTimeout(timer);
  }, [navigate, recoveryToken]); //eslint-disable-line

  useEffect(() => {
    const handler = () => setError(null);

    const observer = new MutationObserver(() => {
      const passwordInput = document.querySelector('input[type="password"]');
      if (passwordInput) {
        passwordInput.addEventListener("input", handler);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      const passwordInput = document.querySelector('input[type="password"]');
      if (passwordInput) {
        passwordInput.removeEventListener("input", handler);
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen relative items-center justify-center p-4 pb-0">
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
      <div
        className="absolute inset-[-8px] bg-cover bg-center -z-10 h-full filter brightness-[0.6] bg-left top-0 scale-[1.01]"
        style={{
          backgroundImage: `url(${hero})`,
        }}
      />
    </div>
  );
};

export default PasswordReset;
