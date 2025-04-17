import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "../../config/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const PasswordReset = () => {
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
            redirectTo={`${window.location.origin}/auth/callback?reset=success`}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordReset;
