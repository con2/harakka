import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Check if we're on a password reset URL before creating the Supabase client
const isPasswordResetFlow = () => {
  return (
    window.location.href.includes("type=recovery") ||
    window.location.hash.includes("type=recovery") ||
    window.location.pathname.includes("/password-reset")
  );
};

// Create Supabase client with appropriate options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: !isPasswordResetFlow(),
    persistSession: !isPasswordResetFlow(),
    detectSessionInUrl: !isPasswordResetFlow(),
  },
});

// For password reset routes, we need to ensure no stored session exists
if (isPasswordResetFlow()) {
  // Clear any stored auth data
  localStorage.removeItem(
    "sb-" + supabaseUrl.split("//")[1].split(".")[0] + "-auth-token",
  );
  localStorage.removeItem("userId");
  sessionStorage.clear();

  console.log("Password reset flow detected - disabled auto-session handling");
}
