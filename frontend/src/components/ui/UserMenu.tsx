import {
  Language,
  SUPPORTED_LANGUAGES,
  useLanguage,
} from "@/context/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useRoles } from "@/hooks/useRoles";
import { useAppDispatch } from "@/store/hooks";
import { setRedirectUrl } from "@/store/slices/uiSlice";
import { getOrgLabel } from "@/utils/format";
import {
  ArrowLeft,
  ArrowLeftRight,
  CalendarDays,
  Globe,
  LogOut,
  UserIcon,
  UserRound,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "./navigation-menu";
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
  const [selectGroup, setSelectGroup] = useState<
    "roles" | "links" | "languages"
  >("links");
  const isSelectingRole = selectGroup === "roles";
  const isSelectingLanguage = selectGroup === "languages";

  const {
    organizationId: activeOrgId,
    organizationName: activeOrgName,
    roleName: activeRoleName,
  } = activeContext;
  const { isTablet, isMobile } = useIsMobile();

  // Filter to only active roles
  const activeRoles = currentUserRoles.filter((role) => role.is_active);

  // Create role options with format "Role @ Organization"
  const roleOptions = activeRoles.map((role) => {
    const {
      organization_id: orgId,
      role_name: roleName,
      organization_name: orgName,
    } = role;
    return {
      value: `${orgId}:${roleName}`,
      label: getOrgLabel(userName, roleName ?? "", orgName ?? ""),
      orgId: orgId,
      roleName: roleName,
      orgName: orgName,
    };
  });

  // Automatically set the only role as active if there's just one role
  useEffect(() => {
    if (activeRoles.length === 1 && !activeOrgId) {
      const singleRole = activeRoles[0] as {
        organization_id: string;
        role_name: string;
        organization_name: string;
      };
      void setActiveContext(
        singleRole.organization_id,
        singleRole.role_name,
        singleRole.organization_name,
      );
    }
  }, [activeRoles, activeContext, setActiveContext, activeOrgId]);

  // Handler for changing the active context
  const handleContextChange = (value: string) => {
    // Set local value for immediate UI feedback

    // Otherwise, we're setting a new context
    const [orgId, roleName] = value.split(":");
    const org = currentUserOrganizations.find(
      (o) => o.organization_id === orgId,
    );

    if (orgId && roleName && org) {
      // Save the new role context
      // Get the current path to check if redirection is needed
      const currentPath = location.pathname;
      const ROLES_WITH_ACCESS = [
        "tenant_admin",
        "super_admin",
        "storage_manager",
      ];
      const willHaveAdminAccess = ROLES_WITH_ACCESS.includes(roleName);
      // If we're in the admin area, check if the new role has admin access
      if (currentPath.startsWith("/admin") && !willHaveAdminAccess) {
        void dispatch(setRedirectUrl("/storage"));
      }
      setActiveContext(orgId, roleName, org.organization_name);
    }
  };

  // Hide the switcher if there's only one role
  if (activeRoles.length <= 1) {
    return null;
  }

  return (
    <NavigationMenu>
      <NavigationMenuItem className="font-main">
        <NavigationMenuTrigger className="gap-3 p-1 px-2 h-fit">
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
            <p className="text-xs font-main !font-[var(--main-font)]">
              {activeRoleName !== "user" &&
                getOrgLabel(userName, activeRoleName!, activeOrgName!)}
            </p>
            <p className="text-md">{userName}</p>
          </div>
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          {isSelectingRole && (
            <ul className="flex w-[200px] flex-col">
              <NavigationMenuLink
                className="flex flex-row items-center font-main hover:cursor-pointer gap-2 text-sm p-2"
                onClick={() => setSelectGroup("links")}
              >
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                {t.common.back[lang]}
              </NavigationMenuLink>
              {roleOptions.map((opt) => (
                <NavigationMenuLink
                  onClick={() =>
                    handleContextChange(`${opt.orgId}:${opt.roleName}`)
                  }
                  className="flex flex-row items-center font-main hover:cursor-pointer gap-2 text-sm p-2"
                >
                  {getOrgLabel(userName, opt.roleName!, opt.orgName!)}
                </NavigationMenuLink>
              ))}
            </ul>
          )}
          {isSelectingLanguage && (
            <ul className="flex w-[200px] flex-col">
              <NavigationMenuLink
                className="flex flex-row items-center font-main hover:cursor-pointer gap-2 text-sm p-2"
                onClick={() => setSelectGroup("links")}
              >
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                {t.common.back[lang]}
              </NavigationMenuLink>
              {SUPPORTED_LANGUAGES.map((l) => (
                <NavigationMenuLink
                  asChild
                  onClick={() => {
                    setLanguage(l.key as Language);
                    setSelectGroup("links");
                  }}
                >
                  <div className="flex flex-row items-center font-main hover:cursor-pointer gap-2">
                    {l.translations[lang]}
                  </div>
                </NavigationMenuLink>
              ))}
            </ul>
          )}
          {!isSelectingLanguage && !isSelectingRole && (
            <ul className="grid w-[200px] gap-1">
              <NavigationMenuLink asChild>
                <Link to="/profile">
                  <div className="flex flex-row items-center font-main hover:cursor-pointer gap-2">
                    <UserRound className="w-4 h-4 text-muted-foreground" />
                    {t.userMenu.links.myProfile[lang]}
                  </div>
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link to="/profile?tab=bookings">
                  <div className="flex flex-row items-center font-main hover:cursor-pointer gap-2">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    {activeRoleName === "user"
                      ? t.userMenu.links.myBookings[lang]
                      : t.userMenu.links.orgBookings[lang]}
                  </div>
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink
                asChild
                onClick={() => setSelectGroup("roles")}
              >
                <div className="flex flex-row items-center font-main hover:cursor-pointer gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-muted-foreground " />
                  {t.userMenu.links.changeOrg[lang]}
                </div>
              </NavigationMenuLink>
              <NavigationMenuLink
                asChild
                onClick={() => setSelectGroup("languages")}
              >
                <div className="flex flex-row items-center font-main hover:cursor-pointer gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground " />
                  {t.userMenu.links.changeLang[lang]}
                </div>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <button
                  onClick={signOut}
                  className="flex flex-row items-center font-main hover:cursor-pointer gap-2"
                >
                  <LogOut className="w-4 h-4 text-muted-foreground " />
                  {t.userMenu.links.logOut[lang]}
                </button>
              </NavigationMenuLink>
            </ul>
          )}
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuViewport
        wrapperClassName={`${(isTablet || isMobile) && "!left-auto !right-0"}`}
      />
    </NavigationMenu>
  );
};
