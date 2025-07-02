import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const AuthRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "user") {
        navigate("/"); // redirect to Landing Page for "user"
      } else if (user.role === "admin" || user.role === "superVera") {
        navigate("/admin"); // redirect to Admin Panel for "admin" or "superVera"
      }
    }
  }, [user, navigate]);

  return null;
};
