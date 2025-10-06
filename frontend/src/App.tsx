import Navigation from "./components/Navigation";
import { Toaster } from "sonner";
import { UserProfileLoader } from "./context/UserProfileLoader";
import Footer from "./components/Footer";
import { Outlet, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { ReactNode, useEffect } from "react";

type App = {
  children?: ReactNode;
};

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App({ children }: App) {
  return (
    <AuthProvider>
      {/* Added TooltipProvider to App so we only have one provider for tooltips */}
      <TooltipProvider
        delayDuration={200}
        skipDelayDuration={200}
        disableHoverableContent
      >
        <div className="min-h-screen flex flex-col text-primary">
          <UserProfileLoader />
          {/* ScrollToTop ensures the page scrolls to the top on route change */}
          <ScrollToTop />
          <Navigation />
          <main className="flex-1">
            {children}
            <Outlet />
          </main>
          <Footer />
          <Toaster
            position="top-right"
            duration={3000}
            richColors
            offset={{ top: 100 }}
            mobileOffset={{ top: 100 }}
            closeButton
            toastOptions={{
              classNames: {
                closeButton: "toast-close",
                toast: "custom-toast",
              },
            }}
          />
        </div>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
