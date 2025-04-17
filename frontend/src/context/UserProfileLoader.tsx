import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { getUserById } from "../store/slices/usersSlice";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

export const UserProfileLoader = () => {
  const dispatch = useAppDispatch();
  const { user, authLoading } = useAuth();
  const location = useLocation();

  // Skip fetching on auth pages
  const isAuthPage =
    location.pathname.includes("/login") ||
    location.pathname.includes("/signup");

  useEffect(() => {
    if (!authLoading && user?.id && !isAuthPage) {
      dispatch(getUserById(user.id));
    }
  }, [user?.id, authLoading, dispatch, isAuthPage]);

  return null;
};
