import { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { Org_Roles } from "@common/role.types";
import { RedirectAndClear } from "./RedirectAndClear";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: Org_Roles[];
  requiredOrganization?: string;
}

const ProtectedRoute = ({
  children,
  allowedRoles = [],
  requiredOrganization,
}: ProtectedRouteProps) => {
  const { authLoading, user } = useAuth();
  const { loading: rolesLoading, hasAnyRole, currentUserRoles } = useRoles();

  // Loading gate, only block while roles are still being loaded for the first time (no roles yet)
  if (authLoading || (rolesLoading && currentUserRoles.length === 0)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin w-6 h-6" />
      </div>
    );
  }

  // If route is protected but no roles provided, consider it "any authenticated user"
  if (!user) return <RedirectAndClear />;

  const ok =
    allowedRoles.length === 0
      ? true
      : hasAnyRole(allowedRoles as string[], requiredOrganization);

  if (!ok) return <RedirectAndClear />;

  return <>{children}</>;
};

export default ProtectedRoute;
