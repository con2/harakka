import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAppSelector } from "@/store/hooks";
import { selectSelectedUser } from "@/store/slices/usersSlice";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import logo from "../assets/logoNav.png";
import { LogInIcon, LogOutIcon, ShoppingCart } from "lucide-react";
import { selectCartItemsCount } from "../store/slices/cartSlice";
import {ThemeToggle} from "@/components/ThemeToggle"

export const Navigation = () => {
  const { signOut } = useAuth();
  const selectedUser = useAppSelector(selectSelectedUser);
  const cartItemsCount = useAppSelector(selectCartItemsCount);
  const location = useLocation();

  const isAdmin = ["admin", "superVera"].includes(selectedUser?.role ?? "");
  const isLoggedIn = !!selectedUser;
  const isLandingPage = location.pathname === "/";
  const navClasses = isLandingPage
    ? "absolute top-0 left-0 w-full z-50 bg-black/40 text-white transition-all duration-300"
    : "relative w-full z-50 bg-white text-primary shadow-sm transition-all duration-300";

return (
  <nav className={navClasses}>
    <div className="container mx-auto flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/">
          <img src={logo} alt="Logo" className="h-20" />
        </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Show My orders link only for logged in users */}
              {isLoggedIn && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/profile" className="flex items-center gap-1">
                      My Profile
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              {/* Show Admin Panel link only for admins/superVera */}
              {isAdmin && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/admin" className="flex items-center gap-1">
                      Admin Panel
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              {/* Always show Storage */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/storage" className="flex items-center gap-1">
                    Storage Items
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* User GuideLines */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/howItWorks" className="flex items-center gap-1">
                    User Guide
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

        </div>
        {/* Always show Cart */}
        <div className="flex items-center gap-4">
          <Link to="/cart" className="flex items-center gap-1">
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <span className="ml-1 rounded-full bg-secondary text-white px-2 py-1 text-xs">
                {cartItemsCount}
              </span>
            )}
          </Link>
          <ThemeToggle />

          {selectedUser ? (
            <Button className="bg-white text-secondary hover:text-secondary hover:bg-slate-50" onClick={signOut}>
              {selectedUser.full_name} <LogOutIcon className="ml-2" />
            </Button>
          ) : (
            <Button className="hover:text-secondary hover:bg-white" variant="ghost" asChild>
              <Link to="/login">
                Login <LogInIcon />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
