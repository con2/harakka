import axios from "axios";
import { supabase } from "../config/supabase";

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
  ? // Ensure URL has proper protocol
    apiUrl.startsWith("http")
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

  return config;
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// Return response.data directly
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  },
);
