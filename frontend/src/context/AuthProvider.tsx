import React, { useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";
import { useLocation, useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { AuthContext } from "./AuthContext";
import { useAppDispatch } from "@/store/hooks";
import { resetRoles } from "@/store/slices/rolesSlice";
import { clearSelectedUser } from "@/store/slices/usersSlice";
import { AuthRedirect } from "@/components/Auth/AuthRedirect";
import { toast } from "sonner";
import { AuthService } from "@/components/Auth/AuthService";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [setupInProgress, setSetupInProgress] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  /**
   * Handle user authentication for both signup and signin
   */
  const handleUserAuthentication = React.useCallback(
    async (user: User, _event: string) => {
      if (setupInProgress) {
        console.log("Setup already in progress, skipping");
        return;
      }

      try {
        setSetupInProgress(true);

        // Check if user needs setup
        const setupStatus = await AuthService.checkUserSetupStatus(user.id);

        if (setupStatus.needsSetup) {
          console.log("User needs setup, creating profile and assigning role");

          // Determine signup method based on user metadata
          const isOAuthUser =
            user.app_metadata?.provider !== "email" ||
            !!user.user_metadata?.provider;
          const signupMethod = isOAuthUser ? "oauth" : "email";

          const result = await AuthService.setupNewUser(user, signupMethod);

          if (result.success) {
            if (result.isNewUser) {
              toast.success(
                "Welcome! Your account has been set up successfully.",
              );
            }
          } else {
            console.error("User setup failed:", result.error);
            toast.error(`Account setup failed: ${result.error}`);

            // Optionally sign out the user if setup fails critically
            if (
              result.error?.includes("organization") ||
              result.error?.includes("Profile creation failed")
            ) {
              console.warn("Critical setup failure, signing out user");
              await supabase.auth.signOut();
            }
          }
        } else {
          console.log("User already has profile and role, no setup needed");
        }
      } catch (error) {
        console.error("Error in user authentication handler:", error);
        toast.error(
          "There was an issue setting up your account. Please contact support if this persists.",
        );
      } finally {
        setSetupInProgress(false);
      }
    },
    [setupInProgress],
  );

  // get inital session
  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    // listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);

      // Handle new user signup/signin
      if (session?.user && (event === "SIGNED_UP" || event === "SIGNED_IN")) {
        await handleUserAuthentication(session.user, event);
      }
    });

    return () => subscription.unsubscribe();
  }, [handleUserAuthentication]);

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

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error("Error refreshing session:", error);
    } else {
      setSession(data.session);
      setUser(data.user);
    }
  };

  const value = {
    session,
    user,
    authLoading: authLoading || setupInProgress,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {authLoading ? (
        <div className="flex justify-center items-center h-screen">
          <LoaderCircle className="animate-spin w-6 h-6" />
        </div>
      ) : (
        <>
          {user && <AuthRedirect />}
          {children}
        </>
      )}
    </AuthContext.Provider>
  );
}
