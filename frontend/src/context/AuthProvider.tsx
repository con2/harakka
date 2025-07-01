import { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearSelectedUser, getUserById, selectSelectedUser } from "@/store/slices/usersSlice";
import { LoaderCircle } from "lucide-react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const redux_user = useAppSelector(selectSelectedUser);

  const handleSessionUpdate = (session: Session | null) => {
    const isRecoveryFlow =
      window.location.href.includes("type=recovery") ||
      window.location.hash.includes("type=recovery");

    if (isRecoveryFlow) {
      setSession(null);
      setUser(null);
      setAuthLoading(false);
      return;
    }

    const user = session?.user ?? null;
    setSession(session);
    setUser(user);

    if (user?.id) {
      localStorage.setItem("userId", user.id);

      if (!redux_user || redux_user.id !== user.id) {
        dispatch(getUserById(user.id));
      }

    } else {
      localStorage.removeItem("userId");
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
