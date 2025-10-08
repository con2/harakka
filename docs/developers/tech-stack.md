# Technology Stack

This document outlines the key technologies used in our Storage and Booking Application.

## Frontend

### Core Technologies

- **React** - UI library for building component-based interfaces
- **TypeScript** - Static type checking for JavaScript
- **Vite** - Modern frontend build tool and dev server

### State Management

- **Redux Toolkit** - State management with simplified Redux setup
- **React Context** - For more localized state like language preferences

### Styling and UI

- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library built on top of Tailwind
- **Lucide React** - Icon library
- **tw-animate-css** - Animation library for Tailwind

### Routing and Navigation

- **React Router DOM** (v7) - Client-side routing

### UI Components and Utilities

- **Radix UI** - Unstyled, accessible UI primitives
- **class-variance-authority** - Utility for creating variant components
- **clsx & tailwind-merge** - Tools for conditional class composition
- **date-fns** - Date utility library
- **react-day-picker** - Date picker component
- **Sonner** - Toast notification system
- **react-star-ratings** - Star rating component
- **Tanstack React Table** - Tables with sorting and filtering

### Forms

- **React Hook Form** - Form state management and validation
- **Zod** - Schema validation

### API and Data Fetching

- **Axios** - HTTP client

### Authentication

- **Supabase Auth** - Authentication service

### Testing

- **Cypress** - End-to-end testing framework

## Backend

### Core Framework

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type safety for backend code

### Database and Authentication

- **Supabase** - Postgres database with built-in authentication
- **CRUD operations** - Via Supabase client

### Email Services

- **React Email** - Email template components
- **Nodemailer** - Email sending service

### Document Generation

- **PDFKit** - PDF generation library
- **bwip-js** - Barcode generation

### File Storage

- **Supabase Storage** - File storage for uploads

### API Features

- **Throttling** - Rate limiting for API endpoints
- **Validation** - Using class-validator and class-transformer
- **Error handling** - Global exception filters

### Date/Time Handling

- **Day.js** - Lightweight date-time library
- **dayjs-plugin-utc** - UTC support

## DevOps & Tools

### Development

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Infisical** - Secret management for environment variables

### Version Control

- **Git** - Source code management

### CI/CD

- **GitHub Actions** - Continuous integration and deployment workflows
- **Azure Static Web Apps** - Deployment for frontend
- **Azure App Service** - Deployment for backend

### Other Tools

- **Postman** - API testing and documentation
- **dotenv-expand** - Expanding environment variables
- **env-cmd** - Managing environment variables
