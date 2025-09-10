import React, { useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";
import { useLocation, useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { AuthContext } from "./AuthContext";
import { useAppDispatch } from "@/store/hooks";
import { resetRoles, fetchCurrentUserRoles } from "@/store/slices/rolesSlice";
import { clearSelectedUser, getCurrentUser } from "@/store/slices/usersSlice";
import { AuthRedirect } from "@/components/Auth/AuthRedirect";
import { getAuthToken, clearCachedAuthToken } from "@/api/axios";
import { toast } from "sonner";
import { AuthService } from "@/api/services/auth";

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
   * Handle user authentication for signup events
   */
  const handleUserAuthentication = React.useCallback(
    async (user: User, _event: string) => {
      if (setupInProgress) {
        return;
      }

      try {
        setSetupInProgress(true);
        console.log("🔍 Starting user authentication flow for:", user.id);

        // Ensure we have a valid session before proceeding
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          console.log("⚠️ No valid session yet, waiting 1.5 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 1500));
          // Try again to get the session
          const { data: retrySessionData } = await supabase.auth.getSession();
          if (!retrySessionData.session) {
            console.error("❌ Failed to get a valid session after retry");
            throw new Error("No authenticated session available");
          }
          console.log("✅ Got valid session after retry");
        } else {
          console.log("✅ Valid session already available");
        }

        // Check if user needs setup
        console.log("👀 Checking if user needs setup...");
        const setupStatus = await AuthService.checkUserSetupStatus(user.id);
        console.log("📊 User setup status:", setupStatus);

        if (setupStatus.needsSetup) {
          console.log("🔧 User needs setup, proceeding...");

          // Determine signup method based on user metadata
          const isOAuthUser =
            user.app_metadata?.provider !== "email" ||
            !!user.user_metadata?.provider;
          const signupMethod = isOAuthUser ? "oauth" : "email";
          console.log("📝 Using signup method:", signupMethod);

          // Debug payload before sending
          const profileData = AuthService.extractUserProfileData(
            user,
            signupMethod,
          );
          console.log("📦 Will use profile data:", {
            ...profileData,
            email: profileData.email
              ? `${profileData.email.substring(0, 3)}***`
              : null,
          });

          // Add a delay before calling setupNewUser to ensure everything is ready
          await new Promise((resolve) => setTimeout(resolve, 500));

          console.log("🚀 Calling setupNewUser...");
          const result = await AuthService.setupNewUser(user, signupMethod);
          console.log("📬 Setup result:", result);

          if (result.success) {
            console.log("✅ User setup successful!");
            // After successful setup, clear cached token and force session refresh
            clearCachedAuthToken();

            // Wait a bit longer for backend JWT update to propagate
            console.log("⏳ Waiting for JWT update to propagate...");
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Force a session refresh to get the updated JWT with roles
            console.log("🔄 Refreshing session...");
            const { data: refreshData, error: refreshError } =
              await supabase.auth.refreshSession();

            if (refreshError) {
              console.warn("⚠️ Session refresh failed:", refreshError);
            } else {
              console.log("✅ Session refreshed successfully");
              setSession(refreshData.session);
              setUser(refreshData.user);
            }

            // Trigger role reload by resetting rolesLoaded
            setRolesLoaded(false);
          } else {
            console.error("❌ Account setup failed:", result.error);
            toast.error("Account setup failed");
            // Sign out the user if setup fails
            await supabase.auth.signOut();
          }
        } else {
          console.log("✅ User already set up, nothing to do");
        }
      } catch (error) {
        console.error("❌ Error in handleUserAuthentication:", error);
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
    } = supabase.auth.onAuthStateChange((event: string, session) => {
      console.log(`🎉 AUTH EVENT DETECTED: ${event}`, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);

      if (session?.user) {
        // Add this debug log to trace the event
        console.log(`🔄 Auth event ${event} with user:`, {
          id: session.user.id,
          email: session.user.email,
          created_at: new Date(session.user.created_at).toISOString(),
          last_sign_in_at: session.user.last_sign_in_at
            ? new Date(session.user.last_sign_in_at).toISOString()
            : null,
        });

        // Detect if this is a new user (created within the last minute)
        const userCreatedAt = new Date(session.user.created_at);
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const isNewUser = userCreatedAt > oneMinuteAgo;

        // Handle new user signup from any auth event
        if (isNewUser) {
          console.log(
            `🆕 NEW USER DETECTED (created: ${userCreatedAt.toISOString()})`,
          );
          void handleUserAuthentication(session.user, event);
          return;
        }

        setTimeout(async () => {
          try {
            // Always check if setup is needed, regardless of event type
            const setupStatus = await AuthService.checkUserSetupStatus(
              session.user.id,
            );
            console.log("User setup status:", setupStatus);

            if (setupStatus.needsSetup) {
              console.log("📝 User needs setup, proceeding with onboarding...");
              await handleUserAuthentication(session.user, event);
            } else {
              console.log("✅ User already setup, nothing to do");
            }
          } catch (error) {
            console.error("❌ Error checking user setup:", error);
            toast.error(
              "Failed to verify account status. Please try again or contact support.",
            );
          }
        }, 1000);
      }
    });

    return () => subscription.unsubscribe();
  }, [handleUserAuthentication]);

  // Handle role loading after authentication
  useEffect(() => {
    if (rolesLoaded) return;
    // Reset roles loaded state when auth state changes
    setRolesLoaded(false);

    // Only fetch roles if we have an authenticated user, auth loading is complete, and setup is not in progress
    if (user && !authLoading && !setupInProgress) {
      // Add a token readiness check before fetching roles
      const verifyTokenAndFetchRoles = async () => {
        try {
          // Clear any cached token to ensure we get the fresh one
          clearCachedAuthToken();

          // Check if we can get a valid token
          const token = await getAuthToken();

          if (!token) {
            // If no token is available yet, retry after a short delay
            setTimeout(verifyTokenAndFetchRoles, 1000);
            return;
          }

          // Check token content for role readiness
          try {
            const tokenPayload = JSON.parse(atob(token.split(".")[1]));

            // Check if token has roles - if not, wait a bit longer for JWT refresh
            if (
              !tokenPayload.app_metadata?.roles ||
              tokenPayload.app_metadata.roles.length === 0
            ) {
              setTimeout(verifyTokenAndFetchRoles, 2000);
              return;
            }
          } catch {
            // Silently ignore JWT decode errors
          }

          // Token is available and has roles, safe to dispatch role fetching
          dispatch(fetchCurrentUserRoles())
            .unwrap()
            .then(() => {
              setRolesLoaded(true);
              // After roles are loaded, fetch user profile data
              void dispatch(getCurrentUser());
            })
            .catch((error) => {
              // If role loading fails, wait a bit and retry
              if (error?.status === 403 || error?.status === 401) {
                setTimeout(verifyTokenAndFetchRoles, 2000);
                return;
              }
              setRolesLoaded(true);
              // Still try to load user profile even if roles failed
              void dispatch(getCurrentUser());
            });
        } catch {
          setRolesLoaded(true);
          // Try to load profile even if token verification failed
          void dispatch(getCurrentUser());
        }
      };

      // Start the token verification process with a small delay to allow JWT to be ready
      setTimeout(verifyTokenAndFetchRoles, 500);
    } else if (!user && !authLoading) {
      // No user, so mark roles as "loaded" (empty)
      setRolesLoaded(true);
    }
  }, [user, authLoading, setupInProgress, dispatch, rolesLoaded]);

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

      // 1. Sign out from Supabase with proper scope for OAuth providers
      await supabase.auth.signOut({ scope: "global" });

      // 2. Clear Redux store data
      dispatch(resetRoles());
      dispatch(clearSelectedUser());

      // 3. Clear all browser storage comprehensively
      localStorage.clear();
      sessionStorage.clear();

      // 4. Clear specific Supabase auth items that might persist
      const authKeys = [
        "supabase.auth.token",
        "sb-access-token",
        "sb-provider-token",
        "sb-refresh-token",
        "userId",
      ];
      authKeys.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // 5. Clear any IndexedDB or other persistent storage
      try {
        if ("indexedDB" in window) {
          // Clear Supabase IndexedDB storage
          const dbs = await indexedDB.databases();
          await Promise.all(
            dbs.map((db) => {
              if (db.name?.includes("supabase")) {
                return new Promise((resolve) => {
                  const deleteReq = indexedDB.deleteDatabase(db.name!);
                  deleteReq.onsuccess = () => resolve(true);
                  deleteReq.onerror = () => resolve(false);
                });
              }
              return Promise.resolve();
            }),
          );
        }
      } catch {
        // Silently handle IndexedDB errors
      }

      // 6. Clear authentication state
      setSession(null);
      setUser(null);
      setRolesLoaded(false);

      // 7. For Google OAuth specifically, clear any Google session cookies
      // This helps ensure the next login shows the account picker
      if (document.cookie.includes("accounts.google.com")) {
        // Note: This is a best-effort approach for Google session clearing
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
          if (
            name.includes("google") ||
            name.includes("oauth") ||
            name.includes("_ga")
          ) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.google.com`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.accounts.google.com`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          }
        });
      }
    } catch {
      clearCachedAuthToken();
      // Even if there's an error, still clear local data and navigate
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
    authLoading: isLoading || setupInProgress,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoading || setupInProgress ? (
        <div className="flex justify-center items-center h-screen">
          <LoaderCircle className="animate-spin w-6 h-6" />
          <span className="ml-2 text-sm text-gray-500">
            {setupInProgress
              ? "Setting up your account..."
              : authLoading
                ? "Authenticating..."
                : "Loading user data..."}
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
