import axios from "axios";
import { supabase } from "../config/supabase";
import { store } from "@/store/store";
import { fetchCurrentUserRoles } from "@/store/slices/rolesSlice";
import { selectActiveRoleContext } from "@/store/slices/rolesSlice";
import { refreshSupabaseSession } from "@/store/utils/refreshSupabaseSession";
import { toast } from "sonner";
import { t } from "@/translations";

// Cache the token to avoid unnecessary async calls
let cachedToken: string | null = null;

// Get token with fallback to cached token
export async function getAuthToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;

  const { data } = await supabase.auth.getSession();
  cachedToken = data.session?.access_token || null;
  return cachedToken;
}

export function clearCachedAuthToken() {
  cachedToken = null;
}

// Get API URL from runtime config with fallback to development URL
const apiUrl = import.meta.env.VITE_API_URL as string;
const baseURL = apiUrl
  ? // If it starts with "/" (relative path), use as-is for nginx proxy
    // If it starts with "http", use as-is
    // Otherwise, assume it needs https protocol
    apiUrl.startsWith("/") || apiUrl.startsWith("http")
    ? apiUrl
    : `https://${apiUrl}`
  : "http://localhost:3000";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Centralized interceptor for authentication and user ID
api.interceptors.request.use(async (config) => {
  // Add auth token to all requests
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add user ID from Redux store or localStorage to all requests
  const userId = localStorage.getItem("userId");
  if (userId) {
    config.headers["x-user-id"] = userId;
  }

  // Send orgId and  roleName from the activeRoleContext as custom headers on each api call
  const state = store.getState();
  const context = selectActiveRoleContext(state);
  if (context.organizationId) {
    config.headers["x-org-id"] = context.organizationId;
  }
  if (context.roleName) {
    config.headers["x-role-name"] = context.roleName;
  }

  return config;
});

api.interceptors.request.use(
  (config) => config,
  (error) =>
    Promise.reject(error instanceof Error ? error : new Error(String(error))),
);

let rolesRefreshPromise: Promise<unknown> | null = null;

// Return response.data directly with role refresh handling
api.interceptors.response.use(
  (response) => {
    // Check for role version header
    const roleVersion = response.headers["x-role-version"];
    if (roleVersion) {
      // Namespace role-version per user to avoid cross-user cache effects
      const storedUserId = localStorage.getItem("userId");
      const userKey = storedUserId
        ? `last-role-version:${storedUserId}`
        : "last-role-version";
      const lastKnownVersion = localStorage.getItem(userKey);

      // If we have a new version or first time seeing a version, update local storage
      if (!lastKnownVersion || roleVersion !== lastKnownVersion) {
        // Store new version
        localStorage.setItem(userKey, roleVersion);

        // Always refresh on change to aggressively converge state,
        // including first-time detection after login.

        if (import.meta.env.mode === "development") {
          // Log in dev mode only to avoid spamming logs
          console.info("Permissions changed. Refreshing session...");
        }
        refreshSupabaseSession()
          .then(() => {
            void store.dispatch(fetchCurrentUserRoles());
            if (import.meta.env.mode === "development") {
              const lang = // Cant use hooks here, so read directly from localStorage
                (localStorage.getItem("language") as "fi" | "en") || "en";
              toast.info(t.roleManagement.toast.info.permissionsUpdated[lang]);
            }
          })
          .catch((error) => {
            if (import.meta.env.mode === "development") {
              // Log in dev mode only to avoid spamming logs
              console.error("Error refreshing session:", error);
            }
          });
      }
    }

    return response.data;
  },
  async (error) => {
    console.error("API Error:", error);

    // Check if the error is a 403 (Forbidden) and we haven't retried already
    const originalRequest = error.config;
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark that we've retried

      try {
        if (import.meta.env.mode === "development") {
          console.error("Permission denied - refreshing roles");
        }
        // De-dupe concurrent refreshes
        if (!rolesRefreshPromise) {
          rolesRefreshPromise = store
            .dispatch(fetchCurrentUserRoles())
            .unwrap()
            .finally(() => {
              rolesRefreshPromise = null;
            });
        }
        await rolesRefreshPromise;

        // Retry the original request with the same configuration
        return api(originalRequest);
      } catch (refreshError) {
        if (import.meta.env.mode === "development") {
          console.error("Failed to refresh roles:", refreshError);
        }
        // Continue with the original error if role refresh fails
      }
    }

    return Promise.reject(
      error instanceof Error ? error : new Error(String(error)),
    );
  },
);
