import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import logo from "../assets/logo.png"

export const Navigation = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="mb-3 shadow-sm">
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
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/protected" className="flex items-center gap-1">
                      Protected Data
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/admin" className="flex items-center gap-1">
                      Admin Panel
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        {user ? (
          <Button variant="ghost" onClick={signOut}>
            Logout ({user.email})
          </Button>
        ) : (
          <Button variant="ghost" asChild>
            <Link to="/login">Login</Link>
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;