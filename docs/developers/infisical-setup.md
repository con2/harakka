# Infisical Setup Guide

This guide will help you set up Infisical for secure environment variable management across your team, replacing the need to share `.env` files through team chat.

## Overview

Infisical provides:

- ✅ Centralized secret management
- ✅ Environment-specific configurations (dev, staging, prod)
- ✅ Team access control
- ✅ Secret versioning and audit logs
- ✅ Integration with your existing development workflow

## Prerequisites

1. **Install Infisical CLI** (if not already installed):

```bash
# Using npm
npm install -g @infisical/cli

# Or using curl
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install -y infisical
```

2. **Create an Infisical account** at [https://app.infisical.com](https://app.infisical.com)

## Initial Setup (Project Admin Only)

### 1. Authenticate with Infisical

```bash
infisical login
```

### 2. Initialize the Project (Already Done ✅)

The project is already initialized with workspace ID: `9315c153-c963-4fb7-9650-adc624a91eb1`

### 3. Configure Environment Mappings

```bash
# Set up branch-to-environment mapping
infisical run --env=development -- echo "Setting up development environment"
infisical run --env=staging -- echo "Setting up staging environment"  
infisical run --env=production -- echo "Setting up production environment"
```

## Team Member Setup

### 1. Authenticate

```bash
infisical login
```

### 2. Navigate to project directory

```bash
cd /path/to/FullStack_Storage_and_Booking_App
```

### 3. Verify connection

```bash
infisical secrets --env=development
```

## Environment Structure

We'll organize secrets by environment:

- **development**: For local development
- **staging**: For preview/staging deployments  
- **production**: For production deployments

## Migrating Current Environment Variables

### Upload secrets from existing .env files

```bash
# Upload development secrets
infisical secrets set --env=development --from-file=.env.local

# Upload production secrets (when ready)
infisical secrets set --env=production --from-file=.env.production
```

### Manual secret upload

```bash
# Set individual secrets
infisical secrets set SUPABASE_URL "https://your-project.supabase.co" --env=development
infisical secrets set SUPABASE_ANON_KEY "your-anon-key" --env=development
infisical secrets set SUPABASE_SERVICE_ROLE_KEY "your-service-key" --env=development
```

## Updated Development Workflow

### 1. Running the Application with Infisical

Replace your current npm scripts with Infisical-powered versions:

**Frontend (local development):**

```bash
# Instead of: npm run frontend:local
infisical run --env=development -- npm --prefix frontend run dev
```

**Backend (local development):**

```bash
# Instead of: npm run backend:local  
infisical run --env=development -- npm --prefix backend run start:watch
```

**Full application:**

```bash
# Instead of: npm run dev:local
infisical run --env=development -- npm run dev
```

**Supabase commands:**

```bash
# Instead of: npm run s:start
infisical run --env=development -- npx supabase start

# Instead of: npm run s:reset
infisical run --env=development -- npx supabase db reset
```

### 2. Updated NPM Scripts

Add these to your `package.json` scripts section:

```json
{
  "scripts": {
    "dev:infisical": "infisical run --env=development -- npm run dev",
    "frontend:infisical": "infisical run --env=development -- npm --prefix frontend run dev",
    "backend:infisical": "infisical run --env=development -- npm --prefix backend run start:watch",
    "s:start:infisical": "infisical run --env=development -- npx supabase start",
    "s:reset:infisical": "infisical run --env=development -- npx supabase db reset"
  }
}
```

## Environment Variables to Migrate

Based on your current `.env.local.template`, these are the key variables to upload to Infisical:

### Core Supabase Configuration

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `SUPABASE_PROJECT_ID`

### Frontend Configuration

- `VITE_API_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Email Configuration

- `EMAIL_FROM_2`
- `GMAIL_APP_PASSWORD`
- `BOOKING_ADMIN_EMAIL`

### OAuth Configuration

- `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`

### Development Configuration

- `NODE_ENV`
- `PORT`
- `ALLOWED_ORIGINS`

## Team Access Management

### Invite Team Members (Project Admin)

1. Go to [Infisical Dashboard](https://app.infisical.com)
2. Navigate to your project
3. Go to "Access Control" → "Members"
4. Invite team members by email
5. Assign appropriate roles:
   - **Admin**: Can manage all secrets and settings
   - **Developer**: Can read/write development secrets
   - **Viewer**: Can only read assigned secrets

### Role-based Access Example

```bash
# Developers can access development environment
# Only DevOps/Leads can access production environment
```

## Security Benefits

1. **No more .env files in chat**: All secrets are centrally managed
2. **Access control**: Team members only see what they need
3. **Audit logs**: Track who accessed/changed what secrets
4. **Secret rotation**: Easy to update secrets across environments
5. **Git safety**: No risk of committing sensitive data

## Troubleshooting

### Common Issues

**Authentication failed:**

```bash
infisical logout
infisical login
```

**Missing secrets:**

```bash
# Check what secrets are available
infisical secrets list --env=development
```

**Permission denied:**

- Contact project admin to check your role
- Verify you're invited to the correct project

### Fallback Options

During transition, you can still use traditional .env files:

```bash
# Traditional way (temporary)
npm run dev:local

# Infisical way (preferred)
npm run dev:infisical
```

## Migration Checklist

- [ ] All team members authenticated with Infisical
- [ ] Development secrets uploaded to Infisical
- [ ] Team tested running app with `infisical run`
- [ ] Production secrets uploaded (when ready)
- [ ] Updated CI/CD to use Infisical
- [ ] Removed .env files from team chat
- [ ] Updated documentation with new commands

## Next Steps

1. **Phase 1**: Start with development environment
2. **Phase 2**: Add staging/preview environment for branches
3. **Phase 3**: Migrate production secrets
4. **Phase 4**: Update CI/CD pipelines
5. **Phase 5**: Remove local .env files (keep templates only)
