import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "../../config/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export const Login = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl">Welcome</CardTitle>
        </CardHeader>
        <CardContent>
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
                },
              },
            }}
            providers={["google"]}
            socialLayout="horizontal"
            view="sign_in"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;