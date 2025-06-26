import { createBrowserRouter, Navigate } from "react-router-dom";

// Auth
import Login from "../components/Auth/Login";
import AuthCallback from "../components/Auth/AuthCallback";
import PasswordReset from "../components/Auth/PasswordReset";
import PasswordResetResult from "../components/Auth/PasswordResetResult";
import ProtectedRoute from "../components/Auth/ProtectedRoute";

// Admin
import AdminPanel from "../components/Admin/AdminPanel";
import AdminDashboard from "../components/Admin/AdminDashboard";
import UsersList from "../components/Admin/UsersList";
import TeamList from "../components/Admin/TeamList";
import AdminItemsTable from "../components/Admin/AdminItemsTable";
import OrderList from "../components/Admin/OrderList";
import TagList from "../components/Admin/TagList";
import Logs from "../components/Admin/Logs";

// General
import LandingPage from "../components/LandingPage";
import Unauthorized from "../components/Unauthorized";
import ItemsList from "../components/Items/ItemsList";
import ItemDetails from "../components/Items/ItemsDetails";
import UserPanel from "../components/Items/UserPanel";
import Cart from "../components/Cart";
import OrderConfirmation from "../components/OrderConfirmation";
import { UserGuide } from "../components/UserGuidelines";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfUse from "../pages/TermsOfUse";
import MyProfile from "../components/MyProfile";
import ContactForm from "../components/ContactForm";

// Layout
import App from "../App";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute allowedRoles={["user", "admin", "superVera"]}>
            <MyProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin",
        element: (
          <ProtectedRoute allowedRoles={["admin", "superVera"]}>
            <AdminPanel />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "users", element: <UsersList /> },
          { path: "team", element: <TeamList /> },
          { path: "items", element: <AdminItemsTable /> },
          { path: "orders", element: <OrderList /> },
          { path: "tags", element: <TagList /> },
          { path: "logs", element: <Logs /> },
        ],
      },
      {
        path: "/storage",
        element: <UserPanel />,
        children: [
          {
            index: true,
            element: <ItemsList />,
          },
          {
            path: "items/:id",
            element: <ItemDetails />,
          },
        ],
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/orders/confirmation",
        element: <OrderConfirmation />,
      },
      {
        path: "/howItWorks",
        element: <UserGuide />,
      },
      {
        path: "/contact-us",
        element: <ContactForm />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/terms-of-use",
        element: <TermsOfUse />,
      },
      {
        path: "/unauthorized",
        element: <Unauthorized />,
      },
      {
        path: "/auth/callback",
        element: <AuthCallback />,
      },
      {
        path: "/password-reset",
        element: <PasswordReset />,
      },
      {
        path: "/password-reset-success",
        element: <PasswordResetResult />,
      },
      {
        path: "*",
        element: <Navigate to="/" />,
      },
    ],
  },
]);
