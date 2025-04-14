import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppSelector } from '@/store/hooks';
import { selectSelectedUser } from '@/store/slices/usersSlice';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import logo from '../assets/logo.png';
import { ShoppingCart } from 'lucide-react';
import { selectCartItemsCount } from '../store/slices/cartSlice';

export const Navigation = () => {
  const { signOut } = useAuth();
  const selectedUser = useAppSelector(selectSelectedUser);
  const cartItemsCount = useAppSelector(selectCartItemsCount);

  const isAdmin = ['admin', 'superVera'].includes(selectedUser?.role ?? '');

  return (
    <nav className="shadow-sm">
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

          {selectedUser ? (
            <Button variant="ghost" onClick={signOut}>
              Logout ({selectedUser.email})
            </Button>
          ) : (
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
