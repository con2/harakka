import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllUsers,
  selectAllUsers,
  //selectLoading,
  selectSelectedUser,
} from "@/store/slices/usersSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { DataTable } from "../ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect } from "react";
import {
  LoaderCircle,
  MoveRight,
  ShoppingBag,
  Users,
  Warehouse,
} from "lucide-react";
import {
  getAllOrders,
  selectAllOrders,
  selectOrdersLoading,
} from "@/store/slices/ordersSlice";
import { Badge } from "../ui/badge";
import { BookingOrder } from "@/types";
import { fetchAllItems, selectAllItems } from "@/store/slices/itemsSlice";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useFormattedDate } from "@/hooks/useFormattedDate";

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  //const loading = useAppSelector(selectLoading);
  const items = useAppSelector(selectAllItems);
  const user = useAppSelector(selectSelectedUser);
  const orders = useAppSelector(selectAllOrders);
  const ordersLoading = useAppSelector(selectOrdersLoading);
  const navigate = useNavigate();
  // Translation
  const { lang } = useLanguage();
  const { formatDate } = useFormattedDate();

  useEffect(() => {
    dispatch(fetchAllItems());
  }, [dispatch]);

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, users.length]);

  useEffect(() => {
    if (!ordersLoading && user?.id && orders.length === 0) {
      dispatch(getAllOrders(user.id));
    }
  }, [dispatch, user?.id, orders.length, ordersLoading]);

  const StatusBadge = ({ status }: { status?: string }) => {
    if (!status)
      return (
        <Badge variant="outline">{t.adminDashboard.status.unknown[lang]}</Badge>
      );

    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            {t.adminDashboard.status.pending[lang]}
          </Badge>
        );
      case "confirmed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            {t.adminDashboard.status.confirmed[lang]}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            {t.adminDashboard.status.cancelled[lang]}
          </Badge>
        );
      case "cancelled by user":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            {t.adminDashboard.status.cancelled[lang]}
          </Badge>
        );
      case "cancelled by admin":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            {t.adminDashboard.status.cancelledByAdmin[lang]}
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            {t.adminDashboard.status.rejected[lang]}
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300"
          >
            {t.adminDashboard.status.completed[lang]}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Define columns for the DataTable
  // Orders table
  const ordersColumns: ColumnDef<BookingOrder>[] = [
    {
      accessorKey: "order_number",
      header: t.adminDashboard.columns.orderNumber[lang],
    },
    {
      accessorKey: "user_profile.name",
      header: t.adminDashboard.columns.customer[lang],
      cell: ({ row }) => (
        <div>
          <div>
            {row.original.user_profile?.name ||
              t.adminDashboard.status.unknown[lang]}
          </div>
          <div className="text-xs text-gray-500">
            {row.original.user_profile?.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t.adminDashboard.columns.status[lang],
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "created_at",
      header: t.adminDashboard.columns.date[lang],
      cell: ({ row }) => {
        const date = new Date(row.original.created_at || "");
        return formatDate(date, "d MMM yyyy");
      },
    },
  ];
  // Users table
  // const columns: ColumnDef<UserProfile>[] = [
  //   { accessorKey: "full_name", header: "Name" },
  //   { accessorKey: "phone", header: "Phone" },
  //   { accessorKey: "email", header: "Email" },
  // ];

  // // Users table: only role === "user"
  // const regularUsers = users.filter((user) => user.role === "user").slice(0, 3);

  // // Team table: role === "admin" or "superVera"
  // const teamUsers = users
  //   .filter((user) => user.role === "admin" || user.role === "superVera")
  //   .slice(0, 3);

  return (
    <div>
      <div className="w-full flex flex-wrap justify-evenly items-center mb-8 gap-4">
        <div className="flex flex-col items-center justify-center bg-white rounded-lg gap-4 p-4 w-[30%] min-w-[300px]">
          <div className="flex justify-center items-center">
            <p className="text-slate-500">
              {t.adminDashboard.cards.users[lang]}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Users className="h-10 w-10 text-highlight2 shrink-0" />
            <span className="text-4xl font-normal">{users.length}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-white rounded-lg gap-4 p-4 w-[30%] min-w-[300px]">
          <div className="flex justify-center items-center">
            <p className="text-slate-500">
              {t.adminDashboard.cards.items[lang]}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Warehouse className="h-10 w-10 text-highlight2 shrink-0" />
            <span className="text-4xl font-normal">{items.length}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-white rounded-lg gap-4 p-4 w-[30%] min-w-[300px]">
          <div className="flex justify-center items-center">
            <p className="text-slate-500">
              {t.adminDashboard.cards.orders[lang]}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <ShoppingBag className="h-10 w-10 text-highlight2 shrink-0" />
            <span className="text-4xl font-normal">{orders.length}</span>
          </div>
        </div>
      </div>
      {/* Recent Orders Section */}
      <div className="mb-8">
        <h2 className="text-left">
          {t.adminDashboard.sections.recentOrders[lang]}
        </h2>
        {ordersLoading ? (
          <div className="flex justify-center items-center py-6">
            <LoaderCircle className="animate-spin" />
          </div>
        ) : (
          <DataTable
            columns={ordersColumns}
            data={[...orders]
              .sort(
                (a, b) =>
                  new Date(b.created_at || "").getTime() -
                  new Date(a.created_at || "").getTime(),
              )
              .slice(0, 5)}
          />
        )}
        <div className="flex items-center justify-center mt-4">
          <Button
            className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
            onClick={() => navigate("/admin/orders")}
          >
            {t.adminDashboard.sections.manageOrders[lang]} <MoveRight />
          </Button>
        </div>
      </div>

      {/* Users and Team Section */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> */}
      {/* Users Table */}
      {/* <div>
          <div className="flex justify-between items-center">
            <h2>Recent Users</h2>
          </div>
          {loading && (
            <p>
              <LoaderCircle className="animate-spin" />
            </p>
          )}
          <div className="w-full max-w-6xl mx-auto">
            <DataTable columns={columns} data={regularUsers} />
          </div>
          <div className="flex items-center justify-center mt-4 space-x-4">
            <Button
              className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
              onClick={() => navigate("/admin/users")}
            >
              Manage Users <MoveRight />
            </Button>
          </div>
        </div> */}

      {/* Team Table */}
      {/* <div>
          <div className="flex justify-between items-center">
            <h2>My Team</h2>
          </div>
          {loading && (
            <p>
              <LoaderCircle className="animate-spin" />
            </p>
          )}
          <div className="w-full max-w-6xl mx-auto">
            <DataTable columns={columns} data={teamUsers} />
          </div>
          <div className="flex items-center justify-center mt-4 space-x-4">
            <Button
              className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
              onClick={() => navigate("/admin/team")}
            >
              Manage Team <MoveRight />
            </Button>
          </div>
        </div> */}
      {/* </div> */}
    </div>
  );
};

export default AdminDashboard;
