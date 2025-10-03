import { createBrowserRouter } from "react-router-dom";

// Auth
import AuthCallback from "../components/Auth/AuthCallback";
import PasswordReset from "../components/Auth/PasswordReset";
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
import AddTag from "@/pages/AdminPanel/AddTag";
import Logs from "@/pages/AdminPanel/Logs";
import Organizations from "@/pages/AdminPanel/Organizations";
import OrganizationDetailsPage from "@/pages/AdminPanel/OrganizationDetailsPage";
import CreateOrganizationPage from "@/pages/AdminPanel/CreateOrganizationPage";
import OrganizationLocations from "@/pages/AdminPanel/OrganizationLocations";
import AddLocationPage from "@/components/Admin/OrgManagement/AddLocationPage";
import EditLocationPage from "@/components/Admin/OrgManagement/EditLocationPage";
import Categories from "@/pages/AdminPanel/Categories";
import Requests from "@/pages/AdminPanel/Requests/Requests";
import RequestDetailsPage from "@/pages/AdminPanel/Requests/RequestDetailsPage";

// General
import LandingPage from "@/pages/LandingPage";
import Cart from "@/pages/Cart";
import MyProfile from "@/pages/MyProfile";
import MyBookingsPage from "@/pages/MyBookingsPage";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfUse from "../pages/TermsOfUse";
import Unauthorized from "../components/Unauthorized";
import ItemsList from "../components/Items/ItemsList";
import ItemDetails from "../components/Items/ItemsDetails";
import UserPanel from "../components/Items/UserPanel";
import BookingConfirmation from "../components/BookingConfirmation";
import { UserGuide } from "../components/UserGuidelines";
import ContactForm from "../components/ContactForm";
import Error from "@/pages/Error";

// Layout
import App from "../App";
import LoginPage from "@/pages/LoginPage";
import AddItem from "@/pages/AdminPanel/AddItem";
import OrganizationPage from "@/pages/OrganizationPage";
import OrganizationsList from "../components/Organization/OrganizationsList";
import ItemDetailsPage from "@/pages/AdminPanel/ItemDetailsPage";
import AddCategory from "@/components/Admin/Categories/AddCategory";
import MyBookings from "@/pages/MyBookings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: (
      <App>
        <Error />
      </App>
    ),
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
        path: "/my-bookings",
        element: (
          <ProtectedRoute
            allowedRoles={[
              "user",
              "requester",
              "storage_manager",
              "tenant_admin",
            ]}
          >
            <MyBookings />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-bookings/:id",
        element: (
          <ProtectedRoute
            allowedRoles={[
              "user",
              "requester",
              "storage_manager",
              "tenant_admin",
            ]}
          >
            <MyBookingsPage />
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
              "tenant_admin",
              "super_admin",
            ]}
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
            path: "requests",
            element: (
              <ProtectedRoute
                allowedRoles={["requester", "storage_manager", "tenant_admin"]}
              >
                <Requests />
              </ProtectedRoute>
            ),
          },
          {
            path: "requests/:id",
            element: (
              <ProtectedRoute
                allowedRoles={["requester", "storage_manager", "tenant_admin"]}
              >
                <RequestDetailsPage />
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
            path: "tags/new",
            element: (
              <ProtectedRoute
                allowedRoles={["tenant_admin", "storage_manager"]}
              >
                <AddTag />
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
            path: "organizations",
            element: (
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <Organizations />
              </ProtectedRoute>
            ),
          },
          {
            path: "organizations/create",
            element: (
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <CreateOrganizationPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "organizations/:id",
            element: (
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <OrganizationDetailsPage />
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
            path: "locations/add",
            element: (
              <ProtectedRoute
                allowedRoles={["tenant_admin", "storage_manager"]}
              >
                <AddLocationPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "locations/:id",
            element: (
              <ProtectedRoute
                allowedRoles={["tenant_admin", "storage_manager"]}
              >
                <EditLocationPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "categories",
            element: (
              <ProtectedRoute
                allowedRoles={["tenant_admin", "storage_manager"]}
              >
                <Categories />
              </ProtectedRoute>
            ),
          },
          {
            path: "categories/:id",
            element: (
              <ProtectedRoute
                allowedRoles={["tenant_admin", "storage_manager"]}
              >
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
        path: "/how-it-works",
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
        path: "/organizations",
        element: <OrganizationsList />,
      },
      {
        path: "/organization/:org_slug",
        element: <OrganizationPage />,
      },
      {
        path: "*",
        element: <Error type="not-found" />,
      },
    ],
  },
]);
