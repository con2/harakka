import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllUsers, selectAllUsers, selectLoading, selectError } from "@/store/slices/usersSlice";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import UserDeleteButton from "./UserDeleteButton";
import UserEditModal from "./UserEditModal";
import AddUserModal from "./AddUserModal";

const UsersList = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const columns: ColumnDef<any>[] = [
    // { accessorKey: "id", header: "ID" },
    { accessorKey: "full_name", header: "Name" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "created_at",
      header: "User Since",
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    { id: "edit", header: "Edit", cell: ({ row }) => <UserEditModal user={row.original} /> },
    { id: "delete", header: "Delete", cell: ({ row }) => <UserDeleteButton id={row.original.id} closeModal={closeModal} /> },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl">Manage Users</h1>
        <AddUserModal>
          <Button className="text-white px-6 rounded-2xl bg-highlight2 hover:bg-white hover:text-highlight2">Add New User</Button>
        </AddUserModal>
      </div>
      {loading && <p>Loading users...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      <DataTable columns={columns} data={users}/>
    </>
  );
};

export default UsersList;