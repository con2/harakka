import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllUsers,
  selectAllUsers,
  selectLoading,
} from "@/store/slices/usersSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { DataTable } from "../ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect } from "react";
import { LoaderCircle, MoveRight, Plus } from "lucide-react";

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const loading = useAppSelector(selectLoading);
  const navigate = useNavigate();

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, users.length]);

  const columns: ColumnDef<any>[] = [
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
      <h1 className="text-xl mb-4">Admin Dashboard</h1>

      {/* Recent Orders Section */}
      <div className="mb-8">
        <h2>Recent Orders</h2>
        {loading && <p><LoaderCircle className="animate-spin" /></p>}
        <div className="w-full mx-auto">
          <DataTable columns={columns} data={regularUsers} />
        </div>
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
            <h2>Users</h2>
          </div>
          {loading && <p><LoaderCircle className="animate-spin" /></p>}
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
            <h2>Your Team</h2>
          </div>
          {loading && <p><LoaderCircle className="animate-spin"/></p>}
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