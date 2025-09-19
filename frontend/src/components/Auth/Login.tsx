import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "../../config/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { CheckCircle2, InfoIcon } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import illusiaImage from "@/assets/illusiaImage.jpg";
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { fetchCurrentUserRoles } from "@/store/slices/rolesSlice";
import { toast } from "sonner";

export const Login = () => {
  const [searchParams] = useSearchParams();
  const reset = searchParams.get("reset");
  const error = searchParams.get("error");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Translation
  const { lang } = useLanguage();

  // Handle authentication state changes to properly process email/password login
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (
        (event === "SIGNED_IN" || event === "USER_UPDATED") &&
        session?.user?.app_metadata?.provider === "email"
      ) {
        try {
          // Fetch user roles
          await dispatch(fetchCurrentUserRoles()).unwrap();
          // Now navigate to storage page (or admin page if needed)
          void navigate("/storage", { replace: true });
        } catch {
          toast.error(t.login.authError[lang]);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, navigate, lang]);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      data-cy="login-root"
    >
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-[-8px] bg-cover bg-center -z-10 blur-[5px]"
        style={{
          backgroundImage: `url(${illusiaImage})`,
        }}
        data-cy="login-bg"
      />
      {/* Gradient Overlay for Better Text Readability */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-primary/40 to-secondary/30 -z-10"
        data-cy="login-gradient"
      />
      {/* Login Content */}
      <div
        className="flex min-h-screen items-center justify-center p-4"
        data-cy="login-content"
      >
        <div className="w-full max-w-md" data-cy="login-card-container">
          {/* Welcome Text */}
          <div className="text-center mb-8" data-cy="login-welcome">
            <h1
              className="text-4xl font-bold text-white drop-shadow-lg mb-2"
              data-cy="login-title"
            >
              {t.login.welcome[lang]}
            </h1>
            <p
              className="text-white/80 drop-shadow-md"
              data-cy="login-subtitle"
            >
              {t.login.subtitle[lang]}
            </p>
          </div>
          <Card
            className="w-full shadow-2xl bg-white/95 backdrop-blur-sm border-0 transform hover:scale-[1.02] transition-all duration-300"
            data-cy="login-card"
          >
            <CardHeader className="pb-4" data-cy="login-card-header">
              <CardTitle
                className="text-center text-2xl font-bold text-primary mb-2"
                data-cy="login-card-title"
              >
                {t.login.title[lang]}
              </CardTitle>
              <div
                className="w-16 h-1 bg-gradient-to-r from-secondary to-highlight2 mx-auto rounded-full"
                data-cy="login-card-divider"
              ></div>
            </CardHeader>
            <CardContent className="pt-2" data-cy="login-card-content">
              {reset === "success" && (
                <Alert
                  className="mb-4 bg-green-50 border-green-200"
                  data-cy="login-reset-success"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    {t.login.resetSuccess[lang]}
                  </AlertDescription>
                </Alert>
              )}
              {error === "expired_link" && (
                <Alert
                  className="mb-4 bg-amber-50 border-amber-200"
                  data-cy="login-expired-link"
                >
                  <InfoIcon className="h-4 w-4 text-amber-500" />
                  <AlertDescription>
                    {t.login.expiredLink[lang]}
                  </AlertDescription>
                </Alert>
              )}
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: "#2f5D9E",
                        brandAccent: "#6394d9ff",
                        brandButtonText: "white",
                        defaultButtonBackground: "#f8f9fa",
                        defaultButtonBackgroundHover: "#e9ecef",
                        defaultButtonBorder: "#dee2e6",
                        defaultButtonText: "#495057",
                        dividerBackground: "#e9ecef",
                        inputBackground: "white",
                        inputBorder: "#ced4da",
                        inputBorderHover: "#2f5D9E",
                        inputBorderFocus: "#2f5D9E",
                        inputText: "#495057",
                        inputLabelText: "#6c757d",
                        inputPlaceholder: "#adb5bd",
                        messageText: "#495057",
                        messageTextDanger: "#dc3545",
                        anchorTextColor: "#2f5D9E",
                        anchorTextHoverColor: "#6394d9ff",
                      },
                      fonts: {
                        bodyFontFamily: "var(--main-font)",
                        inputFontFamily: "var(--main-font)",
                        labelFontFamily: "var(--main-font)",
                        buttonFontFamily: "var(--main-font)",
                      },
                      borderWidths: {
                        inputBorderWidth: "1px",
                      },
                      radii: {
                        borderRadiusButton: "0.5rem",
                        buttonBorderRadius: "0.5rem",
                        inputBorderRadius: "0.5rem",
                      },
                      space: {
                        spaceSmall: "4px",
                        spaceMedium: "8px",
                        spaceLarge: "16px",
                        labelBottomMargin: "8px",
                        anchorBottomMargin: "4px",
                        emailInputSpacing: "4px",
                        socialAuthSpacing: "4px",
                        buttonPadding: "10px 15px",
                        inputPadding: "10px 15px",
                      },
                    },
                  },
                }}
                providers={["google"]}
                socialLayout="horizontal"
                view="sign_in"
                showLinks={true}
                magicLink={true}
                onlyThirdPartyProviders={false}
                localization={{
                  variables: {
                    sign_in: {
                      email_label: t.login.auth_ui.sign_in.email_label[lang],
                      email_input_placeholder:
                        t.login.auth_ui.sign_in.email_input_placeholder[lang],
                      password_label:
                        t.login.auth_ui.sign_in.password_label[lang],
                      password_input_placeholder:
                        t.login.auth_ui.sign_in.password_input_placeholder[
                          lang
                        ],
                      button_label: t.login.auth_ui.sign_in.button_label[lang],
                      social_provider_text:
                        t.login.auth_ui.sign_in.social_provider_text[lang],
                      link_text: t.login.auth_ui.sign_in.link_text[lang],
                    },
                    sign_up: {
                      email_label: t.login.auth_ui.sign_up.email_label[lang],
                      email_input_placeholder:
                        t.login.auth_ui.sign_up.email_input_placeholder[lang],
                      password_label:
                        t.login.auth_ui.sign_up.password_label[lang],
                      password_input_placeholder:
                        t.login.auth_ui.sign_up.password_input_placeholder[
                          lang
                        ],
                      button_label: t.login.auth_ui.sign_up.button_label[lang],
                      link_text: t.login.auth_ui.sign_up.link_text[lang],
                    },
                    forgotten_password: {
                      email_label:
                        t.login.auth_ui.forgotten_password.email_label[lang],
                      email_input_placeholder:
                        t.login.auth_ui.forgotten_password
                          .email_input_placeholder[lang],
                      button_label:
                        t.login.auth_ui.forgotten_password.button_label[lang],
                      link_text:
                        t.login.auth_ui.forgotten_password.link_text[lang],
                    },
                    magic_link: {
                      email_input_label:
                        t.login.auth_ui.magic_link.email_input_label[lang],
                      email_input_placeholder:
                        t.login.auth_ui.magic_link.email_input_placeholder[
                          lang
                        ],
                      button_label:
                        t.login.auth_ui.magic_link.button_label[lang],
                      link_text: t.login.auth_ui.magic_link.link_text[lang],
                    },
                  },
                }}
                data-cy="login-auth-ui"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
