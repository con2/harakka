import { Link } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { LogInIcon, Menu, ShoppingCart } from "lucide-react";
import { Notifications } from "@/components/Notification";
import { selectCartItemsCount } from "../store/slices/cartSlice";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { UserMenu } from "./ui/UserMenu";
import Logo from "@/assets/v4.5.svg?react";
import LogoSmall from "@/assets/logo_small.svg?react";
import { Badge } from "./ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Sheet, SheetTrigger } from "./ui/sheet";
import MobileMenu from "./MobileMenu";

export const Navigation = () => {
  // Auth State
  const { user, authLoading } = useAuth();
  const { hasAnyRole } = useRoles();
  const { lang } = useLanguage();

  // Use auth context to determine login status
  const isLoggedIn = !!user;

  // Screen Size State
  const { isMobile, isTablet } = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    ? "absolute top-0 left-0 w-full z-50 px-2 md:px-10 py-2 md:py-3 bg-white flex lg:justify-around"
    : "relative w-full z-50 text-primary shadow-sm px-2 md:px-10 py-2 md:py-3 bg-white lg:justify-around flex justify-between";

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const MobileNavigation = () => (
    <Sheet
      open={mobileMenuOpen}
      onOpenChange={setMobileMenuOpen}
      aria-describedby="Navigate"
    >
      <SheetTrigger className="hover:bg-(--subtle-grey) p-2 h-fit rounded-sm self-center">
        <Menu />
        {mobileMenuOpen && <MobileMenu closeMenu={closeMobileMenu} />}
      </SheetTrigger>
    </Sheet>
  );

  if (isMobile)
    return (
      <nav className="flex p-4 justify-between shadow-sm items-center z-50">
        <div className="flex gap-4">
          <Link to="/" data-cy="nav-home">
            <LogoSmall className="w-10" />
          </Link>
          <MobileNavigation />
        </div>

        <div className="flex gap-4 items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/cart")}
            className="relative text-(--midnight-black) font-medium hover:text-(--midnight-black) hover:bg-(--subtle-grey) relative p-2 h-fit"
            data-cy="nav-cart"
          >
            <ShoppingCart className="!w-5 !h-[auto]" />
            {cartItemsCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-4 min-w-[1rem] px-1 text-[0.625rem] font-sans text-white leading-none !bg-(--emerald-green)">
                {cartItemsCount}
              </Badge>
            )}
          </Button>
          <UserMenu />
        </div>
      </nav>
    );

  if (isTablet)
    return (
      <nav className="flex p-4 justify-between shadow-sm items-center z-50">
        <div className="flex gap-6">
          <Link to="/" data-cy="nav-home">
            <Logo className="w-35" />
          </Link>
          <MobileNavigation />

          {isAnyTypeOfAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1 text-(--midnight-black) font-medium p-1"
              data-cy="nav-admin"
            >
              {t.navigation.admin[lang]}
            </Link>
          )}
        </div>

        <div className="flex gap-4 items-center">
          {isLoggedIn && <Notifications userId={user.id} />}
          <Button
            variant="ghost"
            onClick={() => navigate("/cart")}
            className="relative text-(--midnight-black) font-medium hover:text-(--midnight-black) hover:bg-(--subtle-grey) relative p-2 h-fit"
            data-cy="nav-cart"
          >
            <ShoppingCart className="!w-5 !h-[auto]" />
            {cartItemsCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-4 min-w-[1rem] px-1 text-[0.625rem] font-sans text-white leading-none !bg-(--emerald-green)">
                {cartItemsCount}
              </Badge>
            )}
          </Button>
          <UserMenu />
        </div>
      </nav>
    );

  return (
    <nav className={navClasses}>
      {/* Left side: Logo + navigation links */}
      <div className="flex items-center gap-3">
        <Link to="/" data-cy="nav-home">
          <Logo className="h-[60px] w-auto object-contain hidden md:flex filter min-w-30" />
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
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
                    to="/how-it-works"
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
        {isLoggedIn && <Notifications userId={user.id} />}

        {!authLoading && (
          <>
            {!isLoggedIn && (
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
        {isLoggedIn && <UserMenu />}
      </div>
    </nav>
  );
};

export default Navigation;
