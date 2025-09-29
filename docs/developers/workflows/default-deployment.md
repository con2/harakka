# Deployment Guide

This document outlines the process for deploying the application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
  - [Setting Environment Variables](#setting-environment-variables)
- [Deployment Configuration with YAML](#deployment-configuration-with-yaml)
  - [Backend Deployment](#backend-deployment)
  - [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Post-Deployment Verification](#post-deployment-verification)

## Prerequisites

Before deployment, ensure you have:

- **Node.js**: v20 or higher
- **Git CLI**: Installed and configured
- **Supabase Account**: Remote instance with production-ready configuration
- **Azure Account**: For managing Azure deployment

## Environment Configuration

The project uses a `.env.local` file for development.
For production deployment build stage, we use YAML configuration files rather than separate environment files. These are managed securely via CI/CD secrets in GitHub Actions. Runtime env variables are stored in Azure.

### Setting Environment Variables

- **GitHub Actions**: Add these variables to your repository's `Secrets` under **Settings > Secrets and Variables > Actions**.
- **Local Development**: Use `.env.local` files for development.

## Deployment Configuration with YAML

Our deployment configurations are maintained in YAML files.

### Backend Deployment

The backend deployment configuration is located at [Backend yaml](../../github/workflows/deployment-back.yml`)

The CI/CD pipelines are triggered automatically on:

- Push events to the `main` branch.
- Pull request events for `main`.

```yaml
   name: Deploy Backend to Azure

   permissions:
   contents: read

   on:
   push:
      branches: [main]
   workflow_dispatch:

   jobs:
   build-and-deploy:
      runs-on: ubuntu-latest

      steps:
         - uses: actions/checkout@v4

         - name: Set up Node.js
         uses: actions/setup-node@v3
         with:
            node-version: "20.x"
            cache: "npm"
            cache-dependency-path: "backend/package-lock.json"

         - name: Install common dependencies (common types folder)
         run: |
            cd common
            npm ci

         - name: Install dependencies
         run: |
            cd backend
            npm ci

         - name: Build
         run: |
            cd backend
            npm run build
         env:
            NODE_OPTIONS: "--max-old-space-size=4096"

         - name: Prepare deployment
         run: |
            cd backend
            # Create deployment package without dev dependencies
            mkdir deployment
            cp -r dist Procfile package.json package-lock.json assets config.mts deployment/
            cd deployment
            npm ci --omit=dev

         - name: Deploy to Azure Web App
         id: deploy-to-webapp
         uses: azure/webapps-deploy@v2
         with:
            app-name: "booking-app-backend"
            publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
            package: "./backend/deployment"
         env:
            SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
            SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
            SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
            ALLOWED_ORIGINS: "https://agreeable-grass-049dc8010.6.azurestaticapps.net,http://localhost:5180"
            SUPABASE_JWT_SECRET: ${{ secrets.SUPABASE_JWT_SECRET }}
            NODE_ENV: "production"
            ENV: "production"

         - name: Post-deployment verification
         if: success()
         run: |
            echo "Deployment completed, waiting for app to start..."
            sleep 15
            curl -s "https://booking-app-backend-duh9encbeme0awca.northeurope-01.azurewebsites.net/health" || echo "App may still be starting"
```

### Frontend Deployment

The frontend deployment configuration is located at [Frontend yaml](../../github/workflows/deployment-front.yml).

```yaml
   name: Azure Static Web Apps CI/CD
permissions:
  contents: read
  pull-requests: write

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
          lfs: false
      - name: Install common dependencies (common types folder)
        run: |
          cd common
          npm ci
      - name: Install front dependencies
        working-directory: ./frontend
        run: |
          rm -f package-lock.json
          npm install
      - name: Clean problematic symlinks (circular references)
        run: |
          find frontend/node_modules -type l -name "common" -delete
          find frontend/node_modules -type l -name "full-stack-booking-app" -delete
      - name: Create environment file
        run: |
          cd frontend
          echo "VITE_SUPABASE_URL=https://rcbddkhvysexkvgqpcud.supabase.co" > .env.production
          echo "VITE_SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }}" >> .env.production
          echo "VITE_API_URL=https://booking-app-backend-duh9encbeme0awca.northeurope-01.azurewebsites.net" >> .env.production

        # Build the frontend
      - name: Build frontend
        run: |
          cd frontend
          npm run build
      - name: Prepare for deployment
        run: |
          cd frontend
           # Copy staticwebapp.config.json into dist if it's not already there
           if [ ! -f dist/staticwebapp.config.json ]; then
             cp staticwebapp.config.json dist/
           fi

           # Clean up the dist folder to ensure minimum files
           echo "=== Files in dist before cleanup ==="
           find dist -type f | sort

           # Double-check file count
           echo "Final file count before deployment:"
           find dist -type f | wc -l

           # Show size of distribution
           du -sh dist

      - name: Deploy to Azure Static Web Apps
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_AGREEABLE_GRASS_049DC8010 }}
          repo_token: ${{ secrets.GITHUB_TOKEN }} # Used for Github integrations (i.e. PR comments)
          action: "upload"
          ###### Repository/Build Configurations - These values can be configured to match your app requirements. ######
          # For more information regarding Static Web App workflow configurations, please visit: https://aka.ms/swaworkflowconfig
          app_location: "/frontend/dist" # App source code path
          api_location: "" # Api source code path - optional
          output_location: "" # Built app content directory - optional
          skip_app_build: true # Set to true to skip building the app - optional
          app_build_command: "echo 'Skipping build'"
          config_file_location: "/frontend"
          ###### End of Repository/Build Configurations ######
      - name: Verify Environment Variables
        run: |
          cd frontend
          echo "Checking environment variables for troubleshooting:"
          echo "VITE_SUPABASE_URL length: ${#VITE_SUPABASE_URL}"
          echo "VITE_SUPABASE_ANON_KEY available: $(if [ -n "$VITE_SUPABASE_ANON_KEY" ]; then echo "Yes"; else echo "No"; fi)"
          echo "VITE_API_URL available: $(if [ -n "$VITE_API_URL" ]; then echo "Yes"; else echo "No"; fi)"
        env:
          VITE_SUPABASE_URL: "https://rcbddkhvysexkvgqpcud.supabase.co"
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          VITE_API_URL: https://booking-app-backend-duh9encbeme0awca.northeurope-01.azurewebsites.net

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_AGREEABLE_GRASS_049DC8010 }}
          action: "close"
          app_location: "/frontend/dist"
```

## Database Setup

The application uses a remote Supabase instance for database and authentication.

<!-- TODO: UPDATE THE LINK AFTER WE REFINE SUPABASE SETUP DOC -->

Refer to the [Supabase Setup Guide](../backend/supabase-setup.md) guide for detailed instructions on configuring your Supabase instance.

## Post-Deployment Verification

- **Backend**: Verify the health endpoint at `<backend-url>/health`.
- **Frontend**: Open the deployed frontend URL and ensure the application loads correctly.
