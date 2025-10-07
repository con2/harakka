# Client-Side Routing

This document explains the routing approach used in the Storage and Booking Application frontend.

## Table of Contents

- [Overview](#overview)
- [Route Structure](#route-structure)
- [Protected Routes](#protected-routes)
- [Route Components](#route-components)
- [Navigation](#navigation)
- [Route Parameters](#route-parameters)
- [Best Practices](#best-practices)

## Overview

The application uses [**React Router DOM**](https://reactrouter.com/home) for client-side routing to create a seamless single-page application experience. The routing system handles:

- Navigation between different views without full page reloads
- Access control via protected routes
- Nested layouts for different sections of the application
- Parameter-based dynamic routes

## Route Structure

The main route configuration is defined in [router.tsx](frontend/src/router/router.tsx) using the createBrowseRouter function provided by react-router-dom.

```tsx
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
    ],
  },
]);
```

Routes are defined as objects, with a **path** and **element** property.  
Each path can have children of it's own, which means they are nested within the parent path.

## Protected Routes

Access control is implemented through the `ProtectedRoute` component, which verifies user authentication and authorization before rendering the target component.

```tsx
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { authLoading } = useAuth();
  const selectedUser = useAppSelector(selectSelectedUser);
  const userLoading = useAppSelector(selectSelectedUserLoading);

  // Show loading state while authentication is in progress
  if (authLoading || userLoading || !selectedUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin w-6 h-6" />
      </div>
    );
  }

  // Redirect to unauthorized page if user doesn't have required role
  if (!selectedUser || !allowedRoles.includes(selectedUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

Usage:

```tsx
{
  path: "/admin",
  element: (
    <ProtectedRoute
      allowedRoles={[
        "storage_manager",
        "tenant_admin",
        "super_admin"
      ]}
    >
      <MyBookings />
    </ProtectedRoute>
  ),
},
```

## Route Components

When creating components for routes, follow these patterns:

### Page Components

Page components represent full pages in the application:

```tsx
const ItemsList = () => {
  // Component code
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>Available Storage Items</h1>
      {/* Page content */}
    </div>
  );
};

export default ItemsList;
```

### Layout Components

Layout components provide structure for nested routes using Outlet:

```tsx
import { Outlet } from "react-router-dom";

const UserPanel = () => {
  return (
    <div className="user-panel-layout">
      <aside className="sidebar">{/* Sidebar content */}</aside>
      <main className="content">
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>
  );
};

export default UserPanel;
```

## Navigation

### Link Component

For navigation within the app, use the `Link` component:

```tsx
import { Link } from "react-router-dom";

// In a component
<Link to="/storage" className="btn btn-primary">
  Browse Storage
</Link>;
```

### Programmatic Navigation

Use the `useNavigate` hook for programmatic navigation:

```tsx
import { useNavigate } from "react-router-dom";

const Component = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate after some action
    navigate("/dashboard");
  };

  // For navigation with state
  const viewDetails = (id) => {
    navigate(`/items/${id}`, { state: { prevPath: location.pathname } });
  };

  return <button onClick={handleClick}>Go to Dashboard</button>;
};
```

## Route Parameters

### Defining Parameter Routes

```tsx
{
  path: "users/:id",
  element: (
    <ProtectedRoute allowedRoles={["super_admin", "tenant_admin"]}>
      <UsersDetailsPage />
    </ProtectedRoute>
  ),
},
```

### Accessing Parameters

Use the `useParams` hook to access URL parameters:

```tsx
import { useParams } from "react-router-dom";

const ItemDetails = () => {
  const { id } = useParams();

  // Use the id parameter to fetch item details
  useEffect(() => {
    fetchItemDetails(id);
  }, [id]);

  return <div>{/* Item details */}</div>;
};
```

### Optional Parameters

For optional parameters, use a pattern like this:

```tsx
{
  path: "search/:category?/:keyword",
  element: (
      <SearchResults />
  ),
},
```

Then access them conditionally:

```tsx
const { category, keyword } = useParams();

useEffect(() => {
  if (category && keyword) {
    searchWithBoth(category, keyword);
  } else if (category) {
    searchByCategory(category);
  } else {
    searchAll();
  }
}, [category, keyword]);
```

## Best Practices

### 1. Keep Routes Organized

Group related routes together in the route configuration and use comments to separate different sections.

### 2. Use Lazy Loading

For large applications, implement code-splitting with lazy loading:

```tsx
import React, { Suspense, lazy } from "react";

const AdminDashboard = lazy(() => import("./components/Admin/AdminDashboard"));

// In your routes
{
  path: "/admin",
  element: (
    <Suspense fallback={<Spinner />}>
    <ProtectedRoute
      allowedRoles={["storage_manager", "tenant_admin", "super_admin"]}
    >
      <AdminPanel />
    </ProtectedRoute>
    </Suspense>
  ),
}
```

### 5. Location State

#### For return paths

When users navigate away from a list to a detail page, store the previous path to allow them to return easily:

```tsx
// When navigating to a detail page
navigate(`/items/${id}`, { state: { returnTo: location.pathname } });

// In the detail page
const location = useLocation();
const returnPath = location.state?.returnTo || "/storage";

// Back button
<Button onClick={() => navigate(returnPath)}>Back to List</Button>;
```

#### For other purposes

The type of the useLocation().state is `any`, meaning you could provide any type of data you want.
This can be useful for wanting to redirect with filters for example.

```tsx
navigate(`/admin/items`, { state: { statusFilter: "inactive" } });

// In admin/items component
const redirectState = useLocation()?.state;

const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
  redirectState?.statusFilter ?? "all",
); // Will set statusFilter to inactive, or "all" if no state was provided upon redirect
```

### 6. Route-Based Data Loading

Fetch necessary data when routes change:

```tsx
const ItemDetails = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchItemDetails(id));

    // Optional cleanup on route change
    return () => {
      dispatch(clearSelectedItem());
    };
  }, [id, dispatch]);

  // Component content
};
```

By following these patterns and best practices, you'll maintain a consistent, maintainable routing system throughout the application.
