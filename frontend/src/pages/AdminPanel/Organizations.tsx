import { useRoles } from "@/hooks/useRoles";
import { LoaderCircle } from "lucide-react";
import { Navigate } from "react-router-dom";

function Organizations() {
  const { isSuperAdmin, loading } = useRoles();

  if (loading)
    return (
      <div className="flex justify-center p-4">
        <LoaderCircle className="h-4 w-4 animate-spin" />
      </div>
    );

  if (!isSuperAdmin) return <Navigate to="/" />;
  return <>This is the org page</>;
}

export default Organizations;
