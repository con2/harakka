import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllUsers, selectAllUsers, selectLoading } from "@/store/slices/usersSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { DataTable } from "../ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect } from "react";
import { MoveRight } from "lucide-react";

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const loading = useAppSelector(selectLoading);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const orderColumns: ColumnDef<any>[] = [
    { accessorKey: "full_name", header: "Name" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "full_name", header: "Name" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "email", header: "Email" },
  ];

  const columns: ColumnDef<any>[] = [
    { accessorKey: "full_name", header: "Name" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "email", header: "Email" },
  ];

  const limitedUsers = users.slice(0, 3);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Recent Orders Section */}
      <div className="mb-8">
        <h2>Recent Orders</h2>
        {loading && <p>Loading orders...</p>}
        <div className="w-full mx-auto">
          <DataTable columns={orderColumns} data={users} />
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
          <h2>Users</h2>
          {loading && <p>Loading users...</p>}
          <div className="w-full max-w-4xl mx-auto">
            <DataTable columns={columns} data={limitedUsers} />
          </div>
          <div className="flex items-center justify-center mt-4">
            <Button className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
              onClick={() => navigate("/admin/users")}
              >
              Manage Users <MoveRight />
            </Button>
          </div>
        </div>

        {/* Team Table */}
        <div>
          <h2>Your Team</h2>
          {loading && <p>Loading team...</p>}
          <div className="w-full max-w-4xl mx-auto">
            <DataTable columns={columns} data={limitedUsers} />
          </div>
          <div className="flex items-center justify-center mt-4">
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