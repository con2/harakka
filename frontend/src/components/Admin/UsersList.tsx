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
  const [isModalOpen, setIsModalOpen] = useState(true);
  const closeModal = () => setIsModalOpen(false);
  const isAuthorized = isAdmin || isSuperVera || isUser;

  useEffect(() => {
    if (!authLoading && isAuthorized && users.length === 0) {
      dispatch(fetchAllUsers());
    }
  }, [authLoading, isAuthorized, users.length, dispatch]);

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString("en-GB");

  const visibleUsers = users.filter((u) => {
    if (isSuperVera) return u.role !== "superVera" || u.id === user?.id; 
    if (isAdmin) return u.role === "user";
    return false;
  });

  const canEdit = isSuperVera || isAdmin;

  const columns: ColumnDef<any>[] = [
    { accessorKey: "full_name", header: "Name" },
    { accessorKey: "phone", header: "Phone" },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.original.email;
        return email ? email : <span className="text-red-500">Unverified</span>;
      },
    },
    {
      accessorKey: "created_at",
      header: "User Since",
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "role",
      header: "Role",
      cell: ({ row }) => {
        const userRole = row.original.role;
        return userRole ? userRole : <span className="text-slate-500">N/A</span>;
      },
    },
    {
      id: "edit",
      header: "Edit",
      cell: ({ row }) => {
        const targetUser = row.original;
        const canEdit = isSuperVera || (isAdmin && targetUser.role === "user");
        return canEdit ? <UserEditModal user={targetUser} /> : null;
      },
    },
    {
      id: "delete",
      header: "Delete",
      cell: ({ row }) => {
        const targetUser = row.original;
        const canDelete = isSuperVera || (isAdmin && targetUser.role === "user");
        return canDelete ? <UserDeleteButton id={targetUser.id} closeModal={closeModal} /> : null;
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
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl">Manage Users</h1>
        <AddUserModal>
          <Button className="text-white rounded-2xl bg-highlight2 hover:bg-white hover:text-highlight2">
            Add New User
          </Button>
        </AddUserModal>
      </div>
      {loading && <p><LoaderCircle /></p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      <PaginatedDataTable columns={columns} data={visibleUsers} />
    </>
  );
};

export default UsersList;
