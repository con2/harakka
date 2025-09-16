import { createClient } from "@supabase/supabase-js";

// Get Supabase credentials directly from import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Debug logging
console.log("Supabase configuration check:", {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "missing",
  hasAnonKey: !!supabaseAnonKey,
  mode: import.meta.env.MODE,
});

// Always create a stable Supabase client.
// Password reset flow is handled within the PasswordReset component
// and should not change global auth client behavior.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

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
  } else if (event === "INITIAL_SESSION") {
    console.log("Initial session detected");
  } else if (event === "MFA_CHALLENGE_VERIFIED") {
    console.log("MFA challenge verified");
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
    console.log("Supabase connection test:", {
      success: !error,
      error: error?.message,
    });
    return !error;
  } catch (err) {
    console.error("Supabase connection test failed:", err);
    return false;
  }
}
