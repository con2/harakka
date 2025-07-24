import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "user") {
        void navigate("/"); // redirect to Landing Page for "user"
      } else if (user.role === "admin" || user.role === "superVera") {
        void navigate("/admin"); // redirect to Admin Panel for "admin" or "superVera"
      }
    }
  }, [user, navigate]);

  return null;
};
