import { createClient } from "@supabase/supabase-js";
import { clearCachedAuthToken } from "@/api/axios";

/**
 * Refreshes the Supabase session and clears the cached JWT.
 */
export async function refreshSupabaseSession() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return;
  const supabase = createClient(supabaseUrl, anonKey);

  // Refresh the session
  await supabase.auth.refreshSession();
  // Clear the cached JWT so next API call uses the new token
  clearCachedAuthToken();
}
