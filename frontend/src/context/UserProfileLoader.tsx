import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { getCurrentUser } from "../store/slices/usersSlice";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const UserProfileLoader = () => {
  const dispatch = useAppDispatch();
  const { user, authLoading } = useAuth();

  const fetchedOnce = useRef(false);
  const location = useLocation();

  // Skip fetching on auth pages
  const isAuthPage =
    location.pathname.includes("/login") ||
    location.pathname.includes("/signup");

  useEffect(() => {
    // Wait for authLoading to finish and only fetch once
    if (!authLoading && user?.id && !fetchedOnce.current && !isAuthPage) {
      void dispatch(getCurrentUser());
      fetchedOnce.current = true;
    }
  }, [user?.id, authLoading, dispatch, isAuthPage]);

  return null;
};
