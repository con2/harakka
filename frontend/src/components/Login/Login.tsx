import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {};

  return (
    <div className="max-w-xs mx-auto mt-20">
      <Card>
        <CardHeader className="items-center">
          <div className="bg-primary rounded-full p-3 mb-4">
            <Lock className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Password
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus-visible:ring-primary"
              />
            </div>

            <Button
              onClick={handleLogin}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Login
            </Button>

            <div className="flex justify-end pt-4">
              <Link
                to="/register"
                className="text-sm text-primary hover:text-primary/80 underline underline-offset-4"
              >
                Don't have an account? Register
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;