# Deployment Guide

This document outlines the process for deploying the application.

## Overview

This guide documents production deployment of the Harakka application to Azure.

| Layer     | Stack        | Azure Resource                            |
| --------- | ------------ | ----------------------------------------- |
| Frontend  | React + Vite | Static Web App `booking-app-frontend`     |
| Backend   | NestJS API   | App Service (Linux) `booking-app-backend` |
| Data/Auth | Supabase     | Managed PostgreSQL + Auth                 |

GitHub Actions workflows orchestrate deployments:

- **Backend** – `.github/workflows/deployment-back.yml`
- **Frontend** – `.github/workflows/deployment-front.yml`

## Azure Resource Configuration

> **Note**: For detailed step-by-step instructions on creating these Azure resources with screenshots, refer to the [Azure Resource Setup Guide](./Azure-instances-creation.md).

### Backend – App Service (Linux)

- Plan: Basic SKU, 1 worker, AlwaysOn disabled
- Runtime: `NODE|20-lts`
- HTTPS enforced; client certificates required.
- Linked Application Insights: `booking-app-backend`
- Health endpoint: `/health`
- SSH enabled for diagnostics.
- Slots currently **not** configured.

### Frontend – Static Web App

- SKU: Standard
- Default hostname: `agreeable-grass-049dc8010.6.azurestaticapps.net`
- Deployment token auth with GitHub-integrated CI.
- Staging environments enabled (per Pull Request).
- Custom domains not configured.

## Prerequisites

1. **Accounts & Access**
   - Azure subscription with Contributor rights to the target resources.
   - GitHub repository access with permission to manage Actions secrets and environments.
2. **Tooling**

   - Node.js ≥ 20 (local verification).
   - Git CLI.
   - Azure CLI (optional for manual verification).
   - Postman or similar for endpoint testing.

3. **Supabase**

- Production Supabase URL, anon key, service role key, and JWT secret.

4. **Azure Resources**

- Resource Group, App Service, and Static Web App configured as described in the [Azure Resource Setup Guide](./Azure-instances-creation.md).

## Secrets & Configuration

The project uses a `.env.local` file for development.
For production deployment build stage, we use YAML configuration files rather than separate environment files. These are managed securely via CI/CD secrets in GitHub Actions. Runtime env variables are stored in Azure.

| Secret                                                      | Location                                         | Used By           | Purpose                            |
| ----------------------------------------------------------- | ------------------------------------------------ | ----------------- | ---------------------------------- |
| `AZURE_WEBAPP_PUBLISH_PROFILE`                              | GitHub Secrets                                   | Backend workflow  | App Service deployment credentials |
| `SUPABASE_URL`                                              | GitHub Secrets → App Service                     | Backend           | DB endpoint                        |
| `SUPABASE_SERVICE_ROLE_KEY`                                 | GitHub Secrets → App Service                     | Backend           | Service role key                   |
| `SUPABASE_ANON_KEY`                                         | GitHub Secrets → App Service & Static Web App    | Both              | Public key                         |
| `SUPABASE_JWT_SECRET`                                       | GitHub Secrets → App Service                     | Backend           | JWT signing                        |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_AGREEABLE_GRASS_049DC8010` | GitHub Secrets                                   | Frontend workflow | Static Web App deployment token    |
| `VITE_API_URL`                                              | Static Web App configuration (`.env.production`) | Frontend          | Backend base URL                   |
| `ALLOWED_ORIGINS`                                           | App Service app settings                         | Backend           | CORS whitelist                     |

### Setting Environment Variables

- **GitHub Actions**: Add these variables to your repository's `Secrets` under **Settings > Secrets and Variables > Actions**.
- **Local Development**: Use `.env.local` files for development.

## CI/CD Workflow Details

### Backend – `deployment-back.yml`

1. Trigger: push to `main` or manual dispatch.
2. Steps:
   - Checkout repo.
   - Setup Node 20 with npm cache.
   - Install `common` package types, then backend dependencies (`npm ci`).
   - Build (`npm run build`) with increased memory limit.
   - Stage deployment bundle without dev dependencies.
   - Deploy via `azure/webapps-deploy@v2` using publish profile.
   - Inject runtime variables during deployment.
   - Post-deploy health check (`curl /health`).

> Ensure corresponding App Service **Configuration > Application settings** contains the same env variables as the workflow to keep runtime and redeploy parity.

### Frontend – `deployment-front.yml`

1. Trigger: push to `main` and PR lifecycle.
2. Steps:
   - Checkout with submodules.
   - Install shared `common` package and frontend deps (`npm install` after removing stale lock file).
   - Remove circular symlinks that confuse `npm`.

- Generate `.env.production` with Supabase + API vars.
- Build Vite app.
- Ensure `staticwebapp.config.json` is copied into `dist`.
- Deploy prebuilt artifacts with `Azure/static-web-apps-deploy@v1` (`skip_app_build: true`).
- Run env variable diagnostics.

PR builds provision staging environments automatically; closing the PR triggers cleanup.

## Deployment Procedure

1. Merge changes into `main`.
2. Monitor GitHub Actions for both workflows:
   - Backend job `azure/webapps-deploy@v2`.
   - Frontend job `Azure/static-web-apps-deploy@v1`.
3. Confirm backend availability:

   ```bash
   curl -sf https://<backend>/health
   ```

4. Validate frontend at `https://agreeable-grass-049dc8010.6.azurestaticapps.net`.
5. Check Azure Portal:
   - App Service → Deployment Center for latest deployment.
   - Static Web App → Environments for production status.
   - Application Insights → Failures/Live Metrics for backend health.

## Environment Management

- Keep development `.env.local` separate; never commit secrets.
- For staging/preview:
  - GitHub PRs automatically build frontend preview via Static Web Apps.
  - Backend previews require manual process (consider deployment slots).

## Troubleshooting

| Symptom                            | Likely Cause                                   | Resolution                                                 |
| ---------------------------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| Backend returns 500                | Missing env vars or Supabase outage            | Verify App Service settings and Supabase status            |
| Frontend build fails in CI         | Cached lock file or dependency mismatch        | Re-run with cleared cache, validate `common` package       |
| Frontend loads but API unavailable | `VITE_API_URL` incorrect or backend down       | Confirm Static Web App configuration, check `/health`      |
| Supabase auth failures             | Key rotated without redeploy                   | Update GitHub secrets and redeploy both services           |
| PR staging not created             | Missing deployment token or action permissions | Re-issue Static Web App token, ensure workflow permissions |

## Database Setup

The application uses a remote Supabase instance for database and authentication.
