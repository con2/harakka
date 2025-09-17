import Navigation from "./components/Navigation";
import { Toaster } from "sonner";
import { UserProfileLoader } from "./context/UserProfileLoader";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { TooltipProvider } from "@radix-ui/react-tooltip";

function App() {
  return (
    <AuthProvider>
      <TooltipProvider
        delayDuration={200}
        skipDelayDuration={200}
        disableHoverableContent
      >
        <div className="min-h-screen flex flex-col text-primary">
          <UserProfileLoader />
          <Navigation />
          <main className="flex-1">
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
