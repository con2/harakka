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

// More detailed error logging for authentication failures
supabase.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_IN") {
    console.log("User signed in successfully");
  } else if (event === "SIGNED_OUT") {
    console.log("User signed out");
  } else if (event === "USER_UPDATED") {
    console.log("User updated");
  } else if (event === "PASSWORD_RECOVERY") {
    console.log("Password recovery requested");
  } else if (event === "TOKEN_REFRESHED") {
    console.log("Token refreshed");
  } else {
    console.log("Auth state change:", event);
  }
});

// Add a test login function for debugging
export async function testSupabaseConnection() {
  try {
    const { error } = await supabase
      .from("storage_items")
      .select("count", { count: "exact", head: true });
    console.log("Supabase connection test:", { success: !error, error });
    return !error;
  } catch (err) {
    console.error("Supabase connection test failed:", err);
    return false;
  }
}
