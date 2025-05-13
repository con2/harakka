import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
import logo from "../assets/logoNav.png";
import smallLogo from "../assets/illusiaLogo.png";
import { LogInIcon, LogOutIcon, ShoppingCart, UserIcon } from "lucide-react";
import { selectCartItemsCount } from "../store/slices/cartSlice";
import { toast } from "sonner";
import { toastConfirm } from "./ui/toastConfirm";

export const Navigation = () => {
  const { signOut } = useAuth();
  const selectedUser = useAppSelector(selectSelectedUser);
  const cartItemsCount = useAppSelector(selectCartItemsCount);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = ["admin", "superVera"].includes(selectedUser?.role ?? "");
  const isLoggedIn = !!selectedUser;
  const isLandingPage = location.pathname === "/";
  const navClasses = isLandingPage
    ? "absolute top-0 left-0 w-full z-50 bg-black/40 text-white px-2 md:px-10 py-2 md:py-3"
    : "relative w-full z-50 bg-white text-primary shadow-sm px-2 md:px-10 py-2 md:py-3";

  const handleSignOut = () => {
    toastConfirm({
      title: "Confirm Logout",
      description: "Are you sure you want to log out? This will end your current session.",
      confirmText: "Log Out",
      cancelText: "Cancel",
      onConfirm: () => {
        signOut()
      },
      onCancel: () => {
        toast.success("Logout canceled.");
      },
    });
  };

return (
  <nav className={navClasses}>
    <div className="container mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link to="/">
          <img src={logo} alt="Logo" className="h-[60px] w-auto object-contain hidden md:flex" />
          <img src={smallLogo} alt="smallLogo" className="h-[40px] w-auto object-contain md:hidden" />
        </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem className="hidden md:flex">
                <NavigationMenuLink asChild>
                  <Link to="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Show My orders link only for logged in users */}
              {isLoggedIn && (
                <NavigationMenuItem className="hidden md:flex">
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
                      Admin
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              {/* Always show Storage */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/storage" className="flex items-center gap-1">
                    Storage
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* User GuideLines */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/howItWorks" className="flex items-center gap-1">
                    Guides
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Contact Form */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/contact-us" className="flex items-center gap-1">
                    Contact Us
                  </Link>
                </NavigationMenuLink>

              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

        </div>
        {/* Always show Cart */}
        <div className="flex items-center gap-4">
          <Link to="/cart" className="flex items-center gap-1 hover:text-secondary">
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
                size={"sm"}
                onClick={() => {navigate("/profile")}}
              >
                {/* Show name on desktop, icon on mobile */}
                <UserIcon className="inline sm:hidden h-5 w-5" />
                <span className="hidden sm:inline">{selectedUser.full_name}</span>
              </Button>
            <Button
              variant={"ghost"}
              size={"sm"}
              onClick={handleSignOut}
            >
              <LogOutIcon className="h-5 w-5" />
            </Button>
            </div>
          ) : (
            <Button variant={"ghost"} className="bg-white" asChild>
              <Link to="/login">
                Login <LogInIcon  className="ml-1 h-5 w-5"/>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
