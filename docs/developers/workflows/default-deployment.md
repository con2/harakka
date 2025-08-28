# Deployment Guide

This document outlines the process for deploying the Storage and Booking Application to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [CI/CD Options](#cicd-options)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deployment, ensure you have:

- Node.js (v18 or higher)
- Access to Supabase project
- Access to hosting platform accounts (Vercel/Netlify/Heroku/etc.)
- AWS credentials (if using S3 for storage)
- Git CLI installed

## Environment Configuration

The project uses a `.env.local` file for development. For production deployment, we use YAML configuration files in our deployment branch rather than separate environment files.

### Deployment Configuration with YAML

1. Our deployment configurations are maintained in a separate branch containing YAML files for different environments.

2. Example deployment YAML structure:

```yaml
# Example deployment configuration
version: "1.0"
environment:
  # Supabase Configuration
  SUPABASE_PROJECT_ID: production-project-id
  SUPABASE_ANON_KEY: production-anon-key
  SUPABASE_SERVICE_ROLE_KEY: production-service-role-key
  SUPABASE_URL: https://production-project-id.supabase.co

  # Backend Configuration
  PORT: 3000
  NODE_ENV: production
  ALLOWED_ORIGINS: https://production-domain.com

  # Frontend Configuration
  VITE_SUPABASE_URL: https://production-project-id.supabase.co
  VITE_SUPABASE_ANON_KEY: production-anon-key
  VITE_API_URL: https://api.production-domain.com

  # S3 Configuration
  SUPABASE_STORAGE_URL: https://production-project-id.supabase.co/storage/v1/s3
  S3_REGION: eu-north-1
  S3_BUCKET: production-item-images

  # Email Configuration
  EMAIL_FROM: noreply@production-domain.com
  GMAIL_CLIENT_ID: production-client-id
  GMAIL_CLIENT_SECRET: production-client-secret
  GMAIL_REFRESH_TOKEN: production-refresh-token
```

3. For security, sensitive values in YAML files should be replaced with environment variables or secrets in your CI/CD pipeline:

```yaml
# Example with CI/CD secrets
SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
GMAIL_CLIENT_SECRET: ${GMAIL_CLIENT_SECRET}
```

### Platform-specific Environment Configuration

When deploying to specific platforms, you'll need to configure environment variables in their respective dashboards:

#### Backend (Heroku example):

```bash
# Set Heroku environment variables
heroku config:set SUPABASE_PROJECT_ID=production-project-id
heroku config:set SUPABASE_ANON_KEY=production-anon-key
heroku config:set SUPABASE_SERVICE_ROLE_KEY=production-service-role-key
# Set remaining backend variables
```

#### Frontend (Vercel example):

```bash
# Set Vercel environment variables
vercel env add VITE_SUPABASE_URL https://production-project-id.supabase.co
vercel env add VITE_SUPABASE_ANON_KEY production-anon-key
vercel env add VITE_API_URL https://api.production-domain.com
```

## Backend Deployment

### Build the Backend

```bash
cd backend
npm install
npm run build
```

### Option 1: Deploy to Heroku

1. Install Heroku CLI and login

   ```bash
   npm install -g heroku
   heroku login
   ```

2. Create a Heroku app

   ```bash
   heroku create your-app-name
   ```

3. Set environment variables

   ```bash
   heroku config:set SUPABASE_URL=https://your-production-supabase-instance.supabase.co
   heroku config:set SUPABASE_SERVICE_KEY=your-service-key
   # Set all other environment variables
   ```

4. Deploy to Heroku
   ```bash
   git push heroku main
   ```

### Option 2: Deploy to AWS EC2

1. Create and configure EC2 instance
2. Install Node.js
3. Clone repository
4. Set up environment variables
5. Build the application
6. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start dist/main.js --name "booking-app-backend"
   pm2 startup
   pm2 save
   ```

### Option 3: Deploy to Azure App Service

1. Create an App Service:

   ```bash
   az group create --name booking-app-rg --location westeurope
   az appservice plan create --name booking-app-plan --resource-group booking-app-rg --sku B1
   az webapp create --name your-backend-name --resource-group booking-app-rg --plan booking-app-plan --runtime "NODE:18-lts"
   ```

2. Configure environment variables:

   ```bash
   az webapp config appsettings set --name your-backend-name --resource-group booking-app-rg --settings \
     SUPABASE_PROJECT_ID="your-production-project-id" \
     SUPABASE_URL="https://your-production-project-id.supabase.co" \
     SUPABASE_ANON_KEY="your-production-anon-key" \
     NODE_ENV="production"
   ```

3. Deploy code:
   ```bash
   az webapp deployment source config-local-git --name your-backend-name --resource-group booking-app-rg
   git remote add azure <git-url-from-previous-command>
   git push azure main
   ```

### Option 4: Use Docker

1. Build Docker image:

   ```bash
   docker build -t booking-app-backend .
   ```

2. Run container:
   ```bash
   docker run -d -p 3000:3000 --env-file .env.production --name booking-app-backend booking-app-backend
   ```

## Frontend Deployment

### Build the Frontend

```bash
cd frontend
npm install
npm run build
```

### Option 1: Deploy to Vercel

1. Install Vercel CLI

   ```bash
   npm install -g vercel
   vercel login
   ```

2. Deploy to Vercel
   ```bash
   vercel --prod
   ```

### Option 2: Deploy to Netlify

1. Install Netlify CLI

   ```bash
   npm install -g netlify-cli
   netlify login
   ```

2. Deploy to Netlify
   ```bash
   netlify deploy --prod
   ```

### Option 3: Deploy to Azure Static Web Apps

1. Install Azure Static Web Apps CLI:

   ```bash
   npm install -g @azure/static-web-apps-cli
   ```

2. Deploy to Azure:
   ```bash
   swa deploy ./frontend/dist --env production --api-location ./backend/dist
   ```

### Option 4: Serve from Nginx

1. Copy the build folder to your server
2. Configure Nginx to serve the static files:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/html/booking-app/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Database Setup

### Supabase Production Setup

1. Create a production project in Supabase
2. Run migration scripts to set up schema
3. Configure Row-Level Security (RLS) policies
4. Set up database triggers for notifications
5. Enable required extensions (e.g., pg_net)

```sql
-- Example: Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Set up audit log triggers
CREATE TRIGGER after_insert_send_welcome_email
AFTER INSERT ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION notify_user_created();
```

## CI/CD Options

### GitHub Actions

Create `.github/workflows/deploy.yml` to use YAML configuration:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # Checkout deployment configuration branch to access YAML files
      - name: Checkout deployment config
        run: |
          git fetch origin deployment-config
          git checkout deployment-config -- deployment/production.yml

      # Parse YAML and set environment variables
      - name: Set environment from YAML
        uses: mikefarah/yq@master
        with:
          cmd: yq eval '.environment | to_entries | .[] | .key + "=" + .value' deployment/production.yml >> $GITHUB_ENV

      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18.x"

      - name: Install backend dependencies
        run: cd backend && npm ci

      - name: Build backend
        run: cd backend && npm run build

      # Deploy steps continue...

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # Similar config for frontend
      # ...

      - name: Install frontend dependencies
        run: cd frontend && npm ci

      - name: Build frontend
        run: cd frontend && npm run build

      # Deploy steps continue...
```

## Monitoring and Maintenance

### Backend Monitoring

1. Implement health check endpoints
2. Set up application logging to a service like CloudWatch or Loggly
3. Configure alerts for critical errors
4. Use PM2 monitoring for Node.js:
   ```bash
   pm2 monit
   ```

### Frontend Monitoring

1. Set up error tracking with Sentry
2. Implement analytics (Google Analytics, Mixpanel, etc.)
3. Configure performance monitoring with Lighthouse CI

### Database Monitoring

1. Configure Supabase monitoring
2. Set up regular database backups
3. Monitor database performance metrics

## Troubleshooting

### Common Issues

1. **Connectivity Issues**

   - Check network configurations
   - Verify firewall settings
   - Test API endpoints with Postman or curl

2. **Authentication Problems**

   - Verify Supabase connection keys
   - Check JWT token configuration
   - Review RLS policies

3. **Performance Issues**

   - Review database query performance
   - Check frontend bundle size
   - Monitor server resources (CPU, memory)

4. **Email Delivery Problems**
   - Verify SMTP settings
   - Check SPF and DKIM records
   - Review email templates

### Logging

Ensure proper logging is implemented throughout the application to assist with debugging:

```typescript
// Backend logging example using LogsService
import { logError } from "../utils/logging";

try {
  // Operation
} catch (error) {
  logError(logsService, "Failed to process operation", "OrderService", error);
}
```

### Rollback Procedures

In case of failed deployments:

1. For Heroku:

   ```bash
   heroku rollback
   ```

2. For Vercel:

   ```bash
   vercel rollback
   ```

3. Manual rollback - deploy previous stable version:
   ```bash
   git checkout [previous-stable-tag]
   # Follow deployment steps again
   ```

### Security Considerations

1. **Never commit sensitive credentials to your repository:**

   - Store sensitive values in GitHub Secrets or your CI/CD platform's secure storage
   - Use environment variables in your deployment YAML files

2. **Rotate credentials regularly:**

   - Update API keys, service keys, and tokens periodically
   - Use shorter expiration times for temporary credentials

3. **Use least privilege principle:**
   - Production deployments should use limited-permission service accounts
   - Separate permissions for development and production environments
