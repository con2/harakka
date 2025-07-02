import { PaginatedDataTable } from "@/components/ui/data-table-paginated";
import { useLanguage } from "@/context/LanguageContext";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllUsers,
  selectAllUsers,
  selectError,
  selectIsSuperVera,
  selectLoading,
} from "@/store/slices/usersSlice";
import { t } from "@/translations";
import { UserProfile } from "@/types/user";
import { ColumnDef } from "@tanstack/react-table";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "../../ui/button";
import AddTeamMemberModal from "./AddTeamMemberModal";
import UserDeleteButton from "./UserDeleteButton";
import { useAuth } from "@/hooks/useAuth";

const TeamList = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const isSuperVera = useAppSelector(selectIsSuperVera);
  const { authLoading } = useAuth();
  // Translation
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();

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

  const handleAddNew = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const columns: ColumnDef<UserProfile>[] = [
    {
      accessorKey: "full_name",
      header: t.teamList.columns.name[lang],
    },
    {
      accessorKey: "phone",
      header: t.teamList.columns.phone[lang],
    },
    {
      accessorKey: "email",
      header: t.teamList.columns.email[lang],
      cell: ({ row }) => {
        const email = row.original.email;
        return email ? (
          email
        ) : (
          <span className="text-red-500">
            {t.teamList.status.unverified[lang]}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: t.teamList.columns.userSince[lang],
      cell: ({ row }) =>
        formatDate(new Date(row.original.created_at), "d MMM yyyy"),
    },
    {
      id: "role",
      header: t.teamList.columns.role[lang],
      cell: ({ row }) => {
        const userRole = row.original.role;
        return userRole ? (
          userRole
        ) : (
          <span className="text-slate-500">{t.teamList.status.na[lang]}</span>
        );
      },
    },
    {
      id: "edit",
      header: t.teamList.columns.edit[lang],
      cell: ({ row }) => (
        <Button
          className="bg-background rounded-2xl px-6 text-highlight2 border-highlight2 border-1 hover:text-background hover:bg-highlight2"
          onClick={() => handleEdit(row.original)}
        >
          {t.teamList.buttons.edit[lang]}
        </Button>
      ),
    },
    {
      id: "delete",
      header: t.teamList.columns.delete[lang],
      cell: ({ row }) => (
        <UserDeleteButton id={row.original.id} closeModal={() => {}} />
      ),
    },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoaderCircle className="animate-spin h-8 w-8 mr-2" />
        <span>{t.teamList.loading[lang]}</span>
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
        <h1 className="text-xl">{t.teamList.title[lang]}</h1>

        <Button
          onClick={handleAddNew}
          className=" text-white rounded-2xl bg-highlight2 hover:bg-white hover:text-highlight2"
        >
          {t.teamList.buttons.addNew[lang]}
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
