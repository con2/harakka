import { useLanguage } from "@/context/LanguageContext";
import { useRoles } from "@/hooks/useRoles";
import { t } from "@/translations";
import {
  FileText,
  LayoutDashboard,
  PinIcon,
  Settings,
  ShoppingBag,
  Users,
  Warehouse,
  Building2,
  MapPin,
  LayoutGrid,
} from "lucide-react";
import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";

const AdminPanel = () => {
  const { lang } = useLanguage();
  const { hasAnyRole, hasRole, setupPeriodicSessionCheck } = useRoles();

  // Set up JWT expirity check every 3 minutes
  useEffect(() => {
    const cleanup = setupPeriodicSessionCheck(3);
    return cleanup;
  }, [setupPeriodicSessionCheck]);

  // Check if user has any admin role
  const isAnyTypeOfAdmin = hasAnyRole([
    "tenant_admin",
    "super_admin",
    "storage_manager",
  ]);

  return (
    <div className="flex min-h-screen relative">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 p-4 border-r bg-white shadow-md">
        <nav className="flex flex-col gap-3">
          {isAnyTypeOfAdmin && (
            <SidebarLink
              to="/admin"
              icon={<LayoutDashboard className="w-5 h-5" />}
              label={t.adminPanel.navigation.dashboard[lang]}
              end={true}
              dataCy="admin-nav-dashboard"
            />
          )}

          {hasAnyRole(["super_admin"]) && (
            <SidebarLink
              to="/admin/organizations"
              icon={<Building2 className="w-5 h-5" />}
              label={
                t.adminPanel.navigation.organizations[lang] || "Organizations"
              }
              end={true}
              dataCy="admin-nav-organizations"
            />
          )}

          {hasAnyRole(["storage_manager", "tenant_admin"]) && (
            <SidebarLink
              to="/admin/bookings"
              icon={<ShoppingBag className="w-5 h-5" />}
              label={t.adminPanel.navigation.bookings[lang]}
              dataCy="admin-nav-bookings"
            />
          )}

          {/* Overdue moved under Bookings as a filter */}

          {hasAnyRole(["tenant_admin", "storage_manager"]) && (
            <SidebarLink
              to="/admin/items"
              icon={<Warehouse className="w-5 h-5" />}
              label={t.adminPanel.navigation.items[lang]}
              dataCy="admin-nav-items"
            />
          )}
          {hasAnyRole(["tenant_admin", "storage_manager"]) && (
            <SidebarLink
              to="/admin/categories"
              icon={<LayoutGrid className="w-5 h-5" />}
              label={t.adminPanel.navigation.categories[lang]}
              dataCy="admin-nav-tags"
            />
          )}

          {hasAnyRole(["superVera", "tenant_admin", "storage_manager"]) && (
            <SidebarLink
              to="/admin/tags"
              icon={<PinIcon className="w-5 h-5" />}
              label={t.adminPanel.navigation.tags[lang]}
              dataCy="admin-nav-tags"
            />
          )}

          {hasAnyRole(["super_admin", "tenant_admin"]) && (
            <SidebarLink
              to="/admin/users"
              icon={<Users className="w-5 h-5" />}
              label={t.adminPanel.navigation.users[lang]}
              dataCy="admin-nav-users"
            />
          )}

          {hasRole("super_admin") && (
            <SidebarLink
              to="/admin/logs"
              icon={<FileText className="w-5 h-5" />}
              label={t.adminPanel.navigation.logs[lang] || "Logs"}
              dataCy="admin-nav-logs"
            />
          )}

          {hasAnyRole(["tenant_admin", "storage_manager"]) && (
            <SidebarLink
              to="/admin/locations"
              icon={<MapPin className="w-5 h-5" />}
              label={t.adminPanel.navigation.locations[lang]}
              dataCy="admin-nav-locations"
            />
          )}

          {hasRole("user") && (
            <SidebarLink
              to="/profile"
              icon={<Settings className="w-5 h-5" />}
              label={t.adminPanel.navigation.settings[lang]}
              dataCy="admin-nav-settings"
            />
          )}
        </nav>
      </aside>

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
  dataCy,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
  dataCy?: string;
}) => (
  <NavLink
    to={to}
    end={end}
    data-cy={dataCy}
    className={({ isActive }: { isActive: boolean }) =>
      `flex items-center gap-3 p-2 rounded hover:bg-(--subtle-grey) ${
        isActive
          ? "text-(--iridiscent-blue) bg-(--subtle-grey)"
          : "text-gray-700"
      }`
    }
  >
    <span className="w-5 h-5">{icon}</span>
    {label}
  </NavLink>
);

export default AdminPanel;
