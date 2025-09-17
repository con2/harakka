import { useEffect, useState } from "react";
import { supabase } from "@/config/supabase";
import type { User } from "@supabase/supabase-js";

type Profile = {
  name: string;
  email: string;
  avatarUrl: string;
};

/**
 * Fetches user profile data from `user_profiles` table
 * @param user The Supabase user object
 * @returns name, email, avatarUrl
 */
export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (!user) {
      setProfile({ name: "", email: "", avatarUrl: "" });
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("visible_name, full_name, profile_picture_url, email")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return;
      }

      if (data) {
        setProfile({
          name: data.visible_name || data.full_name || "",
          email: data.email || "",
          avatarUrl: data.profile_picture_url || "",
        });
      }
    };

    void fetchProfile();
  }, [user]);

  return profile;
}
