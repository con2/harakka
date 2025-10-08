# Harakka Application

A comprehensive platform for managing and booking storage items across multiple locations. This application allows users to browse available storage options, make reservations, and manage their bookings through an intuitive interface.

[![License](https://img.shields.io/badge/license-Non--Commercial-red.svg)](./LICENSE)

## Features

- **Item Management**: Browse and book storage items with real-time availability
- **User Authentication**: Secure login with role-based access control
- **Multi-language Support**: Complete English and Finnish localization
- **Admin Dashboard**: Comprehensive tools for inventory and order management
- **Responsive Design**: Seamless experience across desktop and mobile devices

## Tech Stack

### Frontend

- **React 18** with TypeScript for type-safe component development
- **Vite** for fast development and optimized builds
- **Redux Toolkit** for centralized state management
- **UI Components**: Shadcn/UI with Tailwind CSS for styling
- **Axios** for API requests with automatic authentication
- **React Router** for client-side routing
- **Cypress** for end-to-end testing

### Backend

- **NestJS** for robust, modular API development
- **TypeScript** for type safety across the application
- **Supabase** for PostgreSQL database, authentication and storage
- **Row-Level Security** for fine-grained data access control
- **Email Integration** with nodemailer and React Email templates

## Documentation

Comprehensive documentation is available in the `docs` directory:

- [Quick Start Guide](docs/quick-start.md) - Initial setup and local development (initial super_admin creation)
- [Setup Script Guide](docs/developers/workflows/scripts/setup.md) - Setup Script Guide
- [Project Overview](docs/developers/overview.md) - Architectural overview
- [Project Structure](docs/developers/project-structure.md) - Directory organization
- [JWT and Roles](docs/developers/JWT-and-roles.md) - Authentication and authorization system
- [Environment Variables](docs/developers/environment-variables.md) - environment variables guide

### Frontend Documentation

- [API Integration](docs/developers/frontend/api-integration.md) - Backend communication
- [State Management](docs/developers/frontend/state-management.md) - Redux guide
- [Routing](docs/developers/frontend/routing.md) - Navigation system
- [Styling Guide](docs/developers/frontend/styling-guide.md) - UI design system
- [Translation & Localization Guide](docs/developers/frontend/translation.md) - Multi-language support and usage

### Backend Documentation

- [Database Schema](docs/developers/backend/database-schema.md) - Data structure
- [API Reference](docs/developers/backend/api-reference.md) - API endpoints
- [Supabase (Branching & Setup)](docs/developers/Supabase.md) - Branching, setup, and workflow
- [Security](docs/developers/backend/security.md) - Authentication and authorization

### Database Documentation

- [Getting Started Database](docs/developers/database/getting-started.md) - Setting up the database
- [Migrations](docs/developers/database/migration-seperation.md) - Managing migrations
- [Row-Level Security (RLS)](docs/developers/database/row-level-security.md) - Implementing RLS policies
- [SQL checks](docs/developers/database/SQL-checks.md) - Database integrity checks
- [Subabase local development](docs/developers/database/supabase-local-development.md) - Local Supabase setup

### Workflow Documentation

- [Development Cycle](docs/developers/workflows/development-cycle.md) - Git workflow
- [Testing](docs/developers/workflows/testing.md) - Testing practices
- [Default Deployment](docs/developers/workflows/default-deployment.md) - Default Production deployment (Azure)
- [Contribution Guide](docs/developers/workflows/contribution-guide.md) - How to contribute
