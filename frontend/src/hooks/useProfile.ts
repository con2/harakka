import { useMemo } from "react";
import type { User } from "@supabase/supabase-js";

/**
 * Small helper hook to get basic user data
 * @param user The supabase user object
 * @returns name, email and avatarUrl
 */
export function useProfile(user: User | null) {
  return useMemo(() => {
    if (!user) {
      return {
        name: "",
        email: "",
        avatarUrl: "",
      };
    }

    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.app_metadata?.roles?.[0]?.user_full_name ||
      "";

    const email =
      user.email ||
      user.user_metadata?.email ||
      user.app_metadata?.roles?.[0]?.user_email ||
      "";

    const avatarUrl =
      user.user_metadata?.avatar_url || user.user_metadata?.picture || "";

    return { name, email, avatarUrl };
  }, [user]);
}
