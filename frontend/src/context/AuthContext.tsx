import { Session, User } from "@supabase/supabase-js";
import { createContext } from "react";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  authLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
