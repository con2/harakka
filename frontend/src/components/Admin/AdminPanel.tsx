import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
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
    <div className="flex min-h-screen relative">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 p-4 border-r bg-white shadow-md">
        <nav className="flex flex-col space-y-4">
          <SidebarLink
            to="/admin"
            icon={<LayoutDashboard className="w-5 h-5"/>}
            label="Dashboard"
            end={true}
          />

          <SidebarLink
            to="/admin/orders"
            icon={<ShoppingBag className="w-5 h-5"/>}
            label="Orders"
          />

          <SidebarLink
            to="/admin/items"
            icon={<Warehouse className="w-5 h-5"/>}
            label="Items"
          />

          <SidebarLink
            to="/admin/tags"
            icon={<PinIcon className="w-5 h-5"/>}
            label="Tags"
          />
          
          <SidebarLink
            to="/admin/users"
            icon={<Users className="w-5 h-5"/>}
            label="Users"
          />

          {/* {isSuperVera && (
            <SidebarLink
              to="/admin/team"
              icon={<Users className="w-5 h-5"/>}
              label="Team"
            />
          )} */}

          <SidebarLink
            to="/profile"
            icon={<Settings className="w-5 h-5"/>}
            label="Settings"
          />
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          {/* TODO: Add the button to the navbar in mobile view instead of admin panel */}
          <Button variant="ghost" className="md:hidden absolute top-4 left-4 z-50">
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="flex items-center pt-2 gap-2">
            <img src={logo} alt="Logo" className="h-10" />
            <h2 className="text-lg font-bold">Admin Panel</h2>
          </div>
          <nav className="flex flex-col space-y-4">
            <SidebarLink
              to="/admin"
              icon={<LayoutDashboard />}
              label="Dashboard"
            />
            <SidebarLink
              to="/admin/orders"
              icon={<ShoppingBag />}
              label="Orders"
            />
            <SidebarLink to="/admin/items" icon={<Warehouse />} label="Items" />
            <SidebarLink to="/admin/tags" icon={<PinIcon />} label="Tags" />
            <SidebarLink to="/admin/users" icon={<Users />} label="Users" />
            {/* {isSuperVera && (
              <SidebarLink to="/admin/team" icon={<Users />} label="Team" />
            )} */}
            
            <SidebarLink
              to="/profile"
              icon={<Settings />}
              label="Settings"
            />
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
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
