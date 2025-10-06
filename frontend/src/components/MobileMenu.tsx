import Logo from "@/assets/v8.5.svg?react";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { useAppSelector } from "@/store/hooks";
import { selectActiveRoleContext } from "@/store/slices/rolesSlice";
import { t } from "@/translations";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { SheetContent, SheetDescription, SheetTitle } from "./ui/sheet";
import { useLanguage } from "@/context/LanguageContext";

type MobileMenuProps = {
  closeMenu: () => void;
};

function MobileMenu({ closeMenu }: MobileMenuProps) {
  const { roleName: activeRole, organizationId: activeOrgId } = useAppSelector(
    selectActiveRoleContext,
  );
  const { signOut, user } = useAuth();
  const isLoggedIn = !!user;
  const navigate = useNavigate();
  const { hasAnyRole, hasRole } = useRoles();
  const isAnyTypeOfAdmin = hasAnyRole([
    "requester",
    "tenant_admin",
    "super_admin",
    "storage_manager",
  ]);
  const isSuperAdmin = activeRole === "super_admin";
  const isTenantAdmin = activeRole === "tenant_admin";
  const isStorageManager = activeRole === "storage_manager";
  const isRequester = activeRole === "requester";
  const isGlobalUser = hasRole("user", activeOrgId!);

  const { lang } = useLanguage();

  const handleNavigation = (link: string) => {
    void navigate(link);
    closeMenu();
  };

  return (
    <SheetContent
      side="top"
      //Style for all child buttons
      className="h-fit p-6
      [&_button:not(.languageSwitcher_*)]:px-3
      [&_button:not(.languageSwitcher_*)]:text-base 
      [&_button:not(.languageSwitcher_*)]:py-2 
      [&_button:not(.languageSwitcher_*)]:justify-between 
      [&_button:not(.languageSwitcher_*)]:h-fit 
      [&_button:not(.languageSwitcher_*):hover]:bg-[var(--subtle-grey)]"
    >
      <div>
        <Logo
          className="w-40 mb-4 hover:cursor-pointer"
          onClick={() => handleNavigation("/")}
        />
        <SheetTitle className="sr-only">
          {t.mobileMenu.aria.title[lang]}
        </SheetTitle>
        <SheetDescription className="sr-only">
          {t.mobileMenu.aria.description[lang]}
        </SheetDescription>

        <div>
          {/* User Links */}
          <div className="flex flex-col mb-6">
            <p className="mb-2 font-semibold text-lg text-(--iridiscent-blue)">
              {t.mobileMenu.headings.users[lang]}
            </p>
            <Button onClick={() => handleNavigation("/storage")}>
              {t.mobileMenu.buttons.browseItems[lang]}
              <ChevronRight />
            </Button>
            <Button onClick={() => handleNavigation("/cart")}>
              {t.mobileMenu.buttons.cart[lang]}
              <ChevronRight />
            </Button>
            {isLoggedIn && (
              <Button onClick={() => handleNavigation("/my-bookings")}>
                {t.mobileMenu.buttons.myBookings[lang]} <ChevronRight />
              </Button>
            )}
            {isGlobalUser && (
              <>
                <Button onClick={() => handleNavigation("/how-it-works")}>
                  {t.mobileMenu.buttons.guide[lang]}
                  <ChevronRight />
                </Button>
                <Button onClick={() => handleNavigation("/organizations")}>
                  {t.mobileMenu.buttons.organizations[lang]}
                  <ChevronRight />
                </Button>
                <Button onClick={() => handleNavigation("/contact-us")}>
                  {t.mobileMenu.buttons.contactUs[lang]}
                  <ChevronRight />
                </Button>
              </>
            )}
            <Button
              className="gap-2"
              onClick={isLoggedIn ? signOut : () => handleNavigation("/login")}
            >
              {isLoggedIn
                ? t.mobileMenu.buttons.logOut[lang]
                : t.mobileMenu.buttons.logIn[lang]}
              <ChevronRight />
            </Button>
          </div>

          {/* Admin Links */}
          <div className="flex flex-col">
            {isAnyTypeOfAdmin && (
              <p className="mb-2 font-semibold text-lg text-(--iridiscent-blue)">
                {t.mobileMenu.headings.admin[lang]}
              </p>
            )}
            {isAnyTypeOfAdmin && !isRequester && (
              <>
                <Button onClick={() => handleNavigation("/admin")}>
                  {t.adminPanel.navigation.dashboard[lang]}
                  <ChevronRight />
                </Button>
              </>
            )}
            {(isTenantAdmin || isStorageManager) && (
              <>
                <Button onClick={() => handleNavigation("/admin/bookings")}>
                  {t.adminPanel.navigation.bookingsIn[lang]}
                  <ChevronRight />
                </Button>
                <Button onClick={() => handleNavigation("/admin/categories")}>
                  {t.adminPanel.navigation.categories[lang]}
                  <ChevronRight />
                </Button>
                <Button onClick={() => handleNavigation("/admin/items")}>
                  {t.adminPanel.navigation.items[lang]}
                  <ChevronRight />
                </Button>
                <Button onClick={() => handleNavigation("/admin/tags")}>
                  {t.adminPanel.navigation.tags[lang]}
                  <ChevronRight />
                </Button>
              </>
            )}
            {(isTenantAdmin || isStorageManager || isRequester) && (
              <Button onClick={() => handleNavigation("/admin/requests")}>
                {t.adminPanel.navigation.bookingsOut[lang]}
                <ChevronRight />
              </Button>
            )}
            {(isTenantAdmin || isSuperAdmin) && (
              <>
                <Button onClick={() => handleNavigation("/admin/users")}>
                  {t.adminPanel.navigation.users[lang]}
                  <ChevronRight />
                </Button>
              </>
            )}
            {isSuperAdmin && (
              <>
                <Button onClick={() => handleNavigation("/admin/logs")}>
                  {t.adminPanel.navigation.logs[lang]}
                  <ChevronRight />
                </Button>
                <Button
                  onClick={() => handleNavigation("/admin/organizations")}
                >
                  {t.adminPanel.navigation.organizations[lang]}
                  <ChevronRight />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-3">
        <div className="languageSwitcher flex gap-3">
          <Label>{t.mobileMenu.labels.language[lang]}</Label>
          <LanguageSwitcher />
        </div>
      </div>
    </SheetContent>
  );
}

export default MobileMenu;
