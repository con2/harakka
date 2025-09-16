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
import UsersDetailsPage from "@/pages/AdminPanel/UsersDetailsPage";
import AdminItemsTable from "@/pages/AdminPanel/AdminItemsTable";
import BookingList from "@/pages/AdminPanel/BookingList";
import BookingDetailsPage from "@/pages/AdminPanel/BookingDetailsPage";
import TagList from "@/pages/AdminPanel/TagList";
import TagDetailsPage from "@/pages/AdminPanel/TagDetailsPage";
import Logs from "@/pages/AdminPanel/Logs";
import Organizations from "@/pages/AdminPanel/Organizations";
import OrganizationLocations from "@/pages/AdminPanel/OrganizationLocations";
import Categories from "@/pages/AdminPanel/Categories";

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
import AddItem from "@/pages/AdminPanel/AddItem";
import OrganizationPage from "@/pages/OrganizationPage";
import OrganizationsList from "../components/Organization/OrganizationsList";
import ItemDetailsPage from "@/pages/AdminPanel/ItemDetailsPage";
import AddCategory from "@/components/Admin/Categories/AddCategory";

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
              "tenant_admin",
              "super_admin",
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
            allowedRoles={["storage_manager", "tenant_admin", "super_admin"]}
          >
            <AdminPanel />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AdminDashboard /> },
          {
            path: "users",
            element: (
              <ProtectedRoute allowedRoles={["super_admin", "tenant_admin"]}>
                <UsersList />
              </ProtectedRoute>
            ),
          },
          {
            path: "users/:id",
            element: (
              <ProtectedRoute allowedRoles={["super_admin", "tenant_admin"]}>
                <UsersDetailsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "items",
            element: (
              <ProtectedRoute
                allowedRoles={["tenant_admin", "storage_manager"]}
              >
                <AdminItemsTable />
              </ProtectedRoute>
            ),
          },
          {
            path: "items/:id",
            element: (
              <ProtectedRoute
                allowedRoles={["storage_manager", "tenant_admin"]}
              >
                <ItemDetailsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "bookings",
            element: (
              <ProtectedRoute
                allowedRoles={["storage_manager", "tenant_admin"]}
              >
                <BookingList />
              </ProtectedRoute>
            ),
          },
          {
            path: "bookings/:id",
            element: (
              <ProtectedRoute
                allowedRoles={["storage_manager", "tenant_admin"]}
              >
                <BookingDetailsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "tags",
            element: (
              <ProtectedRoute
                allowedRoles={["tenant_admin", "storage_manager"]}
              >
                <TagList />
              </ProtectedRoute>
            ),
          },
          {
            path: "tags/:id",
            element: (
              <ProtectedRoute
                allowedRoles={["tenant_admin", "storage_manager"]}
              >
                <TagDetailsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "logs",
            element: (
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <Logs />
              </ProtectedRoute>
            ),
          },
          {
            path: "roles",
            element: (
              <ProtectedRoute allowedRoles={["super_admin", "tenant_admin"]}>
                <RoleManagement />
              </ProtectedRoute>
            ),
          },
          {
            path: "organizations",
            element: (
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <Organizations />
              </ProtectedRoute>
            ),
          },
          {
            path: "items/add",
            element: (
              <ProtectedRoute
                allowedRoles={["tenant_admin", "storage_manager"]}
              >
                <AddItem />
              </ProtectedRoute>
            ),
          },
          {
            path: "locations",
            element: (
              <ProtectedRoute
                allowedRoles={["tenant_admin", "storage_manager"]}
              >
                <OrganizationLocations />
              </ProtectedRoute>
            ),
          },
          {
            path: "categories",
            element: (
              <ProtectedRoute allowedRoles={["tenant_admin"]}>
                <Categories />
              </ProtectedRoute>
            ),
          },
          {
            path: "categories/:id",
            element: (
              <ProtectedRoute allowedRoles={["tenant_admin"]}>
                <AddCategory />
              </ProtectedRoute>
            ),
          },
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
        path: "/organizations",
        element: <OrganizationsList />,
      },
      {
        path: "/organization/:org_slug",
        element: <OrganizationPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" />,
      },
    ],
  },
]);
