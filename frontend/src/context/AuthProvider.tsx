import React, { useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";
import { useLocation, useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { AuthContext } from "./AuthContext";
import { useAppDispatch } from "@/store/hooks";
import { resetRoles, fetchCurrentUserRoles } from "@/store/slices/rolesSlice";
import { clearSelectedUser, getUserById } from "@/store/slices/usersSlice";
import { AuthRedirect } from "@/components/Auth/AuthRedirect";
import { getAuthToken, clearCachedAuthToken } from "@/api/axios";
import { toast } from "sonner";
import { AuthService } from "@/components/Auth/AuthService";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [rolesLoaded, setRolesLoaded] = useState(false);
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

  // Handle role loading after authentication
  useEffect(() => {
    // Reset roles loaded state when auth state changes
    setRolesLoaded(false);

    // Only fetch roles if we have an authenticated user and auth loading is complete
    if (user && !authLoading) {
      // Add a token readiness check before fetching roles
      const verifyTokenAndFetchRoles = async () => {
        try {
          // Check if we can get a valid token
          const token = await getAuthToken();

          if (!token) {
            // If no token is available yet, retry after a short delay
            setTimeout(verifyTokenAndFetchRoles, 1000);
            return;
          }

          // Token is available, safe to dispatch role fetching
          dispatch(fetchCurrentUserRoles())
            .unwrap()
            .then(() => {
              setRolesLoaded(true);
              // After roles are loaded, fetch user profile data
              void dispatch(getUserById(user.id));
            })
            .catch((error) => {
              console.error("Failed to load roles:", error);
              setRolesLoaded(true);
              // Still try to load user profile even if roles failed
              void dispatch(getUserById(user.id));
            });
        } catch (error) {
          console.error("Token verification failed:", error);
          setRolesLoaded(true);
          // Try to load profile even if token verification failed
          void dispatch(getUserById(user.id));
        }
      };

      // Start the token verification process
      void verifyTokenAndFetchRoles();
    } else if (!user && !authLoading) {
      // No user, so mark roles as "loaded" (empty)
      setRolesLoaded(true);
    }
  }, [user, authLoading, dispatch]);

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
  }, [user, location.pathname, navigate]);

  const signOut = async () => {
    try {
      // 0. Clear any cached auth token before signing out
      clearCachedAuthToken();
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
      // 6. Reset roles loaded state
      setRolesLoaded(false);
    } catch (error) {
      clearCachedAuthToken();
      console.error("Error during logout:", error);
      // 7. Even if there's an error, still clear local data and navigate
      dispatch(resetRoles());
      dispatch(clearSelectedUser());
      localStorage.clear();
      sessionStorage.clear();
      setSession(null);
      setUser(null);
      setRolesLoaded(false);
    } finally {
      // Always navigate to home page after logout
      void navigate("/");
    }
  };

  // Determine if everything is ready to render (including roles)
  const isLoading = Boolean(authLoading || (user && !rolesLoaded));

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
    authLoading: isLoading: authLoading || setupInProgress,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {authLoading ? (
        <div className="flex justify-center items-center h-screen">
          <LoaderCircle className="animate-spin w-6 h-6" />
          <span className="ml-2 text-sm text-gray-500">
            {authLoading ? "Authenticating..." : "Loading user data..."}
          </span>
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
