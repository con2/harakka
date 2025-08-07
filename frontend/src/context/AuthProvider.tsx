import React, { useEffect, useState, useRef, useCallback } from "react";
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
import { AuthService } from "@/api/services/auth";
import {
  UserSignupModal,
  UserSignupData,
} from "@/components/Auth/UserSignupModal";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const [setupInProgress, setSetupInProgress] = useState(false);

  // Signup modal state
  const [showModal, setShowModal] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [pendingSignupMethod, setPendingSignupMethod] = useState<
    "email" | "oauth"
  >("email");
  const modalResolveRef = useRef<((value: boolean) => void) | null>(null);

  // Modal handlers
  const openSignupModal = useCallback(
    async (user: User, signupMethod: "email" | "oauth"): Promise<boolean> => {
      setPendingUser(user);
      setPendingSignupMethod(signupMethod);
      setShowModal(true);
      return new Promise((resolve) => {
        modalResolveRef.current = resolve;
      });
    },
    [],
  );

  const handleSignupComplete = (_data: UserSignupData): Promise<void> => {
    setShowModal(false);
    setPendingUser(null);
    if (modalResolveRef.current) {
      modalResolveRef.current(true);
      modalResolveRef.current = null;
    }
    return Promise.resolve();
  };

  const handleSignupSkip = (): Promise<void> => {
    setShowModal(false);
    setPendingUser(null);
    if (modalResolveRef.current) {
      modalResolveRef.current(false);
      modalResolveRef.current = null;
    }
    return Promise.resolve();
  };

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

        // Check if user needs setup
        const setupStatus = await AuthService.checkUserSetupStatus(user.id);

        if (setupStatus.needsSetup) {
          // Determine signup method based on user metadata
          const isOAuthUser =
            user.app_metadata?.provider !== "email" ||
            !!user.user_metadata?.provider;
          const signupMethod = isOAuthUser ? "oauth" : "email";

          // Show signup modal for user input
          const success = await openSignupModal(user, signupMethod);

          if (success) {
            // After successful setup, clear cached token and force session refresh
            clearCachedAuthToken();

            // Wait a bit for backend JWT update to propagate
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Force a session refresh to get the updated JWT with roles
            const { data: refreshData, error: refreshError } =
              await supabase.auth.refreshSession();
            if (refreshError) {
              // Silently handle refresh error
            } else {
              setSession(refreshData.session);
              setUser(refreshData.user);
            }

            // Trigger role reload by resetting rolesLoaded
            setRolesLoaded(false);
          } else {
            toast.error("Account setup failed");
            // Sign out the user if setup fails
            await supabase.auth.signOut();
          }
        }
      } catch {
        toast.error(
          "There was an issue setting up your account. Please contact support if this persists.",
        );
      } finally {
        setSetupInProgress(false);
      }
    },
    [setupInProgress, openSignupModal],
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

      // Handle user setup for signup and potentially incomplete signin
      if (session?.user) {
        if (event === "SIGNED_UP") {
          await handleUserAuthentication(session.user, event);
        } else if (event === "SIGNED_IN") {
          // For signed in users, verify they have complete setup
          // This catches cases where SIGNED_UP didn't trigger or OAuth flows
          setTimeout(async () => {
            try {
              const setupStatus = await AuthService.checkUserSetupStatus(
                session.user.id,
              );

              if (setupStatus.needsSetup) {
                setSetupInProgress(true);

                const isOAuthUser =
                  session.user.app_metadata?.provider !== "email" ||
                  !!session.user.user_metadata?.provider;
                const signupMethod = isOAuthUser ? "oauth" : "email";

                // Show signup modal for user input
                const success = await openSignupModal(
                  session.user,
                  signupMethod,
                );

                if (success) {
                  // Clear cached token and force session refresh
                  clearCachedAuthToken();

                  // Wait a bit for backend JWT update to propagate
                  await new Promise((resolve) => setTimeout(resolve, 1500));

                  // Force a session refresh to get the updated JWT with roles
                  const { data: refreshData, error: refreshError } =
                    await supabase.auth.refreshSession();
                  if (refreshError) {
                    // Silently handle refresh error
                  } else {
                    setSession(refreshData.session);
                    setUser(refreshData.user);
                  }

                  setRolesLoaded(false); // Trigger role reload
                } else {
                  toast.error("Account setup failed");
                }

                setSetupInProgress(false);
              }
            } catch {
              setSetupInProgress(false);
            }
          }, 500); // Reduced delay for faster response
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [handleUserAuthentication, openSignupModal]);

  // Handle role loading after authentication
  useEffect(() => {
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
              void dispatch(getUserById(user.id));
            })
            .catch((error) => {
              // If role loading fails, wait a bit and retry
              if (error?.status === 403 || error?.status === 401) {
                setTimeout(verifyTokenAndFetchRoles, 2000);
                return;
              }
              setRolesLoaded(true);
              // Still try to load user profile even if roles failed
              void dispatch(getUserById(user.id));
            });
        } catch {
          setRolesLoaded(true);
          // Try to load profile even if token verification failed
          void dispatch(getUserById(user.id));
        }
      };

      // Start the token verification process with a small delay to allow JWT to be ready
      setTimeout(verifyTokenAndFetchRoles, 500);
    } else if (!user && !authLoading) {
      // No user, so mark roles as "loaded" (empty)
      setRolesLoaded(true);
    }
  }, [user, authLoading, setupInProgress, dispatch]);

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

          {/* Signup Modal */}
          {showModal && pendingUser && (
            <UserSignupModal
              user={pendingUser}
              isOpen={showModal}
              onComplete={handleSignupComplete}
              onSkip={handleSignupSkip}
              signupMethod={pendingSignupMethod}
            />
          )}
        </>
      )}
    </AuthContext.Provider>
  );
}
