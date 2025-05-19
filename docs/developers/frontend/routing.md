# Frontend Routing Guide

This document explains the routing approach used in the Storage and Booking Application frontend.

## Table of Contents

- [Overview](#overview)
- [Route Structure](#route-structure)
- [Protected Routes](#protected-routes)
- [Nested Routes and Layouts](#nested-routes-and-layouts)
- [Route Components](#route-components)
- [Navigation](#navigation)
- [Route Parameters](#route-parameters)
- [Best Practices](#best-practices)

## Overview

The application uses React Router DOM for client-side routing to create a seamless single-page application experience. The routing system handles:

- Navigation between different views without full page reloads
- Access control via protected routes
- Nested layouts for different sections of the application
- Parameter-based dynamic routes

## Route Structure

The main route configuration is defined in `App.tsx` using the declarative JSX approach provided by React Router:

```tsx
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

          {/* Admin routes */}
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

          {/* User panel routes */}
          <Route path="/" element={<UserPanel />}>
            <Route path="/storage" element={<ItemsList />} />
            <Route path="/items/:id" element={<ItemDetails />} />
          </Route>

          {/* Other routes */}
          <Route path="/howItWorks" element={<UserGuide />} />
          <Route path="/contact-us" element={<ContactForm />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders/confirmation" element={<OrderConfirmation />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route
            path="/password-reset-success"
            element={<PasswordResetResult />}
          />
        </Routes>
      </main>
      <Footer />
    </div>
  </AuthProvider>
</BrowserRouter>
```

## Protected Routes

Access control is implemented through the `ProtectedRoute` component, which verifies user authentication and authorization before rendering the target component:

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
<Route
  path="/profile"
  element={
    <ProtectedRoute allowedRoles={["user", "admin", "superVera"]}>
      <MyProfile />
    </ProtectedRoute>
  }
/>
```

## Nested Routes and Layouts

The application uses nested routes to create section-specific layouts:

### Admin Panel Layout

All admin-related pages share the `AdminPanel` layout component:

```tsx
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
  {/* Additional admin routes */}
</Route>
```

### User Panel Layout

Storage-related pages share the `UserPanel` layout component:

```tsx
<Route path="/" element={<UserPanel />}>
  <Route path="/storage" element={<ItemsList />} />
  <Route path="/items/:id" element={<ItemDetails />} />
</Route>
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
<Route path="/items/:id" element={<ItemDetails />} />
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
<Route path="/search/:category?/:keyword?" element={<SearchResults />} />
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
<Route
  path="/admin"
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <AdminDashboard />
    </Suspense>
  }
/>;
```

### 3. Maintain Route Constants

Create a separate file for route path constants:

```tsx
// routes.ts
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  ADMIN: {
    ROOT: "/admin",
    USERS: "/admin/users",
    ITEMS: "/admin/items",
    // other admin routes
  },
  ITEMS: {
    LIST: "/storage",
    DETAILS: (id: string) => `/items/${id}`,
  },
};
```

Then import in your components:

```tsx
import { ROUTES } from '@/routes';

// In a component
<Link to={ROUTES.ITEMS.LIST}>Browse Items</Link>

// For dynamic routes
<Link to={ROUTES.ITEMS.DETAILS(item.id)}>View Details</Link>
```

### 4. Handle 404 Pages

Always include a catch-all route for 404 errors:

```tsx
<Route path="*" element={<NotFound />} />
```

### 5. Location State for Return Paths

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
