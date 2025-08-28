import { clearCachedAuthToken } from "@/api/axios";
import { supabase } from "@/config/supabase";

/**
 * Refreshes the Supabase session and clears the cached JWT.
 */
export async function refreshSupabaseSession() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return;

  // Refresh the session
  await supabase.auth.refreshSession();
  // Clear the cached JWT so next API call uses the new token
  clearCachedAuthToken();
}
