import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllUsers, selectAllUsers, selectLoading, selectError } from "@/store/slices/usersSlice";
import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from "./ui/sidebar";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Settings, Menu } from "lucide-react";
import logo from "@/assets/logo.png";

const AdminPanel = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  return (
    <div className="flex h-screen">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white p-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-10" />
          <h2 className="text-lg font-bold">Admin Panel</h2>
        </div>
        <Separator className="my-4 bg-gray-700" />
        
        <nav className="flex flex-col space-y-4">
          <SidebarLink to="/admin" icon={<LayoutDashboard />} label="Dashboard" />
          <SidebarLink to="/admin/users" icon={<Users />} label="Users" />
          <SidebarLink to="/admin/settings" icon={<Settings />} label="Settings" />
        </nav>
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden absolute top-4 left-4">
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-gray-900 text-white w-64">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-10" />
            <h2 className="text-lg font-bold">Admin Panel</h2>
          </div>
          <Separator className="my-4 bg-gray-700" />

          <nav className="flex flex-col space-y-4">
            <SidebarLink to="/admin" icon={<LayoutDashboard />} label="Dashboard" />
            <SidebarLink to="/admin/users" icon={<Users />} label="Users" />
            <SidebarLink to="/admin/settings" icon={<Settings />} label="Settings" />
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <Outlet />
      </div>
    

      {/* {loading && <p>Loading users...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="bg-white p-4 rounded shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-2">{user.id}</td>
                  <td className="p-2">{user.full_name}</td>
                  <td className="p-2">{user.email}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-2 text-center">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div> */}
    </div>
  );
};

// Sidebar Link Component
const SidebarLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <Link to={to} className="flex items-center gap-3 p-2 rounded hover:bg-gray-800">
    <span className="w-5 h-5">{icon}</span>
    {label}
  </Link>
);

export default AdminPanel;
