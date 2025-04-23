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

export const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
    console.log("Response before extraction:", response);
    return response.data;
  },
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  },
);
