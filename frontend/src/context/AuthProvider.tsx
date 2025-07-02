import { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import { useLocation, useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const isRecoveryFlow =
      window.location.href.includes("type=recovery") ||
      window.location.hash.includes("type=recovery");

    if (isRecoveryFlow) {
      setSession(null);
      setUser(null);
      setAuthLoading(false);
      return;
    }

    if (user && location.pathname === "/login") {
      navigate("/");
    }
  }, [user, location.pathname, navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const value = {
    session,
    user,
    authLoading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {authLoading ? (
        <div className="flex justify-center items-center h-screen">
          <LoaderCircle className="animate-spin w-6 h-6" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
