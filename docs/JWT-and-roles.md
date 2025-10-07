# JWT and Roles in Harakka App

This document describes the JWT (JSON Web Token) authentication flow and role-based authorization system used in the Harakka Application.

## Overview

The application uses Supabase Auth for authentication, with a custom JWT enhancement system that embeds user roles directly in the token payload. This approach optimizes performance by reducing database queries while maintaining security and flexibility.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│  Supabase   │     │   Backend   │     │    Frontend     │
│    Auth     │◄───►│   Service   │◄───►│  Application    │
└─────────────┘     └─────────────┘     └─────────────────┘
       ▲                   ▲                   ▲
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                  JWT with embedded roles                │
└─────────────────────────────────────────────────────────┘
```

### Flows explanation:

**Supabase ↔️ Backend**

- Backend updates JWT metadata in Supabase via `JwtService`.
- Backend retrieves and validates tokens issued by Supabase

**Backend ↔️ Frontend**

- Frontend sends JWT in requests via api interceptors
- Backend validates tokens and sends role version headers back
- Frontend detects role changes through `x-role-version` header

**Frontend ↔️ Supabase**

- Frontend authenticates and refreshes tokens directly with Supabase
- Frontend reads embedded roles from JWT payload

## JWT Structure

The JWT payload is extended with custom claims in the app_metadata section:

```json
{
  "sub": "user-uuid",
  "exp": 1716732942,
  "aud": "authenticated",
  "app_metadata": {
    "roles": [
      {
        "id": "role-uuid",
        "user_id": "user-uuid",
        "role_id": "role-type-id",
        "organization_id": "org-uuid",
        "role_name": "tenant_admin",
        "organization_name": "Organization Name",
        "is_active": true
      }
    ],
    "role_count": 1,
    "last_role_sync": "2023-05-26T14:32:21.123Z"
  }
}
```

## Role Types

| Role Name       | Description                                    |
| --------------- | ---------------------------------------------- |
| user            | Basic authenticated user, can book items       |
| requester       | Can book items on behalf of organization       |
| storage_manager | Manages inventory and bookings of organization |
| tenant_admin    | Full access to organization data               |
| super_admin     | Can handle roles of any user in the app        |

### Role Hierarchy

Roles are hierarchical: tenant_admin > storage_manager > requester > user

Higher roles inherit the permissions of lower roles within their organization’s context.

super_admin has global access across all organizations but does not inherit from other roles.
super_admin manages all user roles — one role to rule them all.

## Authentication Flow

1. User authenticates via Supabase Auth
2. AuthMiddleware extracts and verifies the JWT
3. User roles are extracted from JWT or fetched from database if missing
4. User and roles are attached to the request object for downstream use
5. RolesGuard checks if user has required roles for endpoints

## Role-Based Access Control

### Backend Role Protection

Controllers and routes use the @Roles decorator to specify required roles:

```typescript
@Get("list")
@Roles(["tenant_admin", "super_admin"], {
  match: "any",
  sameOrg: true,
})
async getAllRoles(@Req() req: AuthRequest) {
  // Implementation
}
```

The decorator supports:

- Multiple roles
- Match strategy: "any" (default) or "all"
- Organization context awareness

### Frontend Role Protection

React components use the useRoles hook and ProtectedRoute component:

```typescript
<Route
  path="/admin"
  element={
    <ProtectedRoute
      allowedRoles={["storage_manager", "tenant_admin", "super_admin"]}
    >
      <AdminPanel />
    </ProtectedRoute>
  }
/>
```

## JWT Performance Optimization

1. Embedded Roles: User roles are stored directly in the JWT to avoid database lookups
2. Self-Healing: Detects and corrects role drift between JWT and database
3. Caching: Reduces frequent JWT updates with a time-based cache
4. Strategic Refresh: JWT is updated only when roles change or on timed intervals
5. Token Caching: Frontend maintains a cached token to minimize authentication overhead

## Token Refresh Mechanism

The application implements a sophisticated token refresh strategy:

```
┌───────────────┐     ┌────────────────┐     ┌──────────────────┐
│ Token Expiry  │────►│ Auto-Refresh   │────►│ API Interceptors │
│ Detection     │     │ via Supabase   │     │ Update Headers   │
└───────────────┘     └────────────────┘     └──────────────────┘
```

1. Token expiration is detected before API calls
2. Near-expiry tokens (within 60 seconds) trigger proactive refresh
3. Expired tokens automatically refresh via interceptors with retry logic
4. Cached tokens are cleared when sessions change

## JWT Expiration and Renewal

Supabase access tokens have a configured expiration time of **3600 seconds (1 hour)**. This setting determines how long a JWT remains valid before requiring renewal:

![JWT expiration settings in Supabase UI](image.png)

```
┌─────────────────┐     ┌───────────────────────────┐
│ Token Issued    │────►│ Valid for 3600s (1 hour)  │
└─────────────────┘     └───────────────────────────┘
        │                            │
        │                            ▼
┌─────────────────┐     ┌───────────────────────────┐
│ App Monitors    │◄────│ Approaching Expiration    │
│ Expiration      │     │ (60s before expiry)       |
└─────────────────┘     └───────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│ Automatic Token Refresh via Supabase    │
└─────────────────────────────────────────┘
```

The application handles token expiration through:

1. **Proactive Renewal**: When a token is within 60 seconds of expiring, the system preemptively refreshes it
2. **Cached Token Management**: The app maintains a cached token to minimize authentication overhead
3. **Automatic Refresh on 401**: API calls that fail with 401 Unauthorized errors trigger automatic token refresh

Token expiration helps maintain security while the automatic renewal ensures uninterrupted user experience.

## Role Management

### Backend Services:

- RoleService: Core service for role operations
- JwtService: Manages JWT tokens and role embedding

### Frontend Services:

- roleApi: API client for role operations
- useRoles: React hook for role-based UI decisions

### Organization Context

Roles are organization-specific, allowing a user to have different roles in different organizations:

- Headers x-org-id and x-role-name convey the active organization context
- Role checks can be organization-aware (sameOrg: true)
- The frontend maintains an active organization context for the current session

## Session Management

When roles change:

1. The backend updates the user's JWT metadata
2. A `x-role-version` header is sent with responses
3. The frontend detects version changes and refreshes the session
4. Updated roles are immediately reflected in the UI
5. User receives a toast notification when permissions change

The role version tracking system:

- Uses user-specific storage keys to avoid cross-user contamination
- Implements de-duplication for concurrent role refreshes
- Automatically retries failed requests with fresh permissions

## Edge Cases

**New Users**: Initially have no roles in JWT, triggering DB fallback which assigns them to "user" role in "Global" org.
**Role Changes**: if user's role was changed by admins user will get toast notification about it
**Session Expiry**: Handled by automatic token refresh in API interceptors
**403 Errors**: Permission issues trigger automatic role refresh before retrying the request
**401 Errors**: Authentication failures attempt session refresh before retrying

## API Request Context

Every API request automatically includes:

1. JWT authentication token in the Authorization header
2. User ID in the `x-user-id` header
3. Active organization ID in the `x-org-id` header
4. Active role name in the `x-role-name` header

This context enables the backend to make appropriate authorization decisions without additional database queries.

This architecture balances security with performance, embedding role information directly in JWTs while maintaining data integrity through strategic updates and self-healing mechanisms.
