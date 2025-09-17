# FullStack Storage & Booking Application

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

- [Getting Started Guide](docs/developers/getting-started.md) - Setup instructions
- [Project Overview](docs/developers/overview.md) - Architectural overview
- [Project Structure](docs/developers/project-structure.md) - Directory organization
- [Lessons Learned](docs/developers/lessons-learned.md) - Technical insights and knowledge gained

### Frontend Documentation

- [API Integration](docs/developers/frontend/api-integration.md) - Backend communication
- [State Management](docs/developers/frontend/state-management.md) - Redux guide
- [Routing](docs/developers/frontend/routing.md) - Navigation system
- [Styling Guide](docs/developers/frontend/styling-guide.md) - UI design system
- [Translation & Localization Guide](docs/developers/frontend/translation.md) - Multi-language support and usage

### Backend Documentation

- [Database Schema](docs/developers/backend/database-schema.md) - Data structure
- [API Reference](docs/developers/backend/api-reference.md) - API endpoints
- [Supabase Setup](docs/developers/backend/supabase-setup.md) - Configuration
- [Security](docs/developers/backend/security.md) - Authentication and authorization

### Workflow Documentation

- [Development Cycle](docs/developers/workflows/development-cycle.md) - Git workflow
- [Testing](docs/developers/workflows/testing.md) - Testing practices
- [Default Deployment](docs/developers/workflows/default-deployment.md) - Default Production deployment
- [Docker Deployment](docs/developers/workflows/docker-deployment.md) - Docker Deployment
- [Contribution Guide](docs/developers/workflows/contribution-guide.md) - How to contribute

## Prerequisites

- **Node.js**: v18 or higher
- **Supabase Account**: Free tier works for development

## Quick Start

1. **Clone the repository:**

```sh
git clone https://github.com/Ermegilius/FullStack_Storage_and_Booking_App.git
cd FullStack_Storage_and_Booking_App
```

1. **Set up environment variables:**

```sh
./scripts/setup.sh
# Choose option 2 for Local Development
```

1. **Install dependencies:**

```sh
npm run install-all
```

1. **Run the application:**

```sh
# Terminal 1: Start backend
cd backend && npm run start:dev

# Terminal 2: Start frontend  
cd frontend && npm run dev
```

1. **Access the application:**
   - Frontend: <http://localhost:5180>
   - Backend API: <http://localhost:3000>

## Deployment

For production deployment options, see:

- [Docker Deployment Guide](docs/developers/workflows/docker-deployment.md) -  Containerized deployment
- [Default Deployment Guide](docs/developers/workflows/default-deployment.md) - Traditional deployment

## Project Structure

```sh
FullStack_Storage_and_Booking_App/
├── backend/                # NestJS application
│   ├── src/                # Source code
│   └── dbSetStatements/    # Database setup SQL
├── frontend/               # React application
│   └── src/                # Source code
└── docs/                   # Documentation
    └── developers/         # Developer guides
```

For a more detailed breakdown, see the [Project Structure](docs/developers/project-structure.md) documentation. 

## Development Workflow

We follow a Git Flow-inspired branching strategy:

- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: For new features
- `deployment`: For deployment configuration

See the [Development Cycle](docs/developers/workflows/development-cycle.md) guide for details.

## Contributing

Contributions are welcome! Please read our [Contribution Guide](docs/developers/workflows/contribution-guide.md) before submitting changes.

## License

This project is licensed under the **FullStack Storage and Booking App Non-Commercial License v1.0**.  
See the [LICENSE](./LICENSE) file for details.

Commercial use is prohibited without a separate agreement.  
To request permission for commercial use or to contact the team, please open an issue or reach out via our GitHub organization page: <404internsfound@gmail.com>
