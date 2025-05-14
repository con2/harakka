import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";

const PasswordResetSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Translation
  const { lang } = useLanguage();

  useEffect(() => {
    // Check for error parameters in the URL hash
    if (location.hash) {
      const hashParams = new URLSearchParams(location.hash.replace("#", ""));
      const error = hashParams.get("error");
      const errorDescription = hashParams.get("error_description");

      if (error) {
        setHasError(true);
        setErrorMessage(
          errorDescription || t.passwordResetResult.error.linkExpired[lang],
        );
        console.error("Password reset error:", error, errorDescription);
      }
    }
  }, [location, lang]);

  if (hasError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-2" />
            <CardTitle className="text-xl">
              {" "}
              {t.passwordResetResult.error.title[lang]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {errorMessage}. {t.passwordResetResult.error.description[lang]}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={() => navigate("/login")}
              className="bg-secondary hover:bg-secondary/90"
            >
              {t.passwordResetResult.error.button[lang]}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Original success view
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
          <CardTitle className="text-xl">
            {t.passwordResetResult.success.title[lang]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            {t.passwordResetResult.success.description[lang]}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => navigate("/")}
            className="bg-secondary hover:bg-secondary/90"
          >
            {t.passwordResetResult.success.button[lang]}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PasswordResetSuccess;
