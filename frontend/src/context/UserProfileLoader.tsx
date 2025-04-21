import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { getUserById } from "../store/slices/usersSlice";
import { useAuth } from "../context/AuthContext";

export const UserProfileLoader = () => {
  const dispatch = useAppDispatch();
  const { user, authLoading } = useAuth();

  const fetchedOnce = useRef(false);

  useEffect(() => {
    // Wait for authLoading to finish and only fetch once
    if (!authLoading && user?.id && !fetchedOnce.current) {
      dispatch(getUserById(user.id));
      fetchedOnce.current = true;
    }
  }, [user?.id, authLoading, dispatch]);

  return null;
};
