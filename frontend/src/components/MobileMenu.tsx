import Logo from "@/assets/v4.5.svg?react";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { useAppSelector } from "@/store/hooks";
import { selectActiveOrganizationId } from "@/store/slices/rolesSlice";
import { t } from "@/translations";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { SheetContent } from "./ui/sheet";
import { useLanguage } from "@/context/LanguageContext";

type MobileMenuProps = {
  closeMenu: () => void;
};

function MobileMenu({ closeMenu }: MobileMenuProps) {
  const activeOrg = useAppSelector(selectActiveOrganizationId);
  const { signOut, user } = useAuth();
  const isLoggedIn = !!user;
  const navigate = useNavigate();
  const { hasAnyRole, hasRole } = useRoles();
  const isAnyTypeOfAdmin = hasAnyRole([
    "tenant_admin",
    "super_admin",
    "storage_manager",
  ]);
  const isSuperAdmin = hasRole("super_admin", activeOrg!);
  const isTenantAdmin = hasRole("tenant_admin", activeOrg!);
  const isStorageManager = hasRole("storage_manager", activeOrg!);
  const isGlobalUser = hasRole("user", activeOrg!);

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
              {t.mobileMenu.buttons.cart[lang]} <ChevronRight />
            </Button>
            {isGlobalUser && (
              <>
                <Button onClick={() => handleNavigation("/how-it-works")}>
                  {t.mobileMenu.buttons.guide[lang]}
                  <ChevronRight />
                </Button>
                <Button onClick={() => handleNavigation("/my-bookings")}>
                  {t.mobileMenu.buttons.myBookings[lang]}
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
          <div className="flex flex-col mb-10">
            {isAnyTypeOfAdmin && (
              <p className="mb-2 font-semibold text-lg text-(--iridiscent-blue)">
                {t.mobileMenu.headings.admin[lang]}
              </p>
            )}
            {isAnyTypeOfAdmin && (
              <>
                <Button onClick={() => handleNavigation("/admin")}>
                  {t.adminPanel.navigation.dashboard[lang]}
                  <ChevronRight />
                </Button>
                <Button onClick={() => handleNavigation("/admin/items")}>
                  {t.adminPanel.navigation.items[lang]}
                  <ChevronRight />
                </Button>
              </>
            )}
            {(isTenantAdmin || isStorageManager) && (
              <Button onClick={() => handleNavigation("/admin/bookings")}>
                {t.adminPanel.navigation.bookings[lang]}
                <ChevronRight />
              </Button>
            )}
            {(isTenantAdmin || isStorageManager) && (
              <Button onClick={() => handleNavigation("/admin/categories")}>
                {t.adminPanel.navigation.categories[lang]}
                <ChevronRight />
              </Button>
            )}
            {(isTenantAdmin || isSuperAdmin) && (
              <>
                <Button onClick={() => handleNavigation("/admin/users")}>
                  {t.adminPanel.navigation.users[lang]}
                  <ChevronRight />
                </Button>
                <Button onClick={() => handleNavigation("/admin/tags")}>
                  {t.adminPanel.navigation.tags[lang]}
                  <ChevronRight />
                </Button>
              </>
            )}
            {isSuperAdmin && (
              <Button onClick={() => handleNavigation("/admin/logs")}>
                {t.adminPanel.navigation.logs[lang]}
                <ChevronRight />
              </Button>
            )}
            {(isStorageManager || isTenantAdmin) && (
              <Button onClick={() => handleNavigation("/my-bookings")}>
                {t.mobileMenu.buttons.orgBookings[lang]}
                <ChevronRight />
              </Button>
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
