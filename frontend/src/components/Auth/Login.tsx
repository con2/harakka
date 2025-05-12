import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "../../config/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { CheckCircle2, InfoIcon } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
//import LoginTest from "./LoginTest"; // Import the test component

export const Login = () => {
  const [searchParams] = useSearchParams();
  const reset = searchParams.get("reset");
  const error = searchParams.get("error");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl">Login to your account</CardTitle>
        </CardHeader>
        <CardContent>
          {reset === "success" && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>
                Password has been updated successfully. Please log in with your
                new password.
              </AlertDescription>
            </Alert>
          )}

          {error === "expired_link" && (
            <Alert className="mb-4 bg-amber-50 border-amber-200">
              <InfoIcon className="h-4 w-4 text-amber-500" />
              <AlertDescription>
                Your password reset link has expired. Please request a new one
                using the "Forgot password" option below.
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
                    brand: "#9537c7",
                    brandAccent: "#44195b",
                  },
                  fonts: {
                    bodyFontFamily: "var(--main-font)",
                    inputFontFamily: "var(--main-font)",
                    labelFontFamily: "var(--main-font)",
                    buttonFontFamily: "var(--main-font)",
                  }
                },
              },
            }}
            providers={["google"]}
            socialLayout="horizontal"
            view="sign_in"
            showLinks={true}
            magicLink={true}
            redirectTo={`${window.location.origin}/auth/callback`}
          />

          {/* Show test component for debugging */}
          {/* <LoginTest /> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
