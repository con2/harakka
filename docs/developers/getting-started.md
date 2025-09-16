# Getting Started with FullStack Storage and Booking App

This guide will help you set up your development environment and get the application running locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18 or higher ([Download](https://nodejs.org/))
- **npm**: Usually comes with Node.js
- **Git**: For version control ([Download](https://git-scm.com/))
- **Supabase Account**: Sign up at [Supabase](https://supabase.com/)
- **Azure Account**: For deployment ([Sign up](https://azure.microsoft.com/))

## Installation

1. Clone the repository:

```sh
git clone <https://github.com/Ermegilius/FullStack_Storage_and_Booking_App>
cd FullStack_Storage_and_Booking_App
```

2. Install dependencies:

```sh
npm run install-all
```

## Environment Setup

You can develop with either a local Supabase instance (recommended for development) or connect directly to your live Supabase project.

### Option 1: Local Development with Supabase CLI (Recommended)

For local development, we use Supabase CLI to run a local instance:

1. **Install Supabase CLI** (if not already installed):

```sh
npm install -g supabase
```

2. **Create local environment file**:

```sh
# In the root directory, copy the local environment template
cp .env.supabase.local.example .env.supabase.local
```

The `.env.supabase.local` file contains all the configuration for local Supabase:

```env
# Supabase Local Development Environment Variables
SUPABASE_URL="http://127.0.0.1:54321"
SUPABASE_ANON_KEY="your-local-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-local-service-role-key"
SUPABASE_JWT_SECRET="super-secret-jwt-token-with-at-least-32-characters-long"

# Backend Configuration
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5180

# Frontend Configuration
VITE_SUPABASE_URL="http://127.0.0.1:54321"
VITE_SUPABASE_ANON_KEY="your-local-anon-key"
VITE_API_URL="http://127.0.0.1:3000"

# Email Configuration (same as live)
EMAIL_FROM_NEW=your-email@gmail.com
# ... other email settings
```

3. **Start local Supabase**:

```sh
npm run s:start
```

4. **Run the application locally**:

```sh
# Start both frontend and backend with local Supabase
npm run dev:local

# Or start them separately
npm run frontend:local
npm run backend:local
```

### Option 2: Live Development with Hosted Supabase

For development against your live Supabase instance:

1. **Create environment file**:

```sh
# In the root directory
cp .env.local
```

```env
# Supabase Configuration
SUPABASE_PROJECT_ID= # Your Supabase project ID
SUPABASE_ANON_KEY= # Your Supabase anon key
SUPABASE_SERVICE_ROLE_KEY= # Your Supabase service role key
SUPABASE_URL=https://${SUPABASE_PROJECT_ID}.supabase.co

# Backend Configuration
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5180

# Frontend Configuration
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
VITE_API_URL=http://localhost:3000

# S3 Configuration
SUPABASE_STORAGE_URL=https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/s3
S3_REGION= # Your S3 region
S3_BUCKET=item-images

# EMAIL API KEY
EMAIL_FROM= # Your email address
GMAIL_CLIENT_ID= # Your Gmail client ID
GMAIL_CLIENT_SECRET= # Your Gmail client secret
GMAIL_REFRESH_TOKEN= # Your Gmail refresh token
```

2. **Run the application with live Supabase**:

```sh
# Start both frontend and backend with live Supabase
npm run dev:live

# Or start them separately
npm run frontend:live
npm run backend:live
```

## Supabase Setup

### For Live Development

1. Create a new project in Supabase Dashboard
2. Get your project URL and API keys from the project settings
3. Set up the database schema:

- Run SQL scripts from dbSetStatements in the Supabase SQL Editor
- Start with tablesCreateStatements.sql to create all tables
- Then run setUpRowLevelSecurity.sql to configure security policies

### For Local Development

When using local Supabase CLI, the database schema is automatically set up. You can use these helpful commands:

```sh
# Supabase CLI Commands
npm run s:start          # Start local Supabase
npm run s:stop           # Stop local Supabase
npm run s:restart        # Restart local Supabase
npm run s:reset          # Reset local database
npm run s:status         # Check Supabase status
npm run s:studio         # Open Supabase Studio
npm run s:pull           # Pull schema from remote
npm run s:push           # Push schema to remote
```

#### Database Migration Commands

```sh
npm run s:migration:new  # Create new migration
npm run s:migration:up   # Apply migrations
```

#### Type Generation

```sh
npm run generate:types:local  # Generate types from local DB
npm run generate:types        # Generate types from remote DB
```

## Running the Application

### Local Development (Recommended)

For local development with Supabase CLI:

```sh
# Start local Supabase first
npm run s:start

# Then start the application
npm run dev:local
```

### Live Development

For development against your hosted Supabase:

```sh
npm run dev:live
```

### Individual Components

You can also start frontend and backend separately:

```sh
# Local development
npm run frontend:local
npm run backend:local

# Live development
npm run frontend:live
npm run backend:live
```

### Legacy Command

The following still works but doesn't specify environment:

```sh
npm run dev
```

After starting:

- Frontend: <http://localhost:5180>
- Backend API: <http://localhost:3000>
- API Health Check: <http://localhost:3000/health>
- Supabase Studio (local): <http://localhost:54323> (when using local Supabase)

## Development Workflow

Frontend (React + TypeScript)

The frontend is built with:

- React with TypeScript
- Vite as the build tool
- Redux Toolkit for state management
- Shadcn/ui for UI components
- Multilingual support (English/Finnish). See [Translation Guide](./frontend/translation.md) for details.

Backend (REST API)
The backend provides:

- RESTful API endpoints
- Supabase integration
- Authentication and authorization
- Row-Level Security implementation

## Project Structure

```
project-root/
├── frontend/                # React frontend application
│   ├── public/              # Static files
│   ├── src/                 # Source code
│   │   ├── components/      # UI components
│   │   ├── store/           # Redux store
│   │   ├── translations/    # Language files
│   │   └── ...
│   └── ...
├── backend/                 # Backend API
│   ├── src/                 # Source code
│   ├── dbSetStatements/     # Database setup SQL files
│   └── ...
└── docs/                    # Documentation
```

## Azure Deployment

This application is configured for deployment to Azure:

1. Frontend: Deployed as a Static Web App
2. Backend: Deployed as an App Service
3. Database: Managed by Supabase
4. Storage: Managed by Supabase Storage
5. CI/CD: GitHub Actions for automated deployment
6. Environment Variables: Configured in Azure App Service settings and GitHub Secrets

## Common Issues & Troubleshooting

- **CORS errors**: Ensure your backend's ALLOWED_ORIGINS includes your frontend URL
- **Authentication issues**: Verify your Supabase keys are correct
- **Database connection issues**: Check your Supabase URL and keys
- **Environment variable issues**:
  - For local development, ensure `.env.supabase.local` exists and has correct values
  - For live development, ensure `.env.local` exists and has correct values
  - Check that you're using the right npm script (`dev:local` vs `dev:live`)
- **Supabase CLI issues**:
  - Run `npm run s:status` to check if local Supabase is running
  - Run `npm run s:restart` if you encounter connection issues
  - Ensure Docker is running (required for Supabase CLI)
- **Port conflicts**:
  - Frontend runs on port 5180
  - Backend runs on port 3000
  - Local Supabase runs on port 54321
  - Supabase Studio runs on port 54323
