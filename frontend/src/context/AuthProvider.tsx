import { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import { useLocation, useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { AuthContext } from "./AuthContext";
import { useAppDispatch } from "@/store/hooks";
import { resetRoles, fetchCurrentUserRoles } from "@/store/slices/rolesSlice";
import { clearSelectedUser, getCurrentUser } from "@/store/slices/usersSlice";
import { AuthRedirect } from "@/components/Auth/AuthRedirect";
import { getAuthToken, clearCachedAuthToken } from "@/api/axios";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [rolesLoaded, setRolesLoaded] = useState(false);

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
              void dispatch(getCurrentUser());
            })
            .catch((error) => {
              console.error("Failed to load roles:", error);
              setRolesLoaded(true);
              // Still try to load user profile even if roles failed
              void dispatch(getCurrentUser());
            });
        } catch (error) {
          console.error("Token verification failed:", error);
          setRolesLoaded(true);
          // Try to load profile even if token verification failed
          void dispatch(getCurrentUser());
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

  const value = {
    session,
    user,
    authLoading: isLoading,
    signOut,
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
