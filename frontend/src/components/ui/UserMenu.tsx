// UserMenuDropdown.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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

import { Language, useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useRoles } from "@/hooks/useRoles";
import { useAppDispatch } from "@/store/hooks";
import { setRedirectUrl } from "@/store/slices/uiSlice";
import { getOrgLabel } from "@/utils/format";
import { t } from "@/translations";
import { SUPPORTED_LANGUAGES } from "@/translations/SUPPORTED_LANGUAGES";

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
  const { name: userName, avatarUrl, email } = useProfile(user);
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [selectGroup, setSelectGroup] = useState<
    "roles" | "links" | "languages"
  >("links");
  const ref = useRef<null | HTMLDivElement>(null);

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
      <DropdownMenuTrigger asChild className="text-primary">
        <button className="gap-3 p-1 px-2 h-fit flex items-center">
          {avatarUrl && avatarUrl.trim() !== "" ? (
            <img
              src={avatarUrl}
              className="inline h-6 w-6 rounded-full"
              alt=""
            />
          ) : (
            <UserIcon className="inline h-6 w-6 rounded-full" />
          )}
          <div className="flex flex-col text-start font-main flex-col">
            <p className="text-md">{userName || email}</p>
            <p className="text-xs !font-[var(--main-font)]">
              {activeRoleName !== "user" &&
                activeRoleName &&
                activeOrgName &&
                getOrgLabel(userName, activeRoleName, activeOrgName)}
            </p>
          </div>
          <ChevronDown
            aria-hidden
            className={`w-3 h-3 transition-transform ${
              open ? "transform-[rotate(180deg)]" : "transform-[rotate(0deg)]"
            }`}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[200px]">
        {selectGroup !== "links" && (
          <>
            <div ref={ref} tabIndex={-1}>
              <DropdownMenuItem
                id="usermenu-back"
                onSelect={(e) => {
                  e.preventDefault();
                  setSelectGroup("links");
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft
                  aria-hidden
                  className="w-4 h-4 text-muted-foreground"
                />
                {t.common.back[lang]}
              </DropdownMenuItem>
            </div>
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
                id="usermenu-my-profile"
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2"
              >
                <UserRound
                  aria-hidden
                  className="w-4 h-4 text-muted-foreground"
                />
                {t.userMenu.links.myProfile[lang]}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                id="usermenu-my-bookings"
                onClick={() => setOpen(false)}
                to="/my-bookings"
                className="flex items-center gap-2"
              >
                <CalendarDays
                  aria-hidden
                  className="w-4 h-4 text-muted-foreground"
                />
                {activeRoleName === "user"
                  ? t.userMenu.links.myBookings[lang]
                  : t.userMenu.links.orgBookings[lang]}
              </Link>
            </DropdownMenuItem>

            {activeRoles.length > 1 && (
              <div ref={ref} tabIndex={-1}>
                <DropdownMenuItem
                  id="usermenu-change-org"
                  onSelect={(e) => {
                    e.preventDefault();
                    setSelectGroup("roles");
                    ref.current?.focus();
                  }}
                  className="flex items-center gap-2"
                >
                  <ArrowLeftRight
                    aria-hidden
                    className="w-4 h-4 text-muted-foreground"
                  />
                  {t.userMenu.links.changeOrg[lang]}
                </DropdownMenuItem>
              </div>
            )}

            <div ref={ref} tabIndex={-1}>
              <DropdownMenuItem
                id="usermenu-change-lang"
                onSelect={(e) => {
                  e.preventDefault();
                  setSelectGroup("languages");
                  ref.current?.focus();
                }}
                className="flex items-center gap-2"
              >
                <Globe aria-hidden className="w-4 h-4 text-muted-foreground" />
                {t.userMenu.links.changeLang[lang]}
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              id="usermenu-log-out"
              onSelect={() => {
                void signOut();
                void navigate("/");
              }}
              className="flex items-center gap-2"
            >
              <LogOut aria-hidden className="w-4 h-4 text-muted-foreground" />
              {t.userMenu.links.logOut[lang]}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
