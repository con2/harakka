import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Auth/Login";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Navigation from "./components/Navigation";
import AdminPanel from "./components/Admin/AdminPanel";
import UsersList from "./components/Admin/UsersList";
import { Toaster } from "sonner";
import AdminDashboard from "./components/Admin/AdminDashboard";
import LandingPage from "./components/LandingPage";
import Unauthorized from "./components/Unauthorized";
import { UserProfileLoader } from "./context/UserProfileLoader";
import TeamList from "./components/Admin/TeamList";
import ItemsList from "./components/Items/ItemsList";
import ItemDetails from "./components/Items/ItemsDetails";
import UserPanel from "./components/Items/UserPanel";
import AdminItemsTable from "./components/Admin/AdminItemsTable";
import Cart from "./components/Cart";
import OrderConfirmation from "./components/OrderConfirmation";
import AuthCallback from "./components/Auth/AuthCallback";
import PasswordReset from "./components/Auth/PasswordReset";
import PasswordResetResult from "./components/Auth/PasswordResetResult";
import OrderList from "./components/Admin/OrderList";
import TagList from "./components/Admin/TagList";
import MyOrders from "./components/MyOrders";
import Footer from "./components/Footer";

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
                path="/orders"
                element={
                  <ProtectedRoute allowedRoles={["user", "admin", "superVera"]}>
                    <MyOrders />
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
              </Route>
              <Route path="/" element={<UserPanel />}>
                <Route path="/storage" element={<ItemsList />} />
                <Route path="/items/:id" element={<ItemDetails />} />
              </Route>
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
          <Toaster position="top-right" duration={1000} richColors />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
