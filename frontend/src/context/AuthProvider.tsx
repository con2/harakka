import { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import { useLocation, useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { AuthContext } from "./AuthContext";
import { useAppDispatch } from "@/store/hooks";
import { resetRoles } from "@/store/slices/rolesSlice";
import { clearSelectedUser } from "@/store/slices/usersSlice";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
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
      void navigate("/");
    }
  }, [user, location.pathname, navigate]);

  const signOut = async () => {
    try {
      // 1. Sign out from Supabase (clears JWT tokens)
      await supabase.auth.signOut();
      // 2. Clear Redux store data
      dispatch(resetRoles());
      dispatch(clearSelectedUser());
      // 3. Clear any cached JWT data from local storage
      localStorage.removeItem("userId");
      localStorage.removeItem("supabase.auth.token");
      localStorage.removeItem("sb-access-token");
      localStorage.removeItem("sb-provider-token");
      localStorage.removeItem("sb-refresh-token");
      // 4. Clear session storage
      sessionStorage.clear();
      // 5. Clear any cached authentication state
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if there's an error, still clear local data and navigate
      dispatch(resetRoles());
      dispatch(clearSelectedUser());
      localStorage.clear();
      sessionStorage.clear();
      setSession(null);
      setUser(null);
    } finally {
      // Always navigate to home page after logout
      void navigate("/");
    }
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
