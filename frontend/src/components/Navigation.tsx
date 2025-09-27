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
import { Menu, ShoppingCart, UserIcon } from "lucide-react";
import { Notifications } from "@/components/Notification";
import { selectCartItemsCount } from "../store/slices/cartSlice";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { UserMenu } from "./ui/UserMenu";
import LogoSmall from "@/assets/logo_small.svg?react";
import { Badge } from "./ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Sheet, SheetTrigger } from "./ui/sheet";
import MobileMenu from "./MobileMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { selectActiveOrganizationId } from "@/store/slices/rolesSlice";

export const Navigation = () => {
  // Auth State
  const { user, authLoading } = useAuth();
  const { hasAnyRole, hasRole } = useRoles();
  const { lang } = useLanguage();
  const activeOrg = useAppSelector(selectActiveOrganizationId);

  // Use auth context to determine login status
  const isLoggedIn = !!user;
  const isGlobalUser = hasRole("user", activeOrg!);

  // Screen Size State
  const { isMobile: defaultMobileSize, width } = useIsMobile();
  const isTablet = isGlobalUser ? width <= 1210 : width <= 1130;
  const isMobile = isGlobalUser ? defaultMobileSize : width <= 877;
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
    ? "absolute top-0 left-0 w-full z-50 text-primary px-2 md:px-10 py-2 md:py-3 bg-white flex lg:justify-around"
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
      <nav className="flex p-4 justify-between shadow-sm items-center z-50 bg-white">
        <div className="flex gap-4">
          <Button
            onClick={() => navigate("/")}
            aria-label={t.navigation.aria.labels.logo[lang]}
            data-cy="nav-home"
            className="w-fit px-0 self-center"
          >
            <LogoSmall aria-hidden className="!w-13 !h-[auto]" />
          </Button>
          <MobileNavigation />
        </div>

        <div className="flex gap-4 items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/cart")}
            className="relative text-(--midnight-black)  hover:text-(--midnight-black) hover:bg-(--subtle-grey) relative p-2 h-fit"
            data-cy="nav-cart"
          >
            <ShoppingCart className="!w-5 !h-[auto]" />
            {cartItemsCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-4 min-w-[1rem] px-1 text-[0.625rem] font-sans text-white leading-none !bg-(--emerald-green)">
                {cartItemsCount}
              </Badge>
            )}
          </Button>
          {isLoggedIn && <UserMenu />}
          {!authLoading && !isLoggedIn && (
            <>
              <LanguageSwitcher />
              <Button
                variant={"ghost"}
                className="hover:bg-(--subtle-grey) hover:text-(--midnight-black) text-(--midnight-black)"
                data-cy="nav-login-btn"
                asChild
              >
                <Link to="/login">
                  {t.login.login[lang]} <UserIcon className="ml-1 h-5 w-5" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    );

  if (isTablet)
    return (
      <nav className="flex p-4 justify-between shadow-sm items-center z-50 bg-white !font-main">
        <div className="flex gap-6">
          <Button
            onClick={() => navigate("/")}
            aria-label={t.navigation.aria.labels.logo[lang]}
            data-cy="nav-home"
            className="w-35 px-0 flex-1 gap-1 self-center transition-none"
          >
            <LogoSmall aria-hidden className="!h-[auto] flex-1" />
            <h1 className="text-[1.4rem] relative -top-[2px] flex-2">
              Harakka
            </h1>
          </Button>
          <MobileNavigation />

          {isAnyTypeOfAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1 text-(--midnight-black)  p-1"
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
            className="relative text-(--midnight-black)  hover:text-(--midnight-black) hover:bg-(--subtle-grey) relative p-2 h-fit"
            data-cy="nav-cart"
          >
            <ShoppingCart className="!w-5 !h-[auto]" />
            {cartItemsCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-4 min-w-[1rem] px-1 text-[0.625rem] font-sans text-white leading-none !bg-(--emerald-green)">
                {cartItemsCount}
              </Badge>
            )}
          </Button>
          {isLoggedIn && <UserMenu />}
          {!authLoading && !isLoggedIn && (
            <>
              <LanguageSwitcher />
              <Button
                variant={"ghost"}
                className="hover:bg-(--subtle-grey) hover:text-(--midnight-black) text-(--midnight-black)"
                data-cy="nav-login-btn"
                asChild
              >
                <Link to="/login">
                  {t.login.login[lang]} <UserIcon className="ml-1 h-5 w-5" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    );

  return (
    <nav className={navClasses}>
      {/* Left side: Logo + navigation links */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => navigate("/")}
          aria-label={t.navigation.aria.labels.logo[lang]}
          data-cy="nav-home"
          className="w-35 px-0 flex-1 gap-1"
        >
          <LogoSmall aria-hidden className="!h-[auto] flex-1" />
          <h1 className="text-[1.4rem] relative -top-[2px] flex-2">Harakka</h1>
        </Button>
        <NavigationMenu>
          <NavigationMenuList>
            {/* Show Admin Panel link only for admins in current context*/}
            {isAnyTypeOfAdmin && (
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/admin"
                    className="flex items-center gap-1 text-(--midnight-black) text-base p-1"
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
                  className="flex items-center gap-1 text-(--midnight-black) text-base "
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
                  className="flex items-center gap-1 text-(--midnight-black) text-base "
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
                    className="flex items-center gap-1 text-(--midnight-black) text-base"
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
                    className="flex items-center gap-1 text-(--midnight-black)"
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
          aria-label={t.navigation.aria.labels.cart[lang]?.replace(
            "{number}",
            cartItemsCount.toString(),
          )}
          variant="ghost"
          onClick={() => navigate("/cart")}
          className="flex items-center gap-1 text-(--midnight-black)  hover:text-(--midnight-black) hover:bg-(--subtle-grey) relative p-2"
          data-cy="nav-cart"
        >
          <ShoppingCart aria-hidden className="h-5 w-5" />
          {cartItemsCount > 0 && (
            <Badge
              aria-hidden
              className="absolute -right-1 -top-1 h-4 min-w-[1rem] px-1 text-[0.625rem] font-sans text-white leading-none !bg-(--emerald-green)"
            >
              {cartItemsCount}
            </Badge>
          )}
        </Button>
        {isLoggedIn && <Notifications userId={user.id} />}

        {!authLoading && !isLoggedIn && (
          <>
            <LanguageSwitcher />
            <Button
              variant={"ghost"}
              onClick={() => navigate("/login")}
              className="hover:bg-(--subtle-grey) hover:text-(--midnight-black) text-(--midnight-black)"
              data-cy="nav-login-btn"
              asChild
              aria-label={t.navigation.aria.labels.logIn[lang]}
            >
              {t.login.login[lang]}{" "}
              <UserIcon aria-hidden className="ml-1 h-5 w-5" />
            </Button>
          </>
        )}
        {isLoggedIn && <UserMenu />}
      </div>
    </nav>
  );
};

export default Navigation;
