# API Reference

This document provides a comprehensive reference for the backend API endpoints in the Storage and Booking Application.

## Table of Contents

- [General Information](#general-information)
- [Authentication](#authentication)
- [Users and Profiles](#users-and-profiles)
- [Storage Items](#storage-items)
- [Storage Locations](#storage-locations)
- [Tags](#tags)
- [Orders](#orders)
- [Payments and Invoices](#payments-and-invoices)
- [Logs](#logs)
- [Error Handling](#error-handling)
- [Response Type](#response-type)

## General Information

### Base URL

All API endpoints are relative to the base URL:

- **Development**: `http://localhost:3000`
- **Production**: `https://api.your-production-domain.com`

### Response Format

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

## Authentication

Authentication is handled through Supabase Auth. The API uses JWT tokens for authorization.

### Get Current User

```
GET /auth/profile
```

Returns the profile of the currently authenticated user.

**Response 200**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "user",
  "full_name": "User Name",
  "visible_name": "User",
  "phone": "+1234567890",
  "preferences": {
    /* preferences object */
  }
}
```

## Users and Profiles

### Get All Users

```
GET /users
```

Returns a list of all users. Requires admin privileges.

**Response 200**

```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user",
    "full_name": "User Name",
    "visible_name": "User",
    "created_at": "2023-01-01T00:00:00Z"
  }
  // ...
]
```

### Get User by ID

```
GET /users/:id
```

Returns a specific user's profile by ID.

**Response 200**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "user",
  "full_name": "User Name",
  "visible_name": "User",
  "phone": "+1234567890",
  "preferences": {
    /* preferences object */
  },
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Update User

```
PUT /users/:id
```

Updates a user's profile.

**Request Body**

```json
{
  "full_name": "New Name",
  "visible_name": "NewUser",
  "phone": "+0987654321",
  "preferences": {
    /* updated preferences */
  }
}
```

**Response 200**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "user",
  "full_name": "New Name",
  "visible_name": "NewUser",
  "phone": "+0987654321",
  "preferences": {
    /* updated preferences */
  },
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Delete User

```
DELETE /users/:id
```

Deletes a user account. Requires admin privileges or account ownership.

**Response 204**

No content

## Storage Items

### Get All Storage Items

```
GET /storage-items
```

Returns a list of all storage items.

**Query Parameters**

| Parameter     | Type    | Description                       |
| ------------- | ------- | --------------------------------- |
| `location_id` | string  | Filter by location                |
| `active_only` | boolean | If true, return only active items |
| `tag_id`      | string  | Filter by tag                     |
| `page`        | number  | Page number for pagination        |
| `limit`       | number  | Items per page                    |

**Response 200**

```json
[
  {
    "id": "uuid",
    "location_id": "uuid",
    "price": 10.99,
    "items_number_total": 50,
    "average_rating": 4.5,
    "is_active": true,
    "translations": {
      "en": {
        "item_name": "Combat Vest",
        "item_description": "Military style combat vest"
      },
      "fi": {
        "item_name": "Taisteluliivi",
        "item_description": "Sotilastyylinen taisteluliivi"
      }
    },
    "created_at": "2023-01-01T00:00:00Z"
  }
  // ...
]
```

### Get Storage Item by ID

```
GET /storage-items/:id
```

Returns a specific storage item by ID.

**Response 200**

```json
{
  "id": "uuid",
  "location_id": "uuid",
  "compartment_id": "uuid",
  "price": 10.99,
  "items_number_total": 50,
  "average_rating": 4.5,
  "is_active": true,
  "translations": {
    "en": {
      "item_name": "Combat Vest",
      "item_description": "Military style combat vest"
    },
    "fi": {
      "item_name": "Taisteluliivi",
      "item_description": "Sotilastyylinen taisteluliivi"
    }
  },
  "images": [
    {
      "id": "uuid",
      "image_url": "https://example.com/image.jpg",
      "image_type": "main",
      "display_order": 1
    }
  ],
  "tags": [
    {
      "id": "uuid",
      "translations": {
        "en": { "name": "Armor" },
        "fi": { "name": "Haarniska" }
      }
    }
  ],
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Create Storage Item

```
POST /storage-items
```

Creates a new storage item. Requires admin privileges.

**Request Body**

```json
{
  "location_id": "uuid",
  "compartment_id": "uuid",
  "items_number_total": 50,
  "price": 10.99,
  "is_active": true,
  "translations": {
    "en": {
      "item_name": "Combat Vest",
      "item_description": "Military style combat vest"
    },
    "fi": {
      "item_name": "Taisteluliivi",
      "item_description": "Sotilastyylinen taisteluliivi"
    }
  },
  "tag_ids": ["uuid1", "uuid2"]
}
```

**Response 201**

```json
{
  "id": "uuid",
  "location_id": "uuid",
  "compartment_id": "uuid",
  "price": 10.99,
  "items_number_total": 50,
  "average_rating": 0,
  "is_active": true,
  "translations": {
    "en": {
      "item_name": "Combat Vest",
      "item_description": "Military style combat vest"
    },
    "fi": {
      "item_name": "Taisteluliivi",
      "item_description": "Sotilastyylinen taisteluliivi"
    }
  },
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Update Storage Item

```
PUT /storage-items/:id
```

Updates a storage item. Requires admin privileges.

**Request Body**

```json
{
  "price": 12.99,
  "is_active": true,
  "translations": {
    "en": {
      "item_description": "Updated military style combat vest"
    }
  }
}
```

**Response 200**

```json
{
  "id": "uuid",
  "location_id": "uuid",
  "compartment_id": "uuid",
  "price": 12.99,
  "items_number_total": 50,
  "average_rating": 4.5,
  "is_active": true,
  "translations": {
    "en": {
      "item_name": "Combat Vest",
      "item_description": "Updated military style combat vest"
    },
    "fi": {
      "item_name": "Taisteluliivi",
      "item_description": "Sotilastyylinen taisteluliivi"
    }
  },
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Delete Storage Item

```
POST /storage-items/:id/soft-delete
```

Soft deletes a storage item. Requires admin privileges.

**Response 200**

```json
{
  "id": "uuid",
  "is_deleted": true,
  "is_active": false
}
```

### Upload Item Image

```
POST /storage-items/:id/images
```

Uploads an image for a storage item. Requires admin privileges.

**Request Body (multipart/form-data)**

```
image: [file]
image_type: "main" | "thumbnail" | "detail"
display_order: 1
alt_text: "Description of image"
```

**Response 201**

```json
{
  "id": "uuid",
  "item_id": "uuid",
  "image_url": "https://example.com/image.jpg",
  "image_type": "main",
  "display_order": 1,
  "alt_text": "Description of image",
  "storage_path": "item-images/uuid.jpg",
  "is_active": true,
  "created_at": "2023-01-01T00:00:00Z"
}
```

## Storage Locations

### Get All Locations

```
GET /locations
```

Returns a list of all storage locations.

**Response 200**

```json
[
  {
    "id": "uuid",
    "name": "Main Storage",
    "description": "Primary storage facility",
    "address": "123 Main St, City",
    "latitude": 60.1699,
    "longitude": 24.9384,
    "is_active": true,
    "image_url": "https://example.com/location.jpg",
    "created_at": "2023-01-01T00:00:00Z"
  }
  // ...
]
```

### Get Location by ID

```
GET /locations/:id
```

Returns a specific location by ID.

**Response 200**

```json
{
  "id": "uuid",
  "name": "Main Storage",
  "description": "Primary storage facility",
  "address": "123 Main St, City",
  "latitude": 60.1699,
  "longitude": 24.9384,
  "is_active": true,
  "image_url": "https://example.com/location.jpg",
  "working_hours": [
    {
      "day": "monday",
      "open_time": "09:00:00",
      "close_time": "17:00:00"
    }
    // Other days
  ],
  "images": [
    {
      "id": "uuid",
      "image_url": "https://example.com/location1.jpg",
      "image_type": "main",
      "display_order": 1
    }
  ],
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Create Location

```
POST /locations
```

Creates a new storage location. Requires admin privileges.

**Request Body**

```json
{
  "name": "Downtown Storage",
  "description": "Downtown storage facility",
  "address": "456 Center St, City",
  "latitude": 60.1699,
  "longitude": 24.9384,
  "is_active": true,
  "image_url": "https://example.com/location.jpg",
  "working_hours": [
    {
      "day": "monday",
      "open_time": "09:00:00",
      "close_time": "17:00:00"
    }
    // Other days
  ]
}
```

**Response 201**

```json
{
  "id": "uuid",
  "name": "Downtown Storage",
  "description": "Downtown storage facility",
  "address": "456 Center St, City",
  "latitude": 60.1699,
  "longitude": 24.9384,
  "is_active": true,
  "image_url": "https://example.com/location.jpg",
  "created_at": "2023-01-01T00:00:00Z"
}
```

## Tags

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

```
POST /tags
```

Creates a new tag. Requires admin privileges.

**Request Body**

```json
{
  "translations": {
    "en": { "name": "Weapons" },
    "fi": { "name": "Aseet" }
  }
}
```

**Response 201**

```json
{
  "id": "uuid",
  "translations": {
    "en": { "name": "Weapons" },
    "fi": { "name": "Aseet" }
  },
  "created_at": "2023-01-01T00:00:00Z"
}
```

## Orders

### Get All Orders

```
GET /orders
```

Returns a list of all orders for the authenticated user. Admin users can see all orders.

**Query Parameters**

| Parameter | Type   | Description                                     |
| --------- | ------ | ----------------------------------------------- |
| `status`  | string | Filter by status (`pending`, `confirmed`, etc.) |
| `page`    | number | Page number for pagination                      |
| `limit`   | number | Items per page                                  |

**Response 200**

```json
[
  {
    "id": "uuid",
    "order_number": "ORD-12345",
    "user_id": "uuid",
    "status": "confirmed",
    "total_amount": 50.99,
    "discount_amount": 5.0,
    "final_amount": 45.99,
    "payment_status": "invoice-sent",
    "created_at": "2023-01-01T00:00:00Z"
  }
  // ...
]
```

### Get Order by ID

```
GET /orders/:id
```

Returns a specific order by ID.

**Response 200**

```json
{
  "id": "uuid",
  "order_number": "ORD-12345",
  "user_id": "uuid",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "User Name"
  },
  "status": "confirmed",
  "total_amount": 50.99,
  "discount_amount": 5.0,
  "final_amount": 45.99,
  "payment_status": "invoice-sent",
  "notes": "Special handling required",
  "order_items": [
    {
      "id": "uuid",
      "item_id": "uuid",
      "quantity": 2,
      "unit_price": 10.99,
      "start_date": "2023-02-01T00:00:00Z",
      "end_date": "2023-02-05T00:00:00Z",
      "total_days": 5,
      "subtotal": 109.9,
      "status": "confirmed",
      "item": {
        "id": "uuid",
        "translations": {
          "en": { "item_name": "Combat Vest" }
        }
      }
    }
  ],
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Create Order

```
POST /orders
```

Creates a new order.

**Request Body**

```json
{
  "items": [
    {
      "item_id": "uuid",
      "quantity": 2,
      "start_date": "2023-02-01T00:00:00Z",
      "end_date": "2023-02-05T00:00:00Z"
    }
  ],
  "discount_code": "WELCOME10",
  "notes": "Special handling required"
}
```

**Response 201**

```json
{
  "id": "uuid",
  "order_number": "ORD-12345",
  "user_id": "uuid",
  "status": "pending",
  "total_amount": 50.99,
  "discount_amount": 5.0,
  "final_amount": 45.99,
  "payment_status": null,
  "notes": "Special handling required",
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Update Order Status

```
PATCH /orders/:id/status
```

Updates an order's status. Requires admin privileges or order ownership.

**Request Body**

```json
{
  "status": "confirmed"
}
```

**Response 200**

```json
{
  "id": "uuid",
  "order_number": "ORD-12345",
  "status": "confirmed",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

## Payments and Invoices

### Generate Invoice

```
GET /orders/:orderId/generate
```

Generates an invoice for an order. Requires admin privileges or order ownership.

**Response 200**

```json
{
  "invoice_url": "https://example.com/invoice.pdf"
}
```

### Get Invoice PDF URL

```
GET /invoices/:orderId/pdf
```

Returns a signed URL for downloading the invoice PDF. Requires admin privileges or order ownership.

**Response 200**

```
"https://signed-url-for-invoice.pdf"
```

## Logs

### Get All Logs

```
GET /logs
```

Returns a list of system logs. Requires admin privileges.

**Headers**

| Header      | Description   |
| ----------- | ------------- |
| `x-user-id` | Admin user ID |

**Response 200**

```json
[
  {
    "id": "uuid",
    "level": "info",
    "message": "Order confirmed",
    "metadata": {
      "orderId": "uuid",
      "userId": "uuid"
    },
    "source": "OrderService",
    "created_at": "2023-01-01T00:00:00Z"
  }
  // ...
]
```

## Error Handling

### Common Error Codes

| Status Code | Description                                     |
| ----------- | ----------------------------------------------- |
| 400         | Bad Request - Invalid input                     |
| 401         | Unauthorized - Authentication required          |
| 403         | Forbidden - Insufficient permissions            |
| 404         | Not Found - Resource does not exist             |
| 409         | Conflict - Resource already exists              |
| 422         | Unprocessable Entity - Validation error         |
| 429         | Too Many Requests - Rate limit exceeded         |
| 500         | Internal Server Error - Unexpected server error |

### Error Response Example

```json
{
  "statusCode": 400,
  "message": "Invalid input data",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
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

### Other cases

In the event of that an endpoint does not make a request to the database, the returned data **should** have the same format as the ApiResponse/ApiSingleResponse still.
