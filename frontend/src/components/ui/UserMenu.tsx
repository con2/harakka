// UserMenuDropdown.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"; // adjust path to your project
import {
  ArrowLeft,
  ArrowLeftRight,
  CalendarDays,
  ChevronDown,
  Globe,
  LogOut,
  UserIcon,
  UserRound,
} from "lucide-react";

import {
  Language,
  SUPPORTED_LANGUAGES,
  useLanguage,
} from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useRoles } from "@/hooks/useRoles";
import { useAppDispatch } from "@/store/hooks";
import { setRedirectUrl } from "@/store/slices/uiSlice";
import { getOrgLabel } from "@/utils/format";
import { t } from "@/translations";

export const UserMenu: React.FC = () => {
  const {
    currentUserRoles,
    currentUserOrganizations,
    activeContext,
    setActiveContext,
  } = useRoles();
  const { lang, setLanguage } = useLanguage();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { name: userName, avatarUrl } = useProfile(user);
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const toggleMenu = () => setOpen((prev) => !prev);
  const [selectGroup, setSelectGroup] = useState<
    "roles" | "links" | "languages"
  >("links");

  const {
    organizationId: activeOrgId,
    organizationName: activeOrgName,
    roleName: activeRoleName,
  } = activeContext;

  const navigate = useNavigate();

  // Filter to only active roles
  const activeRoles = currentUserRoles.filter((role) => role.is_active);

  const roleOptions = activeRoles.map((role) => ({
    value: `${role.organization_id}:${role.role_name}`,
    label: getOrgLabel(
      userName,
      role.role_name ?? "",
      role.organization_name ?? "",
    ),
    orgId: role.organization_id,
    roleName: role.role_name,
    orgName: role.organization_name,
  }));

  useEffect(() => {
    if (activeRoles.length === 1 && !activeOrgId) {
      const r = activeRoles[0];
      void setActiveContext(
        r.organization_id!,
        r.role_name!,
        r.organization_name!,
      );
    }
  }, [activeRoles, activeOrgId, setActiveContext]);

  const handleContextChange = (value: string) => {
    const [orgId, roleName] = value.split(":");
    const org = currentUserOrganizations.find(
      (o) => o.organization_id === orgId,
    );

    if (orgId && roleName && org) {
      const currentPath = location.pathname;
      const ROLES_WITH_ACCESS = [
        "tenant_admin",
        "super_admin",
        "storage_manager",
      ];
      const willHaveAdminAccess = ROLES_WITH_ACCESS.includes(roleName);
      if (currentPath.startsWith("/admin") && !willHaveAdminAccess) {
        void dispatch(setRedirectUrl("/storage"));
      }
      setActiveContext(orgId, roleName, org.organization_name);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="gap-3 p-1 px-2 h-fit flex items-center">
          {avatarUrl && avatarUrl.trim() !== "" ? (
            <img
              src={avatarUrl}
              className="inline h-6 w-6 rounded-full"
              alt="User avatar"
            />
          ) : (
            <UserIcon className="inline h-6 w-6 rounded-full" />
          )}
          <div className="flex flex-col text-start font-main flex-col-reverse">
            <p className="text-xs !font-[var(--main-font)]">
              {activeRoleName !== "user" &&
                activeRoleName &&
                activeOrgName &&
                getOrgLabel(userName, activeRoleName, activeOrgName)}
            </p>
            <p className="text-md">{userName}</p>
          </div>
          <ChevronDown
            className={`w-3 h-3 transition-transform ${open ? "transform-[rotate(180deg)]" : "transform-[rotate(0deg)]"}`}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[200px]">
        {selectGroup !== "links" && (
          <>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setSelectGroup("links");
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              {t.common.back[lang]}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Roles */}
        {selectGroup === "roles" && (
          <>
            {roleOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onSelect={(e) => {
                  e.preventDefault();
                  handleContextChange(opt.value);
                  setSelectGroup("links");
                  setOpen(false);
                }}
                className="text-sm"
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </>
        )}

        {/* Languages */}
        {selectGroup === "languages" && (
          <>
            {SUPPORTED_LANGUAGES.map((l) => (
              <DropdownMenuItem
                key={l.key}
                onSelect={() => {
                  setLanguage(l.key as Language);
                  setSelectGroup("links");
                  setOpen(false);
                }}
                className="text-sm"
              >
                {l.translations[lang]}
              </DropdownMenuItem>
            ))}
          </>
        )}

        {/* Main links */}
        {selectGroup === "links" && (
          <>
            <DropdownMenuItem asChild>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2"
              >
                <UserRound className="w-4 h-4 text-muted-foreground" />
                {t.userMenu.links.myProfile[lang]}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                onClick={() => setOpen(false)}
                to="/profile?tab=bookings"
                className="flex items-center gap-2"
              >
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                {activeRoleName === "user"
                  ? t.userMenu.links.myBookings[lang]
                  : t.userMenu.links.orgBookings[lang]}
              </Link>
            </DropdownMenuItem>

            {activeRoles.length > 1 && (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setSelectGroup("roles");
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                {t.userMenu.links.changeOrg[lang]}
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setSelectGroup("languages");
              }}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4 text-muted-foreground" />
              {t.userMenu.links.changeLang[lang]}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onSelect={() => {
                void signOut();
                void navigate("/");
              }}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
              {t.userMenu.links.logOut[lang]}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
