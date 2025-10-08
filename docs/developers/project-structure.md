# Project Structure

This document provides an overview of the project's directory structure and organization.

```
FullStack_Storage_and_Booking_App/
├── backend/                           # NestJS backend application
│   ├── src/
│   │   ├── controllers/               # API endpoints
│   │   ├── services/                  # Business logic
│   │   ├── email-templates/           # Email template files
│   │   ├── mail/                      # Mail module
│   │   ├── middleware/                # Request preprocessing
│   │   ├── guards/                    # Authorization guards
│   │   ├── utils/                     # Shared utility functions
│   │   ├── types/                     # TypeScript type definitions
│   │   ├── main.ts                    # Application entry point
│   │   └── app.module.ts              # Main application module
│   ├── dist/                          # Compiled output
│   ├── tests/                         # Test files
│   ├── package.json                   # Dependencies and scripts
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── nest-cli.json                  # NestJS CLI configuration
│   ├── eslint.config.mjs             # ESLint configuration
│   ├── config.mts                    # Backend configuration
│   └── README.md                      # Backend documentation
├── frontend/                          # React frontend application
│   ├── public/                        # Static files
│   ├── src/
│   │   ├── api/                       # API service calls
│   │   ├── assets/                    # Images, fonts, etc.
│   │   ├── components/                # Reusable UI components
│   │   │   ├── Admin/                 # Admin-specific components
│   │   │   └── ui/                    # Shadcn UI components
│   │   ├── context/                   # React context providers
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── lib/                       # Utility functions
│   │   ├── pages/                     # Page components
│   │   ├── store/                     # Redux store
│   │   │   ├── hooks.ts               # Redux hooks
│   │   │   ├── store.ts               # Store configuration
│   │   │   ├── utils/                 # Store utilities
│   │   │   └── slices/                # Redux slices
│   │   ├── translations/              # Internationalization
│   │   ├── types/                     # TypeScript type definitions
│   │   ├── App.tsx                    # Main application component
│   │   ├── main.tsx                   # Application entry point
│   │   └── index.css                  # Global styles
│   ├── index.html                     # HTML entry point
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── tsconfig.app.json              # App-specific TypeScript config
│   ├── vite.config.ts                 # Vite configuration
│   ├── package.json                   # Dependencies and scripts
│   └── README.md                      # Frontend documentation
├── common/                            # Shared utilities and types
│   ├── package.json                   # Dependencies and scripts
│   └── supabase.types.ts              # Supabase type definitions
├── docs/                              # Project documentation
│   ├── developers/
│   │   ├── workflows/                 # CI/CD and deployment workflows
│   │   └── project-structure.md       # This file
│   └── README.md                      # Documentation overview
├── postman/                           # Postman collections for API testing
│   ├── Harakka.json                   # Postman collection file
│   └── postman.md                     # Postman usage guide
├── scripts/                           # Utility scripts for setup and maintenance
├── supabase/                          # Supabase functions and configuration
│   ├── migrations/                    # Database migrations
│   ├── functions/                     # Supabase edge functions
├── .github/                           # Utility and deployment scripts
│   └── workflows/
│       ├── deployment-back.yml        # Backend deployment workflow
│       ├── deployment-frontend.yml    # Frontend deployment workflow
├── .env.local                         # Environment variables
├── .env.local.template                # Template for local environment variables
├── .env.production                    # Production environment variables
├── .env.production.template           # Template for production environment variables
├── .env.supabase.local                # Supabase local environment variables
├── .env.supabase.local.template       # Template for Supabase local environment variables
├── .env.vault                         # Encrypted environment variables
├── .gitignore                         # Git ignore rules
├── LICENSE                            # License file
└── README.md                          # Project overview
```

**Notes:**

- `backend/`: NestJS application with controllers, services, and other components

  - Uses Supabase for database and authentication
  - Includes email service, PDF invoice generation, and role-based access control
  - Implements middleware and guards for security

- `frontend/`: React application built with Vite and TypeScript

  - Uses Redux Toolkit for state management
  - Implements Shadcn UI components for consistent design
  - Supports multiple languages (Finnish and English)
  - Features responsive design with mobile-specific components

- `common/`: Shared utilities and types used across the backend and frontend

- `docs/`: Comprehensive documentation for developers and users

  - Includes guides for workflows, environment setup, and project structure

- `postman/`: Contains Postman collections for API testing and documentation

- `supabase/`: Contains Supabase functions for serverless operations and database migrations

- `scripts/`: Utility scripts for automating setup and maintenance tasks

- Root-level files include environment configuration, deployment workflows, and project metadata
