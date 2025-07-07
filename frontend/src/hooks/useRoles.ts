import { roleApi } from "@/api/services/roles";
import {
  UseRolesReturn,
  UserOrganization,
  UserRoleWithDetails,
} from "@/types/roles";
import { useState, useEffect } from "react";

export const useRoles = (): UseRolesReturn => {
  const [roles, setRoles] = useState<UserRoleWithDetails[]>([]);
  const [organizations, setOrganizations] = useState<UserOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperVera, setIsSuperVera] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);

      const [rolesData, orgsData, superVeraData] = await Promise.all([
        roleApi.getCurrentUserRoles(),
        roleApi.getUserOrganizations(),
        roleApi.isSuperVera(),
      ]);

      setRoles(rolesData);
      setOrganizations(orgsData);
      setIsSuperVera(superVeraData.isSuperVera);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch roles";
      setError(errorMessage);
      console.error("Role fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (roleName: string, organizationId?: string): boolean => {
    return roles.some((role) => {
      const roleMatch = role.role_name === roleName;
      const orgMatch = organizationId
        ? role.organization_id === organizationId
        : true;
      return roleMatch && orgMatch && role.is_active;
    });
  };

  const hasAnyRole = (
    roleNames: string[],
    organizationId?: string,
  ): boolean => {
    return roleNames.some((roleName) => hasRole(roleName, organizationId));
  };

  const refreshRoles = async () => {
    await fetchRoles();
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    organizations,
    loading,
    error,
    isSuperVera,
    hasRole,
    hasAnyRole,
    refreshRoles,
  };
};
