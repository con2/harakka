import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { redirectUrl, setRedirectUrl } from "@/store/slices/uiSlice";
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Redirect to the current "redirect" state
 * found in slices/ui/redirectUrl
 * Automatically resets after redirect
 */
export const RedirectAndClear = () => {
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const url = useAppSelector(redirectUrl) ?? "/unauthorized";

  useEffect(() => {
    if (pathname === url) dispatch(setRedirectUrl(""));
  }, [dispatch, pathname, url]);

  return <Navigate to={url ?? "/unauthorized"} replace />;
};
