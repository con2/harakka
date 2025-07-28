import { createBrowserRouter, Navigate } from "react-router-dom";

// Auth
import AuthCallback from "../components/Auth/AuthCallback";
import PasswordReset from "../components/Auth/PasswordReset";
import PasswordResetResult from "../components/Auth/PasswordResetResult";
import ProtectedRoute from "../components/Auth/ProtectedRoute";

// Admin
import AdminPanel from "../components/Admin/AdminPanel";
import AdminDashboard from "@/pages/AdminPanel/AdminDashboard";
import UsersList from "@/pages/AdminPanel/UsersList";
import AdminItemsTable from "@/pages/AdminPanel/AdminItemsTable";
import BookingList from "@/pages/AdminPanel/BookingList";
import TagList from "@/pages/AdminPanel/TagList";
import Logs from "@/pages/AdminPanel/Logs";
import Organizations from "@/pages/AdminPanel/Organizations";

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
import BookingConfirmation from "../components/BookingConfirmation";
import { UserGuide } from "../components/UserGuidelines";
import ContactForm from "../components/ContactForm";

// Layout
import App from "../App";
import LoginPage from "@/pages/LoginPage";
import { RoleManagement } from "@/components/Admin/Roles/RoleManagement";

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
          <ProtectedRoute
            allowedRoles={[
              "user",
              "storage_manager",
              "requester",
              "admin",
              "main_admin",
              "super_admin",
              "superVera",
            ]}
          >
            <MyProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin",
        element: (
          <ProtectedRoute
            allowedRoles={[
              "requester",
              "storage_manager",
              "admin",
              "main_admin",
              "super_admin",
              "superVera",
            ]}
          >
            <AdminPanel />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "users", element: <UsersList /> },
          { path: "items", element: <AdminItemsTable /> },
          { path: "bookings", element: <BookingList /> },
          { path: "tags", element: <TagList /> },
          { path: "logs", element: <Logs /> },
          { path: "roles", element: <RoleManagement /> },
          { path: "organizations", element: <Organizations /> },
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
        path: "/bookings/confirmation",
        element: <BookingConfirmation />,
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
