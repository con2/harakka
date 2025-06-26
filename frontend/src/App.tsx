import Navigation from "./components/Navigation";
import { Toaster } from "sonner";
import { UserProfileLoader } from "./context/UserProfileLoader";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
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
          toastOptions={{
            classNames: {
              toast: "custom-toast",
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}

export default App;