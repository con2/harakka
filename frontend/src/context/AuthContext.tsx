import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { clearSelectedUser, getUserById } from "@/store/slices/usersSlice";
import { LoaderCircle } from "lucide-react";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  authLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const handleSessionUpdate = (session: Session | null) => {
    const user = session?.user ?? null;
    setSession(session);
    setUser(user);

    // Save user ID to localStorage when session updates
    if (user?.id) {
      localStorage.setItem("userId", user.id);
      console.log("User ID saved to localStorage:", user.id);

      // Load the full user profile from backend immediately after login
      dispatch(getUserById(user.id));
    } else if (!user) {
      localStorage.removeItem("userId"); // Clean up on logout
      dispatch(clearSelectedUser());
    }

    setAuthLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionUpdate(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionUpdate(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      dispatch(clearSelectedUser());
    }

    if (user && location.pathname === "/login") {
      navigate("/");
    }
  }, [user, location.pathname, dispatch, navigate]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionUpdate(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionUpdate(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    // No need to dispatch clearSelectedUser here directly,
    // since handleSessionUpdate will run after auth change
    navigate("/");
  };

  const value = {
    session,
    user,
    authLoading,
    signOut,
  };

  // return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
