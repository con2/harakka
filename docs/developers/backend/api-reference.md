# API Reference

This document provides a comprehensive reference for the backend API endpoints in the Storage and Booking Application.

## Table of Contents

- [General Information](#general-information)
  - [Authentication](#authentication)
  - [Request & Response Format](#request--response-format)
- [Core Endpoints](#core-endpoints)
  - [Authentication](#authentication-auth)
  - [Users and Profiles](#users-users)
    - [User Banning](#user-banning-user-banning)
    - [User Roles](#roles-roles)
  - [Organizations](#organizations-organizations)
  - [Storage Items](#storage-items-items)
    - [Categories](#categories-categories)
    - [Tags](#tags-tags)
    - [Locations](#locations-storage-locations)
  - [Bookings](#bookings-bookings)
  - [Email System](#email-system-mail)
  - [Logging](#logging-logs)
  - [Error Handling](#error-responses)
  - [Response Types](#response-type)
  - [Notes](#notes)

## General-Information

## Base URL

All API endpoints are relative to the base URL:

- **Development**: `http://localhost:3000`
- **Production**: `https://booking-app-backend-duh9encbeme0awca.northeurope-01.azurewebsites.net/` <!-- toDo: change to actual domain -->

## Authentication

All API endpoints require authentication via JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

### Request & Response Format

Successful responses follow this general structure:

```json
{
  "data": {
    // Response data
  },
  "meta": {
    // Metadata such as pagination
  }
}
```

Error responses follow this structure:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Error type"
}
```

### Request Headers

| Header            | Required | Description                                |
| ----------------- | -------- | ------------------------------------------ |
| `Authorization`   | Yes\*    | Bearer token for authenticated requests    |
| `Content-Type`    | Yes      | `application/json` for all requests        |
| `x-user-id`       | Yes\*    | User ID for certain endpoints              |
| `Accept-Language` | No       | Preferred language for localized responses |

\*Required for authenticated endpoints

---

## Health Check (`/`)

### Get Application Status

```http
GET /
```

**Response:**

```json
{
  "message": "Backend is running",
  "timestamp": "2025-09-12T10:30:00Z"
}
```

---

## **Core Endpoints**

## **Authentication (`/auth`)**

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "jwt-token-here",
  "refresh_token": "refresh-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "refresh-token-here"
}
```

## **Users (`/users`)**

### Get All Users

```http
GET /users?page=1&limit=10&role=user&organizationId=uuid
```

### Get User Profile

```http
GET /users/profile
```

### Update User Profile

```http
PUT /users/profile
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

### Get User by ID

```http
GET /users/:id
```

### Update User Role

```http
PATCH /users/:id/role
Content-Type: application/json

{
  "roleId": "uuid",
  "organizationId": "uuid"
}
```

---

## **Roles (`/roles`)**

### Get All Roles

```http
GET /roles
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "super_admin",
      "description": "Full system access"
    },
    {
      "id": "uuid",
      "name": "tenant_admin",
      "description": "Organization admin"
    }
  ]
}
```

---

## **Organizations (`/organizations`)**

### Get All Organizations

```http
GET /organizations?page=1&limit=10
```

### Get Organization by ID

```http
GET /organizations/:id
```

### Create Organization

```http
POST /organizations
Content-Type: application/json

{
  "name": "New Organization",
  "description": "Organization description",
  "website": "https://example.com",
  "address": "123 Main St"
}
```

### Update Organization

```http
PUT /organizations/:id
Content-Type: application/json

{
  "name": "Updated Name"
}
```

---

## **Storage Items (`/items`)**

### Get All Items

```http
GET /items?page=1&limit=10&search=tent&categoryId=uuid&tagIds=uuid1,uuid2&locationIds=uuid3&orgIds=uuid4&isActive=true
```

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term
- `categoryId`: Filter by category
- `tagIds`: Filter by tags (comma-separated)
- `locationIds`: Filter by locations (comma-separated)
- `orgIds`: Filter by organizations (comma-separated)
- `isActive`: Filter active/inactive items

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Camping Tent",
      "description": "4-person tent",
      "quantity": 5,
      "available_quantity": 3,
      "category_id": "uuid",
      "organization_id": "uuid",
      "location_id": "uuid",
      "is_active": true,
      "created_at": "2025-09-12T10:00:00Z",
      "images": ["image-url-1", "image-url-2"],
      "tags": ["outdoor", "camping"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Get Item by ID

```http
GET /items/:id
```

### Create Item

```http
POST /items
Content-Type: application/json

{
  "name": "Camping Tent",
  "description": "4-person tent",
  "quantity": 5,
  "category_id": "uuid",
  "organization_id": "uuid",
  "location_id": "uuid",
  "tagIds": ["uuid1", "uuid2"]
}
```

### Update Item

```http
PUT /items/:id
Content-Type: application/json

{
  "name": "Updated Tent Name",
  "quantity": 8
}
```

### Delete Item

```http
DELETE /items/:id
```

### Check Item Availability

```http
GET /items/:id/availability?startDate=2025-09-20&endDate=2025-09-25
```

**Response:**

```json
{
  "data": {
    "item_id": "uuid",
    "alreadyBookedQuantity": 2,
    "availableQuantity": 3
  }
}
```

### Bulk Import Items (Excel)

```http
POST /items/bulk-create
Content-Type: multipart/form-data

{
  "file": <excel-file>,
  "organizationId": "uuid"
}
```

---

---

## **Item Images (`/item-images`)**

### Upload Image

```http
POST /item-images/upload
Content-Type: multipart/form-data

{
  "file": <image-file>,
  "itemId": "uuid"
}
```

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "url": "https://storage-url/image.jpg",
    "thumbnail_url": "https://storage-url/thumb.jpg"
  }
}
```

### Get Item Images

```http
GET /item-images/:itemId
```

### Delete Image

```http
DELETE /item-images/:imageId
```

---

## **Categories (`/categories`)**

### Get All Categories

```http
GET /categories?lang=en
```

### Create Category

```http
POST /categories
Content-Type: application/json

{
  "translations": {
    "en": "Electronics",
    "de": "Elektronik"
  },
  "sort_order": 1
}
```

---

## **Tags (`/tags`)**

### Get All Tags

```
GET /tags
```

Returns a list of all tags.

**Response 200**

```json
[
  {
    "id": "uuid",
    "translations": {
      "en": { "name": "Armor" },
      "fi": { "name": "Haarniska" }
    },
    "created_at": "2023-01-01T00:00:00Z"
  }
  // ...
]
```

### Create Tag

```http
POST /tags
Content-Type: application/json

{
  "name": "outdoor",
  "color": "#0d00ffff"
}
```

---

## **Bookings (`/bookings`)**

### Get All Bookings

```http
GET /bookings?page=1&limit=10&status=pending&organizationId=uuid&userId=uuid
```

**Query Parameters:**

- `status`: Filter by status (pending, confirmed, rejected, cancelled, completed)
- `organizationId`: Filter by organization
- `userId`: Filter by user
- `startDate`: Filter bookings starting after date
- `endDate`: Filter bookings ending before date

### Get Booking by ID

```http
GET /bookings/:id
```

### Create Booking

```http
POST /bookings
Content-Type: application/json

{
  "start_date": "2025-09-20",
  "end_date": "2025-09-25",
  "pickup_method": "pickup",
  "notes": "Special instructions",
  "booking_items": [
    {
      "storage_item_id": "uuid",
      "quantity": 2
    }
  ]
}
```

### Update Booking Status

```http
PATCH /bookings/:id/status
Content-Type: application/json

{
  "status": "confirmed",
  "admin_notes": "Approved for pickup"
}
```

### Cancel Booking

```http
DELETE /bookings/:id
Content-Type: application/json

{
  "reason": "User cancelled"
}
```

---

## **Booking Items (`/booking-items`)**

### Get Booking Items

```http
GET /booking-items?bookingId=uuid
```

### Update Booking Item Status

```http
PATCH /booking-items/:id/status
Content-Type: application/json

{
  "status": "picked_up"
}
```

---

## **Locations (`/storage-locations`)**

### Get All Storage Locations

```http
GET /storage-locations?organizationId=uuid
```

### Create Storage Location

```http
POST /storage-locations
Content-Type: application/json

{
  "name": "Warehouse A",
  "address": "123 Storage St",
  "organization_id": "uuid"
}
```

---

## **Email System (`/mail`)**

### Preview Email Templates (Development Only)

```http
GET /mail/preview/booking-creation
GET /mail/preview/booking-confirmation
GET /mail/preview/welcome
```

---

## **Logging (`/logs`)**

### Get Application Logs

```http
GET /logs?page=1&limit=50&level=error&startDate=2025-09-01&endDate=2025-09-12
```

---

## **User Banning (`/user-banning`)**

### Ban User

```http
POST /user-banning/ban
Content-Type: application/json

{
  "userId": "uuid",
  "reason": "Violation of terms",
  "duration": 30  // days, omit for permanent
}
```

### Unban User

```http
POST /user-banning/unban
Content-Type: application/json

{
  "userId": "uuid"
}
```

---

## **Error Responses**

All endpoints may return these error formats:

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Response Type

### Format / Example

#### Successful response

```json
{
  "error": null,
  "data": {}, // any data requested from backend or manually inserted
  "count": null,
  "status": 200,
  "statusText": "OK"
}
```

#### Unsuccessful response

```json
{
  "error": {
    "code": "22P02",
    "details": null,
    "hint": null,
    "message": "invalid input syntax for type uuid: \"4dfd509e-a02d-493d-3a-e49dfddc6445\""
  },
  "data": null,
  "count": null,
  "status": 400,
  "statusText": "Bad Request"
}
```

### Type

The agreed-upon response types looks like the following:

```ts
export type ApiResponse<T> = PostgrestResponse<T> & {
  metadata?: any;
};

export type ApiSingleResponse<T> = PostgrestSingleResponse<T> & {
  metadata?: any;
};
```

1. **ApiResponse<T>**
   Returns an object with the same properties as a PostgrestResponse as well as an optional metadata. Will always return an array of the type, no need to explicitly say that the expected data will be an array.

2. **ApiSingleResponse<T>**
   This type should be used the exact same way as the ApiResponse. Will always return a singular entity of the expected type, no arrays.

### Usage

```ts
  async getBookingItems(
    supabase: SupabaseClient,
    booking_id: string,
    offset: number = 0,
    limit: number = 20,
  ): Promise<ApiResponse<BookingItemsRow>> {
    const result: PostgrestResponse<BookingItemsRow> = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", booking_id)
      .range(offset, offset + limit);

    /**
     * Example version of error-handling. If response is successful, result.error will be null
     * */
    if (result.error) {
      throw new Error(result.error)
    }

    return result;
  }
```

---

## **Notes**

- All timestamps are in ISO 8601 format (UTC)
- UUIDs are used for all entity IDs
- Pagination follows the format: `?page=1&limit=10`
- File uploads support JPG, PNG, WebP formats (max 5MB)
- Role-based access control applies to all endpoints
- Rate limiting may apply to certain endpoints

---

## **Related Documentation**

- [Database Schema](./database-schema.md)
- [Authentication & Security](./security.md)
- [Email System](./email-system.md)
- [Modules Overview](./modules.md)
- [Query-Constructor](./queryconstructor.md)
