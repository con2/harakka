import { createClient } from "@supabase/supabase-js";

// Get Supabase credentials directly from import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Debug logging
console.log("Supabase configuration check:", {
  hasUrl: !!supabaseUrl,
  urlLength: supabaseUrl?.length || 0,
  hasAnonKey: !!supabaseAnonKey,
  anonKeyLength: supabaseAnonKey?.length || 0,
});

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
      console.error(
        "Missing Supabase environment variables. Authentication will not work properly.",
      );
      // Provide meaningful error message in production
      if (import.meta.env.PROD) {
        alert("Authentication configuration error. Please contact support.");
      }
    }

    return createClient(supabaseUrl || "", supabaseAnonKey || "", {
      auth: {
        autoRefreshToken: !isPasswordResetFlow(),
        persistSession: !isPasswordResetFlow(),
        detectSessionInUrl: !isPasswordResetFlow(),
      },
    });
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    throw new Error(
      "Unable to initialize authentication services. Please refresh the page or try again later.",
    );
  }
})();
