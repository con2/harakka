# Backend Documentation

## Architecture Overview

This backend delivers the API that runs our Storage & Booking system, which is built with NestJS.

### Tech Stack

- **Framework:** NestJS (Node.js)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth + JWT
- **Email:** React Email Templates
- **File Upload:** Supabase Storage
- **API Documentation:** Swagger/OpenAPI

### Project Structure

```
backend/src/
├── modules/           # Feature modules (13 modules)
│   ├── auth/         # Authentication
│   ├── booking/      # Booking management
│   ├── storage-items/ # Inventory management
│   ├── organization/ # Multi-tenant orgs
│   ├── user/         # User management
│   ├── mail/         # Email system
│   ├── item-images/  # File uploads
│   └── ...           # Other modules
├── guards/           # Auth & role guards
├── middleware/       # Request preprocessing
├── utils/           # Shared utilities
├── emails/          # React Email templates (10 templates)
└── types/           # TypeScript definitions
```

## Documentation Index

1. [API Reference](./api-reference.md) - REST endpoints
2. [Database Schema](./database-schema.md) - DB structure
3. [Modules Overview](./modules.md) - Feature modules
4. [Security](./security.md) - Auth & permissions
5. [Email System](./email-system.md) - Email templates
6. [File Upload](./file-upload.md) - Image handling
7. [Supabase Setup](./supabase-setup.md) - DB configuration

## Quick Start

See [Getting Started](../getting-started.md) for setup instructions.
