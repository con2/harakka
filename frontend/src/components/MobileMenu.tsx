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
import { ChevronRight } from "lucide-react";

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
              Explore
            </p>
            <Button onClick={() => handleNavigation("/storage")}>
              Browse Items
              <ChevronRight />
            </Button>
            <Button onClick={() => handleNavigation("/cart")}>
              Cart <ChevronRight />
            </Button>
            {isGlobalUser && (
              <>
                <Button onClick={() => handleNavigation("/how-it-works")}>
                  Guide
                  <ChevronRight />
                </Button>
                <Button
                  onClick={() => handleNavigation("/profile?tab=bookings")}
                >
                  My Bookings
                  <ChevronRight />
                </Button>
                <Button onClick={() => handleNavigation("/organizations")}>
                  Organizations
                  <ChevronRight />
                </Button>
                <Button onClick={() => handleNavigation("/contact-us")}>
                  Contact Us
                  <ChevronRight />
                </Button>
              </>
            )}
            <Button
              className="gap-2"
              onClick={isLoggedIn ? signOut : () => handleNavigation("/login")}
            >
              {isLoggedIn ? "Log out" : "Log in"}
              <ChevronRight />
            </Button>
          </div>

          {/* Admin Links */}
          <div className="flex flex-col mb-10">
            {isAnyTypeOfAdmin && (
              <p className="mb-2 font-semibold text-lg text-(--iridiscent-blue)">
                Admin Shortcuts
              </p>
            )}
            {isAnyTypeOfAdmin && (
              <Button onClick={() => handleNavigation("/admin")}>
                Dashboard
                <ChevronRight />
              </Button>
            )}
            {(isTenantAdmin || isStorageManager) && (
              <Button onClick={() => handleNavigation("/admin/bookings")}>
                Bookings
                <ChevronRight />
              </Button>
            )}
            {(isTenantAdmin || isStorageManager) && (
              <Button onClick={() => handleNavigation("/admin/categories")}>
                Categories
                <ChevronRight />
              </Button>
            )}
            {(isTenantAdmin || isSuperAdmin) && (
              <Button onClick={() => handleNavigation("/admin/users")}>
                Users
                <ChevronRight />
              </Button>
            )}
            {isSuperAdmin && (
              <Button onClick={() => handleNavigation("/admin/logs")}>
                Logs
                <ChevronRight />
              </Button>
            )}
            {(isStorageManager || isTenantAdmin) && (
              <Button onClick={() => handleNavigation("/profile?tab=bookings")}>
                Organization Bookings
                <ChevronRight />
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
