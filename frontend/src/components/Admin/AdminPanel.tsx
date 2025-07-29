import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/context/LanguageContext";
import { useRoles } from "@/hooks/useRoles";
import { t } from "@/translations";
import {
  FileText,
  LayoutDashboard,
  Menu,
  PinIcon,
  Settings,
  ShoppingBag,
  Users,
  Warehouse,
  ShieldUser,
  Building2,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
//import { useAppSelector } from "@/store/hooks";
//import { selectIsSuperVera } from "@/store/slices/usersSlice";

const AdminPanel = () => {
  //const isSuperVera = useAppSelector(selectIsSuperVera);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Translation
  const { lang } = useLanguage();
  const { isSuperAdmin, hasAnyRole } = useRoles();
  const canManageLocations = hasAnyRole([
    "main_admin",
    "storage_manager",
    "super_admin",
    "superVera",
  ]);

  return (
    <div className="flex min-h-screen relative">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 p-4 border-r bg-white shadow-md">
        <nav className="flex flex-col space-y-4">
          <SidebarLink
            to="/admin"
            icon={<LayoutDashboard className="w-5 h-5" />}
            label={t.adminPanel.navigation.dashboard[lang]}
            end={true}
          />
          {isSuperAdmin && (
            <SidebarLink
              to="/admin/organizations"
              icon={<Building2 className="w-5 h-5" />}
              label={t.adminPanel.navigation.organizations[lang]}
              end={true}
            />
          )}

          <SidebarLink
            to="/admin/bookings"
            icon={<ShoppingBag className="w-5 h-5" />}
            label={t.adminPanel.navigation.bookings[lang]}
          />

          <SidebarLink
            to="/admin/items"
            icon={<Warehouse className="w-5 h-5" />}
            label={t.adminPanel.navigation.items[lang]}
          />

          <SidebarLink
            to="/admin/tags"
            icon={<PinIcon className="w-5 h-5" />}
            label={t.adminPanel.navigation.tags[lang]}
          />

          <SidebarLink
            to="/admin/users"
            icon={<Users className="w-5 h-5" />}
            label={t.adminPanel.navigation.users[lang]}
          />

          {/* {isSuperVera && (
            <SidebarLink
              to="/admin/team"
              icon={<Users className="w-5 h-5"/>}
              label={t.adminPanel.navigation.team[lang]}
            />
          )} */}
          <SidebarLink
            to="/admin/logs"
            icon={<FileText className="w-5 h-5" />}
            label={t.adminPanel.navigation.logs[lang] || "Logs"}
          />

          {/* Add the new Roles link */}
          <SidebarLink
            to="/admin/roles"
            icon={<ShieldUser className="w-5 h-5" />}
            label={t.adminPanel.navigation.roles[lang]}
          />

          {/* Organization Locations - accessible to storage managers and above */}
          {canManageLocations && (
            <SidebarLink
              to="/admin/locations"
              icon={<MapPin className="w-5 h-5" />}
              label="Locations"
            />
          )}

          <SidebarLink
            to="/profile"
            icon={<Settings className="w-5 h-5" />}
            label={t.adminPanel.navigation.settings[lang]}
          />
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="md:hidden absolute top-4 left-4 z-50"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="flex items-center pt-2 gap-2">
            <img src={logo} alt="Logo" className="h-10" />
            <h2 className="text-lg font-bold">{t.adminPanel.title[lang]}</h2>
          </div>
          <nav className="flex flex-col space-y-4">
            <SidebarLink
              to="/admin"
              icon={<LayoutDashboard />}
              label={t.adminPanel.navigation.dashboard[lang]}
            />
            <SidebarLink
              to="/admin/bookings"
              icon={<ShoppingBag />}
              label={t.adminPanel.navigation.bookings[lang]}
            />
            <SidebarLink
              to="/admin/items"
              icon={<Warehouse />}
              label={t.adminPanel.navigation.items[lang]}
            />
            <SidebarLink
              to="/admin/tags"
              icon={<PinIcon />}
              label={t.adminPanel.navigation.tags[lang]}
            />
            <SidebarLink
              to="/admin/users"
              icon={<Users />}
              label={t.adminPanel.navigation.users[lang]}
            />
            {/* {isSuperVera && (
              <SidebarLink 
                to="/admin/team" 
                icon={<Users />} 
                label={t.adminPanel.navigation.team[lang]} 
              />
            )} */}
            <SidebarLink
              to="/admin/logs"
              icon={<FileText />}
              label={t.adminPanel.navigation.logs[lang] || "Logs"}
            />
            <SidebarLink
              to="/profile"
              icon={<Settings />}
              label={t.adminPanel.navigation.settings[lang]}
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
  end = false,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
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
