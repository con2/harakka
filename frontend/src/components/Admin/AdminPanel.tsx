import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  Warehouse,
  PinIcon,
  ShoppingBag,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useAppSelector } from "@/store/hooks";
import { selectIsSuperVera } from "@/store/slices/usersSlice";

const AdminPanel = () => {
  const isSuperVera = useAppSelector(selectIsSuperVera);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 p-4 border-r bg-white shadow-md">
        <nav className="flex flex-col space-y-4">
          <SidebarLink
            to="/admin"
            icon={<LayoutDashboard />}
            label="Dashboard"
          />
          
          <SidebarLink
            to="/admin/users"
            icon={<Users />}
            label="Users"
          />

          {isSuperVera && (
            <SidebarLink
              to="/admin/team"
              icon={<Users />}
              label="Team"
            />
          )}

          <SidebarLink
            to="/admin/items"
            icon={<Warehouse />}
            label="Items"
          />

          <SidebarLink
            to="/admin/tags"
            icon={<PinIcon />}
            label="Tags"
          />

          <SidebarLink
            to="/admin/orders"
            icon={<ShoppingBag />}
            label="Orders"
          />

          <SidebarLink
            to="/admin/settings"
            icon={<Settings />}
            label="Settings"
          />
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden absolute top-4 left-4">
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-10" />
            <h2 className="text-lg font-bold">Admin Panel</h2>
          </div>
          <Separator className="my-4" />
          <nav className="flex flex-col space-y-4">
            <SidebarLink
              to="/admin"
              icon={<LayoutDashboard />}
              label="Dashboard"
            />
            <SidebarLink to="/admin/users" icon={<Users />} label="Users" />
            {isSuperVera && (
              <SidebarLink to="/admin/team" icon={<Users />} label="Team" />
            )}

            <SidebarLink to="/admin/items" icon={<Warehouse />} label="Items" />
            <SidebarLink
              to="/admin/orders"
              icon={<ShoppingBag />}
              label="Orders"
            />
            <SidebarLink
              to="/admin/settings"
              icon={<Settings />}
              label="Settings"
            />
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <Outlet /> {/* Render the child component based on the URL */}
      </div>
    </div>
  );
};

const SidebarLink = ({
  to,
  icon,
  label,
  end=false,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?:boolean;
}) => (
  <NavLink
    to={to}
    end={end} // Ensures exact match
    className={({ isActive }: { isActive: boolean }) =>
      `flex items-center gap-3 p-2 rounded hover:bg-gray-200 ${
        isActive ? "text-highlight2" : "text-gray-700"
      }`
    }
  >
    <span className="w-5 h-5">{icon}</span>
    {label}
  </NavLink>
);

export default AdminPanel;
