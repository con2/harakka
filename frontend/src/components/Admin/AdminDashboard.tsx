import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllUsers,
  selectAllUsers,
  selectLoading,
  selectSelectedUser,
} from "@/store/slices/usersSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { DataTable } from "../ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect } from "react";
import { LoaderCircle, MoveRight, ShoppingBag, User, Users, Warehouse } from "lucide-react";
import {
  getAllOrders,
  selectAllOrders,
  selectOrdersLoading,
} from "@/store/slices/ordersSlice";
import { Badge } from "../ui/badge";
import { BookingOrder, UserProfile } from "@/types";

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const loading = useAppSelector(selectLoading);
  const user = useAppSelector(selectSelectedUser);
  const orders = useAppSelector(selectAllOrders);
  const ordersLoading = useAppSelector(selectOrdersLoading);
  const navigate = useNavigate();

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
    if (!status) return <Badge variant="outline">Unknown</Badge>;

    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            Pending
          </Badge>
        );
      case "confirmed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            Confirmed
          </Badge>
        );
      case "cancelled":
      case "cancelled by user":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            Cancelled
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            Rejected
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300"
          >
            Completed
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
      header: "Order #",
    },
    {
      accessorKey: "user_profile.name",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <div>{row.original.user_profile?.name || "Unknown"}</div>
          <div className="text-xs text-gray-500">
            {row.original.user_profile?.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.created_at || "");
        return date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      },
    },
  ];
  // Users table
  const columns: ColumnDef<UserProfile>[] = [
    { accessorKey: "full_name", header: "Name" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "email", header: "Email" },
  ];

  // Users table: only role === "user"
  const regularUsers = users.filter((user) => user.role === "user").slice(0, 3);

  // Team table: role === "admin" or "superVera"
  const teamUsers = users
    .filter((user) => user.role === "admin" || user.role === "superVera")
    .slice(0, 3);

  return (
    <div>
      <div className="flex flex-row flex-wrap justify-evenly items-center mb-8 gap-1">
        <div className="flex flex-row items-center justify-center box-border border-gray-300 bg-white rounded-lg p-4 w-2/9">
          <div className="flex-1/3 pl-4 items-center">
           <Users className="h-10 w-10 text-highlight2" />
          </div>
          <div className="flex flex-2/3 flex-col items-center">
            <p className="text-slate-500">Total Users</p>
            <span className="text-2xl">number</span>
          </div>
        </div>
        <div className="flex flex-row items-center justify-center box-border border-gray-300 bg-white rounded-lg p-4 w-2/9">
          <div className="flex-1/3 pl-4 items-center">
           <Warehouse className="h-10 w-10 text-highlight2" />
          </div>
          <div className="flex flex-2/3 flex-col items-center">
            <p className="text-slate-500">Total Items</p>
            <span className="text-2xl">number</span>
          </div>
        </div>
        <div className="flex flex-row items-center justify-center box-border border-gray-300 bg-white rounded-lg p-4 w-2/9">
          <div className="flex-1/3 pl-4 items-center">
           <ShoppingBag className="h-10 w-10 text-highlight2" />
          </div>
          <div className="flex flex-2/3 flex-col items-center">
            <p className="text-slate-500">Total Orders</p>
            <span className="text-2xl">number</span>
          </div>
        </div>
      </div>
      {/* Recent Orders Section */}
      <div className="mb-8">
        <h2>Recent Orders</h2>
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
            Manage Orders <MoveRight />
          </Button>
        </div>
      </div>

      {/* Users and Team Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Users Table */}
        <div>
          <div className="flex justify-between items-center">
            <h2>Recent Users</h2>
          </div>
          {loading && (
            <p>
              <LoaderCircle className="animate-spin" />
            </p>
          )}
          <div className="w-full max-w-4xl mx-auto">
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
        </div>

        {/* Team Table */}
        <div>
          <div className="flex justify-between items-center">
            <h2>My Team</h2>
          </div>
          {loading && (
            <p>
              <LoaderCircle className="animate-spin" />
            </p>
          )}
          <div className="w-full max-w-4xl mx-auto">
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
