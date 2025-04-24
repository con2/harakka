import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { getUserById } from "../store/slices/usersSlice";
import { useAuth } from "../context/AuthContext";

export const UserProfileLoader = () => {
  const dispatch = useAppDispatch();
  const { user, authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user?.id) {
      dispatch(getUserById(user.id));
    }
  }, [user?.id, authLoading, dispatch]);

  return null;
};
