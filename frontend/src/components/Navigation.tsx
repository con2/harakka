import { Link } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import {
  selectIsAdmin,
  selectIsSuperVera,
  selectSelectedUser,
} from "@/store/slices/usersSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import logo from "../assets/logoNav.png";
import { LogInIcon, LogOutIcon, ShoppingCart, UserIcon } from "lucide-react";
import { selectCartItemsCount } from "../store/slices/cartSlice";
import { toast } from "sonner";
import { toastConfirm } from "./ui/toastConfirm";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { t } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

export const Navigation = () => {
  const { signOut } = useAuth();
  const isAdmin = useAppSelector(selectIsAdmin);
  const isSuperVera = useAppSelector(selectIsSuperVera);
  const selectedUser = useAppSelector(selectSelectedUser);
  const cartItemsCount = useAppSelector(selectCartItemsCount);
  const location = useLocation();
  const navigate = useNavigate();

  const admin = isAdmin || isSuperVera;
  const isLoggedIn = !!selectedUser;
  const isLandingPage = location.pathname === "/";
  const navClasses = isLandingPage
    ? "absolute top-0 left-0 w-full z-50 bg-white/80 text-white px-2 md:px-10 py-2 md:py-3"
    : "relative w-full z-50 bg-white text-primary shadow-sm px-2 md:px-10 py-2 md:py-3";

  const handleSignOut = () => {
    toastConfirm({
      title: t.navigation.toast.title[lang],
      description: t.navigation.toast.description[lang],
      confirmText: t.navigation.toast.confirmText[lang],
      cancelText: t.navigation.toast.cancelText[lang],
      onConfirm: () => {
        signOut();
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
        <div className="flex items-center gap-1">
          <Link to="/">
            <img
              src={logo}
              alt="Logo"
              className="h-[60px] w-auto object-contain hidden md:flex"
            />
            {/* <img
              src={smallLogo}
              alt="smallLogo"
              className="h-[40px] w-auto object-contain md:hidden"
            /> */}
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              {/* <NavigationMenuItem className="hidden md:flex">
                <NavigationMenuLink asChild>
                  <Link to="/"> {t.navigation.home[lang]} </Link>
                </NavigationMenuLink>
              </NavigationMenuItem> */}

              {/* Show My orders link only for logged in users */}
              {isLoggedIn && (
                <NavigationMenuItem className="hidden md:flex">
                  <NavigationMenuLink asChild>
                    <Link
                      to="/profile"
                      className="flex items-center gap-1 text-secondary font-medium"
                    >
                      {t.navigation.myProfile[lang]}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              {/* Show Admin Panel link only for admins/superVera */}
              {admin && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/admin"
                      className="flex items-center gap-1 text-secondary font-medium"
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
                    className="flex items-center gap-1 text-secondary font-medium"
                  >
                    {t.navigation.storage[lang]}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* User GuideLines in Nav only for regular users */}
              {!admin && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/howItWorks"
                      className="flex items-center gap-1 text-secondary font-medium"
                    >
                      {t.navigation.guides[lang]}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              {/* Contact Form Only in Desktop view for non admins*/}
              {!admin && (
                <NavigationMenuItem className="hidden md:flex">
                  <NavigationMenuLink asChild>
                    <Link
                      to="/contact-us"
                      className="flex items-center gap-1 text-secondary font-medium"
                    >
                      {t.navigation.contactUs[lang]}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Always show Cart */}
        <div className="flex items-center gap-2">
          <div className="flex items-center md:mr-6">
            <LanguageSwitcher />
          </div>
          <Link
            to="/cart"
            className="flex items-center gap-1 text-secondary font-medium hover:text-secondary"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <span className="ml-1 rounded-full bg-secondary text-white px-2 py-1 text-xs">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {selectedUser ? (
            <div className="flex items-center">
              <Button
                variant={"ghost"}
                className="p-o m-0"
                size={"sm"}
                onClick={() => {
                  navigate("/profile");
                }}
              >
                {/* Show name on desktop, icon on mobile */}
                <UserIcon className="inline sm:hidden h-5 w-5" />
                <span className="hidden sm:inline">
                  {selectedUser.full_name}
                </span>
              </Button>
              <Button variant={"ghost"} size={"sm"} onClick={handleSignOut}>
                <LogOutIcon className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button variant={"ghost"} asChild>
              <Link to="/login">
                {t.login.login[lang]} <LogInIcon className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
