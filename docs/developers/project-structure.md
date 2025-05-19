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
│   │   ├── main.ts                    # Application entry point
│   │   └── app.module.ts              # Main application module
│   ├── dist/                          # Compiled output
│   ├── tests/                         # Test files
│   ├── package.json                   # Dependencies and scripts
│   ├── tsconfig.json                  # TypeScript configuration
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
├── docs/                              # Project documentation
│   ├── developers/
│   │   └── project-structure.md
│   └── README.md
├── .github/                           # Utility and deployment scripts
│   └── workflows /
│       ├── deployment-back.yml        # Backend deployment workflow
│       ├── deployment-frontend.yml    # Frontend deployment workflow
├── .env.local                         # Environment variables
├── .gitignore                         # Git ignore rules
└── README.md                          # Project overview
```

**Notes:**

- `backend/`: NestJS application with controllers, services and other components

  - Uses Supabase for database and authentication
  - Includes email service and PDF invoice generation

- `frontend/`: React application built with Vite and TypeScript

  - Uses Redux Toolkit for state management
  - Implements Shadcn UI components
  - Supports multiple languages (Finnish and English)
  - Features responsive design with mobile-specific components

- `docs/`: Documentation for developers and users

- Root-level files include environment configuration and project metadata
