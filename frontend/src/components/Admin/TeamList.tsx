import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllUsers,
  selectAllUsers,
  selectLoading,
  selectError,
  selectIsSuperVera,
} from "@/store/slices/usersSlice";
import { LoaderCircle } from "lucide-react";
import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import UserDeleteButton from "./UserDeleteButton";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ColumnDef } from "@tanstack/react-table";
import AddTeamMemberModal from "./AddTeamMemberModal";
import { Button } from "../ui/button";
import { UserProfile } from "@/types/user";

const TeamList = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const isSuperVera = useAppSelector(selectIsSuperVera);
  const { authLoading } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!authLoading && isSuperVera && users.length === 0) {
      dispatch(fetchAllUsers());
    }
  }, [authLoading, isSuperVera, users.length, dispatch]);

  const teamUsers = users.filter(
    (user) => user.role === "admin" || user.role === "superVera",
  );

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString("en-GB");

  const handleAddNew = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const columns: ColumnDef<UserProfile>[] = [
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
        return userRole ? (
          userRole
        ) : (
          <span className="text-slate-500">N/A</span>
        );
      },
    },
    {
      id: "edit",
      header: "Edit",
      cell: ({ row }) => (
        <Button
          className="bg-background rounded-2xl px-6 text-highlight2 border-highlight2 border-1 hover:text-background hover:bg-highlight2"
          onClick={() => handleEdit(row.original)}
        >
          Edit
        </Button>
      ),
    },
    {
      id: "delete",
      header: "Delete",
      cell: ({ row }) => (
        <UserDeleteButton id={row.original.id} closeModal={() => {}} />
      ),
    },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoaderCircle className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!isSuperVera) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl">Manage Team</h1>

        <Button
          onClick={handleAddNew}
          className=" text-white rounded-2xl bg-highlight2 hover:bg-white hover:text-highlight2"
        >
          Add New Team Member
        </Button>
      </div>
      {showModal && (
        <AddTeamMemberModal
          onClose={() => setShowModal(false)}
          initialData={selectedUser || undefined}
        />
      )}

      <PaginatedDataTable columns={columns} data={teamUsers} />
    </>
  );
};

export default TeamList;
