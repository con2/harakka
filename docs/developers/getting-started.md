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

1. Create environment file:

```sh
# In the root directory
cp .env.local
```

```
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

## Supabase Setup

1. Create a new project in Supabase Dashboard
2. Get your project URL and API keys from the project settings
3. Set up the database schema:

- Run SQL scripts from dbSetStatements in the Supabase SQL Editor
- Start with tablesCreateStatements.sql to create all tables
- Then run setUpRowLevelSecurity.sql to configure security policies

## Running the Application

You can run both frontend and backend simultaneously using the following command:

```sh
npm run dev
```

After starting:

- Frontend: ([Front](http://localhost:5173) )
- Backend API: ([Back](http://localhost:3000))
- API Health Check: ([Health] (http://localhost:3000/health))

## Development Workflow

Frontend (React + TypeScript)

The frontend is built with:

- React with TypeScript
- Vite as the build tool
- Redux Toolkit for state management
- Shadcn/ui for UI components
- Multilingual support (English/Finnish)

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

- CORS errors: Ensure your backend's ALLOWED_ORIGINS includes your frontend URL
- Authentication issues: Verify your Supabase keys are correct
- Database connection issues: Check your Supabase URL and keys
