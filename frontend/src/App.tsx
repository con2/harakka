import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Auth/Login";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Navigation from "./components/Navigation";
import AdminPanel from "./components/Admin/AdminPanel";
import { Toaster } from "sonner";
import Unauthorized from "./components/Unauthorized";
import { UserProfileLoader } from "./context/UserProfileLoader";
import ItemsList from "./components/Items/ItemsList";
import ItemDetails from "./components/Items/ItemsDetails";
import UserPanel from "./components/Items/UserPanel";
import AdminItemsTable from "./components/Admin/AdminItemsTable";
import OrderConfirmation from "./components/OrderConfirmation";
import AuthCallback from "./components/Auth/AuthCallback";
import PasswordReset from "./components/Auth/PasswordReset";
import PasswordResetResult from "./components/Auth/PasswordResetResult";
import Footer from "./components/Footer";
import { UserGuide } from "./components/UserGuidelines";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import ContactForm from "./components/ContactForm";
import Logs from "./components/Admin/Logs";
import UsersList from "./components/Admin/UserManagement/UsersList";
import TeamList from "./components/Admin/UserManagement/TeamList";
import Cart from "./pages/Cart";
import OrderList from "./components/Admin/Orders/OrderList";
import TagList from "./components/Admin/Items/TagList";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import MyProfile from "./pages/MyProfile";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProfileLoader />
        <div className="min-h-screen flex flex-col text-primary">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={["user", "admin", "superVera"]}>
                    <MyProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin", "superVera"]}>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UsersList />} />
                <Route path="team" element={<TeamList />} />
                <Route path="items" element={<AdminItemsTable />} />
                <Route path="orders" element={<OrderList />} />
                <Route path="tags" element={<TagList />} />
                <Route path="logs" element={<Logs />} />
              </Route>
              <Route path="/" element={<UserPanel />}>
                <Route path="/storage" element={<ItemsList />} />
                <Route path="/items/:id" element={<ItemDetails />} />
              </Route>
              <Route path="/howItWorks" element={<UserGuide />} />
              <Route path="/contact-us" element={<ContactForm />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-use" element={<TermsOfUse />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/cart" element={<Cart />} />
              <Route
                path="/orders/confirmation"
                element={<OrderConfirmation />}
              />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/password-reset" element={<PasswordReset />} />
              <Route
                path="/password-reset-success"
                element={<PasswordResetResult />}
              />
            </Routes>
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
    </BrowserRouter>
  );
}

export default App;
