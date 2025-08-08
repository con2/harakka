import React, { useEffect, useMemo, useState } from "react";
import { useRoles } from "@/hooks/useRoles";
import { ColumnDef } from "@tanstack/react-table";
import { ViewUserRolesWithDetails } from "@common/role.types";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle, Shield } from "lucide-react";

type RolesListProps = {
  pageSize?: number;
  onRolesChanged?: () => void;
};

export const RolesList: React.FC<RolesListProps> = ({ pageSize = 15 }) => {
  const { allUserRoles, adminLoading, adminError, refreshAllUserRoles } =
    useRoles();

  // Fetch once if empty (relies on hook caching/deduping)
  useEffect(() => {
    if (!allUserRoles || allUserRoles.length === 0) {
      void refreshAllUserRoles(false);
    }
  }, [allUserRoles?.length, refreshAllUserRoles]);

  // Filters
  const [filterUser, setFilterUser] = useState("");
  const [filterOrg, setFilterOrg] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Pagination
  const [pageIndex, setPageIndex] = useState(0);

  // Filter
  const filtered = useMemo(() => {
    const qUser = filterUser.toLowerCase();
    const qOrg = filterOrg.toLowerCase();
    const qRole = filterRole.toLowerCase();

    return (allUserRoles || []).filter((r) => {
      const okUser =
        !qUser ||
        (r.user_email && r.user_email.toLowerCase().includes(qUser)) ||
        (r.user_full_name && r.user_full_name.toLowerCase().includes(qUser));
      const okOrg =
        !qOrg ||
        (r.organization_name &&
          r.organization_name.toLowerCase().includes(qOrg));
      const okRole =
        !qRole || (r.role_name && r.role_name.toLowerCase().includes(qRole));
      const okStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? !!r.is_active
            : !r.is_active;

      return okUser && okOrg && okRole && okStatus;
    });
  }, [allUserRoles, filterUser, filterOrg, filterRole, statusFilter]);

  // Paginate
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = pageIndex * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageIndex, pageSize]);

  // Columns
  const columns: ColumnDef<ViewUserRolesWithDetails>[] = [
    {
      accessorKey: "user_email",
      header: "User",
      size: 220,
      cell: ({ row }) => (
        <span>
          {row.original.user_email}
          {row.original.user_full_name
            ? ` (${row.original.user_full_name})`
            : ""}
        </span>
      ),
    },
    {
      accessorKey: "role_name",
      header: "Role",
      size: 140,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.role_name}</span>
      ),
    },
    {
      accessorKey: "organization_name",
      header: "Organization",
      size: 220,
    },
    {
      accessorKey: "is_active",
      header: "Active",
      size: 100,
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge
            variant="default"
            className="text-xs bg-green-100 text-green-800"
          >
            Active
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Inactive
          </Badge>
        ),
    },
    {
      accessorKey: "assigned_at",
      header: "Assigned",
      size: 120,
      cell: ({ row }) =>
        row.original.assigned_at
          ? new Date(row.original.assigned_at).toLocaleDateString()
          : "-",
    },
  ];

  return (
    <Card data-cy="role-management-admin-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            All Users Roles ({allUserRoles?.length || 0})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refreshAllUserRoles(true)}
              data-cy="role-management-admin-refresh"
            >
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {adminLoading ? (
          <div
            className="flex justify-center items-center h-32"
            data-cy="role-management-admin-loading-row"
          >
            <LoaderCircle className="animate-spin w-6 h-6" />
            <span className="ml-2">Loading admin data...</span>
          </div>
        ) : adminError ? (
          <Alert
            variant="destructive"
            data-cy="role-management-admin-error-alert"
          >
            <AlertDescription>{adminError}</AlertDescription>
          </Alert>
        ) : !allUserRoles || allUserRoles.length === 0 ? (
          <p
            className="text-muted-foreground"
            data-cy="role-management-admin-no-roles"
          >
            No role assignments found.
          </p>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Input
                placeholder="Filter by user (email or name)"
                value={filterUser}
                onChange={(e) => {
                  setFilterUser(e.target.value);
                  setPageIndex(0);
                }}
                className="w-52"
              />
              <Input
                placeholder="Filter by organization"
                value={filterOrg}
                onChange={(e) => {
                  setFilterOrg(e.target.value);
                  setPageIndex(0);
                }}
                className="w-52"
              />
              <Input
                placeholder="Filter by role"
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setPageIndex(0);
                }}
                className="w-40"
              />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as typeof statusFilter);
                  setPageIndex(0);
                }}
                className="select bg-white text-sm p-2 rounded-md border"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {(filterUser ||
                filterOrg ||
                filterRole ||
                statusFilter !== "all") && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFilterUser("");
                    setFilterOrg("");
                    setFilterRole("");
                    setStatusFilter("all");
                    setPageIndex(0);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Table */}
            <PaginatedDataTable
              columns={columns}
              data={paginated}
              pageIndex={pageIndex}
              pageCount={totalPages}
              onPageChange={setPageIndex}
              data-cy="role-management-admin-roles-list"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RolesList;
