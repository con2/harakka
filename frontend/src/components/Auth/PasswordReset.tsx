import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "../../config/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const PasswordReset = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const formSubmittedRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  //const [hasLoaded, setHasLoaded] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  // Translation
  const { lang } = useLanguage();

  // Extract token from both URL search params and hash
  useEffect(() => {
    const extractToken = () => {
      console.log("[DEBUG] Current location:", location.href);

      // // Extract token from query parameters
      const tokenFromQuery = searchParams.get("access_token");
      console.log("[DEBUG] Token from query params:", tokenFromQuery);

      if (tokenFromQuery) {
        setRecoveryToken(
          "eyJhbGciOiJIUzI1NiIsImtpZCI6ImNoeFdPR3lnU0pRUUZUS28iLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3JjYmRka2h2eXNleGt2Z3FwY3VkLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIyNzJmZjlhYy0xZDJjLTQzZjItODU2NC1kZGUyZDM1MmFlZGEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU4MjA2MjQzLCJpYXQiOjE3NTgyMDI2NDMsImVtYWlsIjoiZXJtZWdpbGl1c0BnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJsYXN0X3JvbGVfc3luYyI6IjIwMjUtMDktMThUMDk6MDk6MzIuMzkyWiIsInByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiLCJnb29nbGUiXSwicmVmcmVzaF9yZXF1aXJlZCI6IjE3NTMxOTYzODQuOTA2MDgxIiwicm9sZV9jb3VudCI6Niwicm9sZXMiOlt7ImFzc2lnbmVkX2F0IjoiMjAyNS0wOC0yMVQwOTo0MDoyMS4xNjkzMTcrMDA6MDAiLCJhc3NpZ25tZW50X3VwZGF0ZWRfYXQiOiIyMDI1LTA4LTIxVDA5OjQwOjIxLjE2OTMxNyswMDowMCIsImlkIjoiOTgxOWEzMTItOGNjNy00ODM3LWFmM2EtZTMwZDQ3Yjk1NzY3IiwiaXNfYWN0aXZlIjp0cnVlLCJvcmdhbml6YXRpb25faWQiOiI1MWY1ZmQyZi05YjEzLTQ3ZGQtYjUxZi01MzljN2VmNGYzNDUiLCJvcmdhbml6YXRpb25faXNfYWN0aXZlIjp0cnVlLCJvcmdhbml6YXRpb25fbmFtZSI6Ik9yZyBBIiwicm9sZV9pZCI6IjcwMGI3ZjhkLWJlNzktNDc0ZS1iNTU0LTY4ODZhMzYwNTI3NyIsInJvbGVfbmFtZSI6InRlbmFudF9hZG1pbiIsInVzZXJfZW1haWwiOiJlcm1lZ2lsaXVzQGdtYWlsLmNvbSIsInVzZXJfZnVsbF9uYW1lIjoiVmxhZGltaXIgQmVsaWFrb3YiLCJ1c2VyX2lkIjoiMjcyZmY5YWMtMWQyYy00M2YyLTg1NjQtZGRlMmQzNTJhZWRhIiwidXNlcl9waG9uZSI6IisxMTIzIDY1MzYgNTMyMSIsInVzZXJfdmlzaWJsZV9uYW1lIjoiVm92YSJ9LHsiYXNzaWduZWRfYXQiOiIyMDI1LTA3LTIyVDE0OjUwOjM1LjIzNjk5OCswMDowMCIsImFzc2lnbm1lbnRfdXBkYXRlZF9hdCI6IjIwMjUtMDgtMDhUMDY6MjM6MTcuMjcxMjY0KzAwOjAwIiwiaWQiOiI4NDM3YjA1Ny1iYmIxLTQyNzItYjhjNC04ZjUyNmQxNWU2N2YiLCJpc19hY3RpdmUiOnRydWUsIm9yZ2FuaXphdGlvbl9pZCI6IjRiM2MwMDc5LTc2OTQtNGM1ZC04ODI0LWViZWNjYjE1NDFkOCIsIm9yZ2FuaXphdGlvbl9pc19hY3RpdmUiOnRydWUsIm9yZ2FuaXphdGlvbl9uYW1lIjoiT3JnIEQiLCJyb2xlX2lkIjoiMzVmZWVhNTYtYjBhNi00MDExLWIwOWYtODVjYjZmNjcyN2YzIiwicm9sZV9uYW1lIjoic3RvcmFnZV9tYW5hZ2VyIiwidXNlcl9lbWFpbCI6ImVybWVnaWxpdXNAZ21haWwuY29tIiwidXNlcl9mdWxsX25hbWUiOiJWbGFkaW1pciBCZWxpYWtvdiIsInVzZXJfaWQiOiIyNzJmZjlhYy0xZDJjLTQzZjItODU2NC1kZGUyZDM1MmFlZGEiLCJ1c2VyX3Bob25lIjoiKzExMjMgNjUzNiA1MzIxIiwidXNlcl92aXNpYmxlX25hbWUiOiJWb3ZhIn0seyJhc3NpZ25lZF9hdCI6IjIwMjUtMDktMThUMDk6MDk6MzQuMzkxNjg1KzAwOjAwIiwiYXNzaWdubWVudF91cGRhdGVkX2F0IjoiMjAyNS0wOS0xOFQwOTowOTozNC4zOTE2ODUrMDA6MDAiLCJpZCI6ImNkZTVjOWFmLTIxYTktNDBhYi1hMDBhLWY1NmU0OTgyNmZiMiIsImlzX2FjdGl2ZSI6dHJ1ZSwib3JnYW5pemF0aW9uX2lkIjoiMzY4MjEyYzctZWE5YS00M2IxLTkyN2MtOGYxOWY0MjUzMTA0Iiwib3JnYW5pemF0aW9uX2lzX2FjdGl2ZSI6dHJ1ZSwib3JnYW5pemF0aW9uX25hbWUiOiJXaGFhYWFhdCIsInJvbGVfaWQiOiIzNWZlZWE1Ni1iMGE2LTQwMTEtYjA5Zi04NWNiNmY2NzI3ZjMiLCJyb2xlX25hbWUiOiJzdG9yYWdlX21hbmFnZXIiLCJ1c2VyX2VtYWlsIjoiZXJtZWdpbGl1c0BnbWFpbC5jb20iLCJ1c2VyX2Z1bGxfbmFtZSI6IlZsYWRpbWlyIEJlbGlha292IiwidXNlcl9pZCI6IjI3MmZmOWFjLTFkMmMtNDNmMi04NTY0LWRkZTJkMzUyYWVkYSIsInVzZXJfcGhvbmUiOiIrMTEyMyA2NTM2IDUzMjEiLCJ1c2VyX3Zpc2libGVfbmFtZSI6IlZvdmEifSx7ImFzc2lnbmVkX2F0IjoiMjAyNS0wOC0wOFQwNjoyMjo1Ny44MzgzNTgrMDA6MDAiLCJhc3NpZ25tZW50X3VwZGF0ZWRfYXQiOiIyMDI1LTA4LTIxVDA3OjE0OjQzLjYwNDkyKzAwOjAwIiwiaWQiOiIwZTg2MTk1Yi1hNDUzLTQ1MWYtOTc0OS04NTY5MDU2NDVlNTAiLCJpc19hY3RpdmUiOnRydWUsIm9yZ2FuaXphdGlvbl9pZCI6ImUyNjRmZGU0LTU2MjQtNGZlMS1hNjgzLTg4MDcwZjRkNzhlOCIsIm9yZ2FuaXphdGlvbl9pc19hY3RpdmUiOnRydWUsIm9yZ2FuaXphdGlvbl9uYW1lIjoiT3JnIEMiLCJyb2xlX2lkIjoiNzAwYjdmOGQtYmU3OS00NzRlLWI1NTQtNjg4NmEzNjA1Mjc3Iiwicm9sZV9uYW1lIjoidGVuYW50X2FkbWluIiwidXNlcl9lbWFpbCI6ImVybWVnaWxpdXNAZ21haWwuY29tIiwidXNlcl9mdWxsX25hbWUiOiJWbGFkaW1pciBCZWxpYWtvdiIsInVzZXJfaWQiOiIyNzJmZjlhYy0xZDJjLTQzZjItODU2NC1kZGUyZDM1MmFlZGEiLCJ1c2VyX3Bob25lIjoiKzExMjMgNjUzNiA1MzIxIiwidXNlcl92aXNpYmxlX25hbWUiOiJWb3ZhIn0seyJhc3NpZ25lZF9hdCI6IjIwMjUtMDgtMjFUMDc6MTc6MDcuMjQ0MjUrMDA6MDAiLCJhc3NpZ25tZW50X3VwZGF0ZWRfYXQiOiIyMDI1LTA4LTIxVDA5OjM5OjMwLjU0MDQ2MyswMDowMCIsImlkIjoiMjU2NTM0NWItYzEzZi00ZGJhLTlhYTUtM2Q2ZmRkZTYxZjg0IiwiaXNfYWN0aXZlIjp0cnVlLCJvcmdhbml6YXRpb25faWQiOiIwMzYwYmU0Zi0yZWExLTRiODktOTYwZC1jZmY4ODhmYjc0NzUiLCJvcmdhbml6YXRpb25faXNfYWN0aXZlIjp0cnVlLCJvcmdhbml6YXRpb25fbmFtZSI6IkhpZ2ggY291bmNpbCIsInJvbGVfaWQiOiI4NjIzNDU2OS00M2U5LTRhMTgtODNjZi1mODU4NGQ4NGE3NTIiLCJyb2xlX25hbWUiOiJzdXBlcl9hZG1pbiIsInVzZXJfZW1haWwiOiJlcm1lZ2lsaXVzQGdtYWlsLmNvbSIsInVzZXJfZnVsbF9uYW1lIjoiVmxhZGltaXIgQmVsaWFrb3YiLCJ1c2VyX2lkIjoiMjcyZmY5YWMtMWQyYy00M2YyLTg1NjQtZGRlMmQzNTJhZWRhIiwidXNlcl9waG9uZSI6IisxMTIzIDY1MzYgNTMyMSIsInVzZXJfdmlzaWJsZV9uYW1lIjoiVm92YSJ9LHsiYXNzaWduZWRfYXQiOiIyMDI1LTA4LTIxVDA3OjE1OjQ1Ljc5NTQwNyswMDowMCIsImFzc2lnbm1lbnRfdXBkYXRlZF9hdCI6IjIwMjUtMDgtMjFUMDc6MTU6NDUuNzk1NDA3KzAwOjAwIiwiaWQiOiIxMTkwMWZjOS1kMzYyLTRjYWItYWU4ZC03MDE1NzBhNjRjMDUiLCJpc19hY3RpdmUiOnRydWUsIm9yZ2FuaXphdGlvbl9pZCI6IjJhNDJkMzMzLWE1NTAtNDkzZi04NzZlLWEyY2VhM2M4MGQyNiIsIm9yZ2FuaXphdGlvbl9pc19hY3RpdmUiOnRydWUsIm9yZ2FuaXphdGlvbl9uYW1lIjoiR2xvYmFsIiwicm9sZV9pZCI6IjE2NjNkOWYwLTdiMWUtNDE3ZC05MzQ5LTRmMmUxOWI2ZDFlOCIsInJvbGVfbmFtZSI6InVzZXIiLCJ1c2VyX2VtYWlsIjoiZXJtZWdpbGl1c0BnbWFpbC5jb20iLCJ1c2VyX2Z1bGxfbmFtZSI6IlZsYWRpbWlyIEJlbGlha292IiwidXNlcl9pZCI6IjI3MmZmOWFjLTFkMmMtNDNmMi04NTY0LWRkZTJkMzUyYWVkYSIsInVzZXJfcGhvbmUiOiIrMTEyMyA2NTM2IDUzMjEiLCJ1c2VyX3Zpc2libGVfbmFtZSI6IlZvdmEifV19LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhcl91cmwiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLUUQxU192MXR4anpiUXBKb3E1N3BBaVNVR0lpdDJyeDJDUGRVeTJTOVVqenI5LVE9czk2LWMiLCJlbWFpbCI6ImVybWVnaWxpdXNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IlZsYWRpbWlyIEJlbGlha292IiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibmFtZSI6IlZsYWRpbWlyIEJlbGlha292IiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS1FEMVNfdjF0eGp6YlFwSm9xNTdwQWlTVUdJaXQycngyQ1BkVXkyUzlVanpyOS1RPXM5Ni1jIiwicHJvdmlkZXJfaWQiOiIxMDQxMjA1NDA5NDg5NTU2MDYyNjAiLCJzdWIiOiIxMDQxMjA1NDA5NDg5NTU2MDYyNjAifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc1ODIwMjY0M31dLCJzZXNzaW9uX2lkIjoiYjQ3MzQxNDctMDVkMi00MThiLThlMzYtMTEyMTM5OWQ4OGVlIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.t754P3UjlSRGr3DChqVTtqX3QVonBW2A0SQsNE1CCtQ",
        );
      } else {
        setError(
          "No recovery token found. Please request a new password reset link.",
        );
      }
    };

    extractToken();
  }, [location, searchParams]);

  // // Sign out immediately to prevent auto-login
  // useEffect(() => {
  //   const ensureSignedOut = async () => {
  //     try {
  //       await supabase.auth.signOut({ scope: "global" });
  //     } catch (error) {
  //       console.error("Error during forced logout for password reset:", error);
  //     }
  //   };

  //   void ensureSignedOut();
  // }, []);

  // useEffect(() => {
  //   // Set a small delay to ensure component is fully loaded
  //   const timer = setTimeout(() => {
  //     setHasLoaded(true);
  //   }, 1000);

  //   return () => clearTimeout(timer);
  // }, []);

  // Form submission handler
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

            formSubmittedRef.current = true;

            if (!recoveryToken) {
              setError("No access token found in URL");
              setIsSubmitting(false);
              return;
            }

            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${recoveryToken}`,
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
