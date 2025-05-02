# Use Azure and GitHubActions for deployment

## Architecture Overview

Our application consists of:

- Frontend: React/Vite application hosted on Azure Static Web Apps
- Backend: NestJS API running on Azure Web App Service
- Database: Supabase for data storage and authentication

## Environment Variables

### Required Secrets in GitHub

Secret Name, Description:
AZURE_STATIC_WEB_APPS_API_TOKEN_AGREEABLE_GRASS_049DC8010 Token for Azure Static Web App deployment
AZURE_WEBAPP_PUBLISH_PROFILE Publish profile for Azure Web App backend
SUPABASE_URL URL to your Supabase instance
SUPABASE_ANON_KEY Anonymous key for Supabase client-side operations
SUPABASE_SERVICE_ROLE_KEY Service key for backend Supabase operations

## CI/CD Workflow

Our deployment uses GitHub Actions with two workflows:

- Frontend workflow: deployment-front.yml
- Backend workflow: deployment-back.yml

Both workflows are triggered on pushes to the deployment branch.

## Application URLs

- Frontend: https://agreeable-grass-049dc8010.6.azurestaticapps.net
- Backend: https://booking-app-backend-duh9encbeme0awca.northeurope-01.azurewebsites.net
- Backend Health Check: https://booking-app-backend-duh9encbeme0awca.northeurope-01.azurewebsites.net/health
