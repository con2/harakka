import Logo from "@/assets/v4.svg?react";
import { useRoles } from "@/hooks/useRoles";
import { useNavigate } from "react-router-dom";
import { SheetContent } from "./ui/sheet";
import { useAppSelector } from "@/store/hooks";
import { selectActiveOrganizationId } from "@/store/slices/rolesSlice";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";

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

  const handleNavigation = (link: string) => {
    void navigate(link);
    closeMenu();
  };

  return (
    <SheetContent
      side="top"
      //Style for all child buttons
      className="h-fit p-6 [&_button:not(.languageSwitcher_*)]:justify-start 
      [&_button:not(.languageSwitcher_*)]:px-3 
      [&_button:not(.languageSwitcher_*)]:text-base 
      [&_button:not(.languageSwitcher_*)]:py-2 
      [&_button:not(.languageSwitcher_*)]:h-fit 
      [&_button:not(.languageSwitcher_*):hover]:bg-[var(--subtle-grey)]"
    >
      <div>
        <Logo className="w-40 mb-4" />

        <div>
          {/* User Links */}
          <div className="flex flex-col mb-4">
            <Button onClick={() => handleNavigation("/storage")}>
              Storage
            </Button>
            <Button onClick={() => handleNavigation("/cart")}>Cart</Button>
            {isGlobalUser && (
              <>
                <Button onClick={() => handleNavigation("/contact-us")}>
                  Contact Us
                </Button>
                <Button onClick={() => handleNavigation("/how-it-works")}>
                  Guide
                </Button>
                <Button
                  onClick={() => handleNavigation("/profile?tab=bookings")}
                >
                  My Bookings
                </Button>
                <Button onClick={() => handleNavigation("/organizations")}>
                  Organizations
                </Button>
              </>
            )}
            <Button
              className="gap-2"
              onClick={isLoggedIn ? signOut : () => handleNavigation("/login")}
            >
              {isLoggedIn ? "Log out" : "Log in"}
            </Button>
          </div>

          {/* Admin Links */}
          <div className="flex flex-col mb-10">
            {isAnyTypeOfAdmin && (
              <p className="mb-2 font-semibold text-lg">Admin Shortcuts</p>
            )}
            {isAnyTypeOfAdmin && (
              <Button onClick={() => handleNavigation("/admin")}>
                Dashboard
              </Button>
            )}
            {(isTenantAdmin || isStorageManager) && (
              <Button onClick={() => handleNavigation("/admin/bookings")}>
                Bookings
              </Button>
            )}
            {(isTenantAdmin || isStorageManager) && (
              <Button onClick={() => handleNavigation("/admin/categories")}>
                Categories
              </Button>
            )}
            {(isTenantAdmin || isSuperAdmin) && (
              <Button onClick={() => handleNavigation("/admin/users")}>
                Users
              </Button>
            )}
            {isSuperAdmin && (
              <Button onClick={() => handleNavigation("/admin/logs")}>
                Logs
              </Button>
            )}
            {(isStorageManager || isTenantAdmin) && (
              <Button onClick={() => handleNavigation("/profile?tab=bookings")}>
                Organization Bookings
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-3">
        <div className="languageSwitcher flex gap-3">
          <Label>Language</Label>
          <LanguageSwitcher />
        </div>
      </div>
    </SheetContent>
  );
}

export default MobileMenu;
