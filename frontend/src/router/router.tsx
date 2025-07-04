import { createBrowserRouter, Navigate } from "react-router-dom";

// Auth
import Login from "../components/Auth/Login";
import AuthCallback from "../components/Auth/AuthCallback";
import PasswordReset from "../components/Auth/PasswordReset";
import PasswordResetResult from "../components/Auth/PasswordResetResult";
import ProtectedRoute from "../components/Auth/ProtectedRoute";

// Admin
import AdminDashboard from "@/pages/AdminDashboard";
import AdminPanel from "../components/Admin/AdminPanel";
import UsersList from "@/components/Admin/UserManagement/UsersList";
import TeamList from "@/components/Admin/UserManagement/TeamList";
import AdminItemsTable from "../components/Admin/AdminItemsTable";
import OrderList from "@/components/Admin/Orders/OrderList";
import TagList from "@/components/Admin/Items/TagList";
import Logs from "../components/Admin/Logs";

// General
import LandingPage from "@/pages/LandingPage";
import Cart from "@/pages/Cart";
import MyProfile from "@/pages/MyProfile";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfUse from "../pages/TermsOfUse";
import Unauthorized from "../components/Unauthorized";
import ItemsList from "../components/Items/ItemsList";
import ItemDetails from "../components/Items/ItemsDetails";
import UserPanel from "../components/Items/UserPanel";
import OrderConfirmation from "../components/OrderConfirmation";
import { UserGuide } from "../components/UserGuidelines";
import ContactForm from "../components/ContactForm";

// Layout
import App from "../App";
import LoginPage from "@/pages/LoginPage";

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
        element: <LoginPage />,
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
        // all other routes lead to landing page
        path: "*",
        element: <Navigate to="/" />,
      },
    ],
  },
]);
