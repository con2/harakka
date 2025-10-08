# Harakka Application

A comprehensive platform for managing and booking storage items across multiple locations. This application allows users to browse available storage options, make reservations, and manage their bookings through an intuitive interface.

[![License](https://img.shields.io/badge/license-Non--Commercial-red.svg)](./LICENSE)

## Features

- **Item Management**: Browse and book storage items with real-time availability
- **User Authentication**: Secure login with role-based access control
- **Multi-language Support**: Complete English and Finnish localization
- **Admin Dashboard**: Comprehensive tools for inventory and order management
- **Responsive Design**: Seamless experience across desktop and mobile devices

## Documentation

Comprehensive documentation is available in the `docs` directory:

- [Quick Start Guide](docs/quick-start.md) - Initial setup and local development (initial super_admin creation)
- [Setup Script Guide](docs/developers/workflows/scripts/setup.md) - Setup Script Guide
- [Project Structure](docs/developers/project-structure.md) - Directory organization
- [JWT and Roles](docs/developers/JWT-and-roles.md) - Authentication and authorization system
- [Environment Variables](docs/developers/environment-variables.md) - environment variables guide
- [Infisical Setup](docs/developers/infisical-setup.md) - Secure environment variable management with Infisical
- [Tech stack](docs/developers/tech-stack.md) - Overview of technologies used

### Frontend Documentation

- [API Integration](docs/developers/frontend/api-integration.md) - Backend communication
- [State Management](docs/developers/frontend/state-management.md) - Redux guide
- [Routing](docs/developers/frontend/routing.md) - Navigation system
- [Styling Guide](docs/developers/frontend/styling-guide.md) - UI design system
- [Translation & Localization Guide](docs/developers/frontend/translation.md) - Multi-language support and usage

### Backend Documentation

- [Backend Overview](docs/developers/backend/backend-overview.md) - Architecture and modules
- [API Reference](docs/developers/backend/api-reference.md) - API endpoints
- [Modules](docs/developers/backend/modules.md) - Core modules and services
- [Security](docs/developers/backend/security.md) - Security practices and implementations
- [Email System](docs/developers/backend/email-system.md) - Email templates and SMTP setup
- [Query Constructor](docs/developers/backend/queryconstructor.md) - Dynamic query building utility

### Common Documentation

- [Helper Types](docs/developers/common/helper-types.md) - Utility types for TypeScript
- [Unified Supabase Types](docs/developers/common/new-unified-types.md) - Shared Supabase types with `MergeDeep`

### Database Documentation

- [Getting Started Database](docs/developers/database/getting-started.md) - Setting up the databases
- [Migrations](docs/developers/database/migration-seperation.md) - Managing migrations
- [Row-Level Security (RLS)](docs/developers/database/row-level-security.md) - Implementing RLS policies
- [SQL checks](docs/developers/database/SQL-checks.md) - Database integrity checks
- [Subabase local development](docs/developers/database/supabase-local-development.md) - Local Supabase setup
- [Supabase dotenvx](docs/developers/database/supabase-dotenvx.md) - Managing Supabase environment variables

### Workflow Documentation

- [Default Deployment](docs/developers/workflows/default-deployment.md) - Default Production deployment (Azure)
- [Azure Instances Creation](docs/developers/workflows/azure-instances-creation.md) - Setting up Azure resources
