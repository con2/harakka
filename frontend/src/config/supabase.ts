import { createClient } from "@supabase/supabase-js";
import { getRuntimeConfig } from "../types/runtime-config";

const { supabaseUrl, supabaseAnonKey } = getRuntimeConfig();

// Check if we're on a password reset URL before creating the Supabase client
const isPasswordResetFlow = () => {
  return (
    window.location.href.includes("type=recovery") ||
    window.location.hash.includes("type=recovery") ||
    window.location.pathname.includes("/password-reset")
  );
};

// Create Supabase client with graceful fallback
export const supabase = (() => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        "Missing Supabase environment variables, using fallback configuration",
      );
      // Return a dummy client or handle this situation appropriately
      // You could return null here and add null checks where supabase is used
      // Or implement a retry mechanism
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: !isPasswordResetFlow(),
        persistSession: !isPasswordResetFlow(),
        detectSessionInUrl: !isPasswordResetFlow(),
      },
    });
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    // Return a fallback/dummy client or throw a more helpful error
    throw new Error(
      "Unable to initialize authentication services. Please refresh the page or try again later.",
    );
  }
})();
