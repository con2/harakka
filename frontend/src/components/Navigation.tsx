import { Link } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { selectSelectedUser } from "@/store/slices/usersSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { LogInIcon, LogOutIcon, ShoppingCart, UserIcon } from "lucide-react";
import { Notifications } from "@/components/Notification";
import { selectCartItemsCount } from "../store/slices/cartSlice";
import { toast } from "sonner";
import { toastConfirm } from "./ui/toastConfirm";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { RoleContextSwitcher } from "./ui/RoleContextSwitcher";
import Logo from "@/assets/v4.svg?react";
import { Badge } from "./ui/badge";

export const Navigation = () => {
  // Get auth state directly from Auth context
  const { signOut, user, authLoading } = useAuth();
  // Get user profile data from Redux
  const selectedUser = useAppSelector(selectSelectedUser);
  // Get user role information from the hook
  const { hasAnyRole } = useRoles();

  // Use auth context to determine login status
  const isLoggedIn = !!user;

  // Check if user has any admin role using hasAnyRole for efficiency
  const isAnyTypeOfAdmin = hasAnyRole([
    "tenant_admin",
    "super_admin",
    "storage_manager",
  ]);

  const cartItemsCount = useAppSelector(selectCartItemsCount);
  const location = useLocation();
  const navigate = useNavigate();

  const isLandingPage = location.pathname === "/";
  const navClasses = isLandingPage
    ? "absolute top-0 left-0 w-full z-50 text-white px-2 md:px-10 py-2 md:py-3 bg-white"
    : "relative w-full z-50 text-primary shadow-sm px-2 md:px-10 py-2 md:py-3 bg-white";

  const handleSignOut = () => {
    toastConfirm({
      title: t.navigation.toast.title[lang],
      description: t.navigation.toast.description[lang],
      confirmText: t.navigation.toast.confirmText[lang],
      cancelText: t.navigation.toast.cancelText[lang],
      onConfirm: () => {
        void signOut();
      },
      onCancel: () => {
        toast.success(t.navigation.toast.success[lang]);
      },
    });
  };

  // Translation hook
  const { lang } = useLanguage();

  return (
    <nav className={navClasses}>
      <div className="container md:mx-auto mx-0 flex items-center justify-between">
        {/* Left side: Logo + navigation links */}
        <div className="flex items-center gap-3">
          <Link to="/" data-cy="nav-home">
            <Logo className="h-[60px] w-auto object-contain hidden md:flex filter min-w-30" />

            {/* <img
              src={smallLogo}
              alt="smallLogo"
              className="h-[40px] w-auto object-contain md:hidden"
            /> */}
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              {/* Show My orders link only for logged in users */}
              {isLoggedIn && (
                <NavigationMenuItem className="hidden md:flex">
                  <NavigationMenuLink asChild>
                    <Link
                      to="/profile"
                      className="flex items-center gap-1 text-(--midnight-black) font-medium"
                      data-cy="nav-profile"
                    >
                      {t.navigation.myProfile[lang]}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              {/* Show Admin Panel link only for admins in current context*/}
              {isAnyTypeOfAdmin && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/admin"
                      className="flex items-center gap-1 text-(--midnight-black) font-medium p-1"
                      data-cy="nav-admin"
                    >
                      {t.navigation.admin[lang]}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              {/* Always show Storage */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/storage"
                    className="flex items-center gap-1 text-(--midnight-black) font-medium"
                    data-cy="nav-storage"
                  >
                    {t.navigation.storage[lang]}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Organizations Link */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to={"/organizations"}
                    className="flex items-center gap-1 text-(--midnight-black) font-medium"
                    data-cy="nav-organizations"
                  >
                    {t.navigation.organizations[lang]}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* User GuideLines in Nav only for regular users */}
              {!isAnyTypeOfAdmin && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/howItWorks"
                      className="flex items-center gap-1 text-(--midnight-black) font-medium"
                      data-cy="nav-guide"
                    >
                      {t.navigation.guides[lang]}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              {/* Contact Form Only in Desktop view for non admins*/}
              {!isAnyTypeOfAdmin && (
                <NavigationMenuItem className="hidden md:flex">
                  <NavigationMenuLink asChild>
                    <Link
                      to="/contact-us"
                      className="flex items-center gap-1 text-(--midnight-black) font-medium"
                      data-cy="nav-contact"
                    >
                      {t.navigation.contactUs[lang]}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side: Cart, notifications, language, auth */}
        <div className="flex items-center gap-3">
          {/* Active role context switcher if user is logged in and has roles */}
          {isLoggedIn && <RoleContextSwitcher />}

          <LanguageSwitcher />
          <Button
            variant="ghost"
            onClick={() => navigate("/cart")}
            className="flex items-center gap-1 text-(--midnight-black) font-medium hover:text-(--midnight-black) hover:bg-(--subtle-grey) relative p-2"
            data-cy="nav-cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-4 min-w-[1rem] px-1 text-[0.625rem] font-sans text-white leading-none !bg-(--emerald-green)">
                {cartItemsCount}
              </Badge>
            )}
          </Button>
          {selectedUser && <Notifications userId={selectedUser.id} />}

          {!authLoading && (
            <>
              {isLoggedIn ? (
                <>
                  <Button
                    variant={"ghost"}
                    className="p-o m-0 hover:bg-(--subtle-grey) hover:text-(--midnight-black) text-(--midnight-black)"
                    size={"sm"}
                    onClick={() => void navigate("/profile")}
                    data-cy="nav-profile-btn"
                  >
                    {/* Show name on desktop, icon on mobile */}
                    <UserIcon className="inline sm:hidden h-5 w-5" />
                    <span className="hidden sm:inline">
                      {/* Display full_name if available, fall back to email */}
                      {selectedUser?.full_name
                        ? selectedUser?.full_name
                        : user?.email}
                    </span>
                  </Button>
                  <Button
                    variant={"ghost"}
                    size={"sm"}
                    onClick={handleSignOut}
                    data-cy="nav-signout-btn"
                    className="hover:bg-(--subtle-grey) hover:text-(--midnight-black) text-(--midnight-black)"
                  >
                    <LogOutIcon className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <Button
                  variant={"ghost"}
                  className="hover:bg-(--subtle-grey) hover:text-(--midnight-black) text-(--midnight-black)"
                  data-cy="nav-login-btn"
                  asChild
                >
                  <Link to="/login">
                    {t.login.login[lang]} <LogInIcon className="ml-1 h-5 w-5" />
                  </Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
