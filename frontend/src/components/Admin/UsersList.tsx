import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllUsers,
  selectAllUsers,
  selectLoading,
  selectError,
  selectIsAdmin,
  selectIsSuperVera,
  selectIsUser,
  selectSelectedUser,
} from "@/store/slices/usersSlice";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { PaginatedDataTable } from "../ui/data-table-paginated";
import UserDeleteButton from "./UserDeleteButton";
import UserEditModal from "./UserEditModal";
import AddUserModal from "./AddUserModal";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { UserProfile } from "@/types";

const UsersList = () => {
  const dispatch = useAppDispatch();
  const { authLoading } = useAuth();
  const users = useAppSelector(selectAllUsers);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const user = useAppSelector(selectSelectedUser);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isSuperVera = useAppSelector(selectIsSuperVera);
  const isUser = useAppSelector(selectIsUser);
  const [isModalOpen, setIsModalOpen] = useState(true); //TODO: what was it supposed to do? Added it to the useEffect dependency array for some reason...
  const closeModal = () => setIsModalOpen(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const isAuthorized = isAdmin || isSuperVera || isUser;

  useEffect(() => {
    if (
      !authLoading &&
      isAuthorized &&
      users.length === 0 &&
      isModalOpen === true
    ) {
      dispatch(fetchAllUsers());
    }
  }, [authLoading, isAuthorized, users.length, isModalOpen, dispatch]);

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString("en-GB");

  const filteredUsers = users
  .filter((u) => {
    if (isSuperVera) return u.role !== "superVera" || u.id === user?.id;
    if (isAdmin) return u.role === "user";
    return false;
  })
  .filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query)
    );
  })
  .filter((u) => {
    if (roleFilter === "all") return true;
    return u.role === roleFilter;
  });

  const columns: ColumnDef<UserProfile>[] = [
    { accessorKey: "full_name", header: "Name", size: 100 },  
    { accessorKey: "phone", header: "Phone", size: 100 },
    {
      accessorKey: "email",
      header: "Email",
      size: 350,
      cell: ({ row }) => {
        const email = row.original.email;
        return email ? email : <span className="text-red-500">Unverified</span>;
      },
    },
    {
      accessorKey: "created_at",
      header: "User Since",
      size: 100,
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "role",
      header: "Role",
      size: 100,
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => {
        const userRole = row.original.role;
        return userRole ? (
          userRole
        ) : (
          <span className="text-slate-500">N/A</span>
        );
      },
    },
    {
      id: "edit",
      size: 30,
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const targetUser = row.original;
        const canEdit = isSuperVera || (isAdmin && targetUser.role === "user");
        return canEdit ? <UserEditModal user={targetUser} /> : null;
      },
    },
    {
      id: "delete",
      size: 30,
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const targetUser = row.original;
        const canDelete =
          isSuperVera || (isAdmin && targetUser.role === "user");
        return canDelete ? (
          <UserDeleteButton id={targetUser.id} closeModal={closeModal} />
        ) : null;
      },
    },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoaderCircle className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!authLoading && !isAuthorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl">Manage Users</h1>
      </div>
      {loading && (
        <p>
          <LoaderCircle className="animate-spin" />
        </p>
      )}
      {error && <p className="text-red-500">Error: {error}</p>}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchQuery}
            size={50}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm p-2 bg-white rounded-md sm:max-w-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select bg-white text-sm p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] focus:border-[var(--secondary)]"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superVera">Super Vera</option>
          </select>
          {(searchQuery || roleFilter !== 'all') && (
            <Button
            onClick={() => {
              setSearchQuery("");
              setRoleFilter("all");
            }}
            size={"sm"}
            className="px-2 py-0 bg-white text-secondary border-1 border-secondary hover:bg-secondary hover:text-white rounded-2xl"
          >
            Clear Filters
          </Button>
          )}
        </div>
        <div className="flex gap-4">
          <AddUserModal>
            <Button className="addBtn" size={"sm"}>
              Add New User
            </Button>
          </AddUserModal>
        </div>
      </div>

      <PaginatedDataTable columns={columns} data={filteredUsers} />
    </div>
  );
};

export default UsersList;
