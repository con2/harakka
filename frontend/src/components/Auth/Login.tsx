import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "../../config/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { CheckCircle2, InfoIcon } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
//import LoginTest from "./LoginTest"; // Import the test component

export const Login = () => {
  const [searchParams] = useSearchParams();
  const reset = searchParams.get("reset");
  const error = searchParams.get("error");

  // Translation
  const { lang } = useLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            {t.login.title[lang]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reset === "success" && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>{t.login.resetSuccess[lang]}</AlertDescription>
            </Alert>
          )}

          {error === "expired_link" && (
            <Alert className="mb-4 bg-amber-50 border-amber-200">
              <InfoIcon className="h-4 w-4 text-amber-500" />
              <AlertDescription>{t.login.expiredLink[lang]}</AlertDescription>
            </Alert>
          )}

          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#9537c7",
                    brandAccent: "#44195b",
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
            providers={["google"]}
            socialLayout="horizontal"
            view="sign_in"
            showLinks={true}
            magicLink={true}
            redirectTo={`${window.location.origin}/auth/callback`}
            localization={{
              variables: {
                sign_in: {
                  email_label: t.login.auth_ui.sign_in.email_label[lang],
                  email_input_placeholder:
                    t.login.auth_ui.sign_in.email_input_placeholder[lang],
                  password_label: t.login.auth_ui.sign_in.password_label[lang],
                  password_input_placeholder:
                    t.login.auth_ui.sign_in.password_input_placeholder[lang],
                  button_label: t.login.auth_ui.sign_in.button_label[lang],
                  social_provider_text:
                    t.login.auth_ui.sign_in.social_provider_text[lang],
                  link_text: t.login.auth_ui.sign_in.link_text[lang],
                },
                sign_up: {
                  email_label: t.login.auth_ui.sign_up.email_label[lang],
                  email_input_placeholder:
                    t.login.auth_ui.sign_up.email_input_placeholder[lang],
                  password_label: t.login.auth_ui.sign_up.password_label[lang],
                  password_input_placeholder:
                    t.login.auth_ui.sign_up.password_input_placeholder[lang],
                  button_label: t.login.auth_ui.sign_up.button_label[lang],
                  link_text: t.login.auth_ui.sign_up.link_text[lang],
                },
                forgotten_password: {
                  email_label:
                    t.login.auth_ui.forgotten_password.email_label[lang],
                  email_input_placeholder:
                    t.login.auth_ui.forgotten_password.email_input_placeholder[
                    lang
                    ],
                  button_label:
                    t.login.auth_ui.forgotten_password.button_label[lang],
                  link_text: t.login.auth_ui.forgotten_password.link_text[lang],
                },
                magic_link: {
                  email_input_label:
                    t.login.auth_ui.magic_link.email_input_label[lang],
                  email_input_placeholder:
                    t.login.auth_ui.magic_link.email_input_placeholder[lang],
                  button_label: t.login.auth_ui.magic_link.button_label[lang],
                  link_text: t.login.auth_ui.magic_link.link_text[lang],
                },
              },
            }}
          />

          {/* Show test component for debugging */}
          {/* <LoginTest /> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
