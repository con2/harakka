# Environment Variables Guide

## Overview

This application uses multiple environment files to manage configuration across different development and deployment scenarios. This guide explains the purpose of each file, when to use them, and how to manage secrets securely using Infisical and dotenvx.

**Environment Management Strategy:**

- **Local development**: `.env.supabase.local` for local Supabase CLI
- **Live development**: `.env.local` for testing against hosted Supabase
- **Supabase CLI configuration**: `supabase/.env.production` and `supabase/.env.preview` for linking to branches
- **Secret management**: Infisical for team secret sharing
- **Encryption**: dotenvx for encrypted OAuth credentials

## Table of Contents

- [Overview](#overview)
- [Development Environment Files](#development-environment-files)
  - [`.env.supabase.local`](#envsupabaselocal)
  - [`.env.local`](#envlocal)
- [Supabase CLI Configuration Files](#supabase-cli-configuration-files)
  - [`supabase/.env.production`](#supabaseenvproduction)
  - [`supabase/.env.preview`](#supabaseenvpreview)
- [Template & Reference Files](#template--reference-files)
  - [`.env.production.template`](#envproductiontemplate)
- [Secret Management with Infisical](#secret-management-with-infisical)
  - [Environment Mapping](#environment-mapping)
  - [Pulling Secrets from Infisical](#pulling-secrets-from-infisical)
  - [Pushing Secrets to Infisical](#pushing-secrets-to-infisical)
  - [Running Directly with Infisical](#running-directly-with-infisical)
- [Encryption with dotenvx](#encryption-with-dotenvx)
  - [How It Works](#how-it-works)
  - [Viewing Encrypted Secrets](#viewing-encrypted-secrets)
  - [Updating Encrypted Secrets](#updating-encrypted-secrets)
  - [Rotating Encryption Keys](#rotating-encryption-keys)
- [Common Workflows](#common-workflows)
  - [Starting Local Development](#starting-local-development)
  - [Testing Against Live Database](#testing-against-live-database)
  - [Syncing with Infisical](#syncing-with-infisical)
  - [Linking Supabase CLI to Projects](#linking-supabase-cli-to-projects)
  - [Updating Google OAuth Credentials](#updating-google-oauth-credentials)
- [Variable Reference](#variable-reference)
  - [Supabase Connection](#supabase-connection)
  - [Authentication](#authentication)
  - [Email Configuration](#email-configuration)
  - [Frontend (Vite)](#frontend-vite)
  - [Backend](#backend)
  - [Storage](#storage)
  - [Security](#security)
  - [Testing](#testing)
  - [Encryption (dotenvx)](#encryption-dotenvx)
- [Troubleshooting](#troubleshooting)
- [Related Documentation](#related-documentation)
- [Security Best Practices](#security-best-practices)

---

## Development Environment Files

### `.env.supabase.local`

**Purpose:** Local Supabase CLI development environment

**When to use:**

- Running the full stack locally with a local Supabase instance
- Testing database migrations locally
- Developing without internet connection to hosted database

**How to load:**

```bash
npm run dev:local              # Full stack with local Supabase
npm run s:start                # Start local Supabase
npm run frontend:local         # Frontend only
npm run backend:local          # Backend only
```

**Key variables:**

- `ENV` - Environment identifier (set to ".env.supabase.local")
- `NODE_ENV` - Node environment (development)
- `SUPABASE_PROJECT_ID` - Develop branch project ID (kpqrzaisoyxqillzpbms)
- `SUPABASE_URL` - Local Supabase URL (<http://127.0.0.1:54321>)
- `SUPABASE_ANON_KEY` - Local demo anonymous key from Supabase CLI
- `SUPABASE_SERVICE_ROLE_KEY` - Local demo service role key
- `SUPABASE_JWT_SECRET` - Local JWT secret for token verification
- `DB_URL` - Local PostgreSQL connection string
- `PORT` - Backend server port (3000)
- `ALLOWED_ORIGINS` - CORS allowed origins for local development
- `VITE_API_URL` - Frontend API endpoint (<http://127.0.0.1:3000>)
- `VITE_SUPABASE_URL` - Frontend Supabase URL (local)
- `VITE_SUPABASE_ANON_KEY` - Frontend Supabase anonymous key
- `CRON_SECRET` - Shared secret for cron endpoint protection
- `STORAGE_EMAIL` - Gmail address for sending emails
- `STORAGE_EMAIL_PASSWORD` - Gmail app password
- `GOOGLE_ENABLED` - Enable Google OAuth (true/false)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID for local dev
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` - Google OAuth for Supabase config
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` - Google OAuth secret for Supabase config

**Sync with Infisical:**

```bash
# Pull from Infisical (dev environment)
npm run infisical:sync:supabase:local

# Copy recovered file to working file
cp .env.supabase.local.recovered .env.supabase.local

# Push changes back to Infisical
npm run infisical:push:supabase:local
```

**Related documentation:** [Infisical Quickstart Guide](./infisical-quickstart.md)

---

### `.env.local`

**Purpose:** Live/hosted Supabase development environment

**When to use:**

- Testing against the production Supabase instance locally
- Debugging issues that only occur with live data
- Developing features that require production-like environment

**How to load:**

```bash
npm run dev:live               # Full stack with live Supabase
npm run frontend:live          # Frontend only
npm run backend:live           # Backend only
```

**Key variables:**

- `NODE_ENV` - Node environment (development)
- `ENV` - Environment identifier (env.local)
- `SUPABASE_URL` - Production Supabase URL (<https://rcbddkhvysexkvgqpcud.supabase.co>)
- `SUPABASE_ANON_KEY` - Production anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Production service role key (use with caution)
- `SUPABASE_JWT_SECRET` - Production JWT secret
- `SUPABASE_PROJECT_ID` - Main branch project ID (rcbddkhvysexkvgqpcud)
- `SUPABASE_PROJECT_ID_DEV` - Develop branch project ID (kpqrzaisoyxqillzpbms)
- `SUPABASE_ANON_KEY_DEV` - Develop branch anonymous key
- `SUPABASE_SERVICE_ROLE_KEY_DEV` - Develop branch service role key
- `SUPABASE_JWT_SECRET_DEV` - Develop branch JWT secret
- `SUPABASE_DB_PASSWORD` - Database password for direct connections
- `DATABASE_URL` - PostgreSQL connection string for main branch
- `DATABASE_URL_DEV` - PostgreSQL connection string for develop branch
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_ENABLED` - Enable Google OAuth
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` - Google OAuth client secret
- `GOOGLE_ENABLED` - Alternative naming for Google OAuth enable flag
- `GOOGLE_CLIENT_ID` - Alternative naming for Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Alternative naming for Google OAuth secret
- `VITE_API_URL` - Frontend API endpoint (<http://127.0.0.1:3000> for local backend)
- `VITE_SUPABASE_URL` - Frontend Supabase URL (production)
- `VITE_SUPABASE_ANON_KEY` - Frontend Supabase anonymous key
- `CRON_SECRET` - Shared secret for cron endpoint protection
- `STORAGE_EMAIL` - Gmail address for sending emails
- `STORAGE_EMAIL_PASSWORD` - Gmail app password
- `SUPABASE_STORAGE_URL` - S3-compatible storage URL
- `S3_REGION` - S3 region (eu-north-1)
- `S3_BUCKET` - S3 bucket name (item-images)
- `ALLOWED_ORIGINS` - CORS allowed origins
- `PORT` - Backend server port (3000)
- `CYPRESS_REGULAR_USER_EMAIL` - Test user email for Cypress tests
- `CYPRESS_REGULAR_USER_PASSWORD` - Test user password for Cypress tests

**Sync with Infisical:**

```bash
# Pull from Infisical (staging environment)
npm run infisical:sync:local:env

# Copy recovered file to working file
cp .env.local.recovered .env.local

# Push changes back to Infisical
npm run infisical:push:local:env
```

**Related documentation:** [Infisical Quickstart Guide](./infisical-quickstart.md)

---

## Supabase CLI Configuration Files

These files are used exclusively by the Supabase CLI to link to the correct Supabase project branch. They use dotenvx encryption for sensitive OAuth credentials.

### `supabase/.env.production`

**Purpose:** Links Supabase CLI to the **main branch** Supabase project

**When to use:**

- Pushing configuration to production Supabase project
- Pulling schema from production
- Deploying edge functions to production

**How to use:**

```bash
# Link CLI to production project
npm run s:link:prod

# Push config to production
npx @dotenvx/dotenvx run -f supabase/.env.production -- npx supabase db push
```

**Contains:**

- `DOTENV_PUBLIC_KEY_PRODUCTION` - Public key for dotenvx encryption
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` - Google OAuth client ID (plaintext)
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` - Google OAuth secret (encrypted with dotenvx)

**Encryption:**

- Uses dotenvx for encrypting sensitive values
- Private decryption keys stored in `supabase/.env.keys` (gitignored)
- Encrypted secrets have format: `encrypted:...`

**Related files:**

- `supabase/.env.keys` - Contains private decryption keys (never commit!)
- `supabase/config.toml` - References these variables with `env(...)` syntax

**Related documentation:** [Supabase dotenvx Guide](../supabase-dotenvx.md)

---

### `supabase/.env.preview`

**Purpose:** Links Supabase CLI to the **develop branch** Supabase project

**When to use:**

- Working on feature branches
- Testing migrations against develop environment
- Pushing config to develop/preview deployments

**How to use:**

```bash
# Link CLI to develop/preview project
npm run s:link:dev

# Push config to develop branch
npx @dotenvx/dotenvx run -f supabase/.env.preview -- npx supabase db push
```

**Contains:**

- `DOTENV_PUBLIC_KEY_PREVIEW` - Public key for dotenvx encryption
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` - Google OAuth client ID (plaintext)
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` - Google OAuth secret (encrypted with dotenvx)

**Encryption:**

- Uses same dotenvx encryption approach as production
- Private keys also stored in `supabase/.env.keys`

**Related documentation:** [Supabase dotenvx Guide](../supabase-dotenvx.md)

---

## Template & Reference Files

### `.env.production.template`

**Purpose:** Template for root-level production environment configuration

**Status:** Currently **not used** in actual deployment

**Note:**

- Frontend production builds dynamically generate `.env.production` in CI/CD
- See `.github/workflows/deployment-front.yml` for how production env vars are set
- Backend deployment uses Azure environment variables, not this file
- This template serves as documentation of available variables

**Variables documented:**

- Supabase configuration (URLs, keys, project ID)
- Google OAuth configuration
- Frontend build variables (VITE_*)
- Email configuration
- CORS settings
- Backend port configuration

---

## Secret Management with Infisical

[Infisical](https://infisical.com/) provides centralized, secure secret management for the team.

### Environment Mapping

- **Infisical `dev` environment** → `.env.supabase.local`
- **Infisical `staging` environment** → `.env.local`
- **Infisical `keys` environment** → `supabase/.env.keys` (dotenvx private keys)
- **Infisical `prod` environment** → Production deployment (not local file)

### Pulling Secrets from Infisical

Pull the latest secrets from Infisical to local recovery files:

```bash
# Pull individual files
npm run infisical:sync:local:env           # → .env.local.recovered
npm run infisical:sync:supabase:local      # → .env.supabase.local.recovered
npm run infisical:sync:env:keys            # → supabase/.env.keys.recovered

# Pull both main env files
npm run infisical:sync:both

# Pull all files including encryption keys
npm run infisical:sync:all
```

**⚠️ Important:** Syncing creates `.recovered` files. These are **NOT automatically used** by the application. You must manually copy or rename them to activate:

```bash
# Option 1: Copy (keeps backup of current files)
cp .env.local.recovered .env.local
cp .env.supabase.local.recovered .env.supabase.local
cp supabase/.env.keys.recovered supabase/.env.keys

# Option 2: Rename (replaces current files)
mv .env.local.recovered .env.local
mv .env.supabase.local.recovered .env.supabase.local
mv supabase/.env.keys.recovered supabase/.env.keys
```

### Pushing Secrets to Infisical

Upload local changes back to Infisical:

```bash
# Push individual files
npm run infisical:push:local:env           # .env.local → staging
npm run infisical:push:supabase:local      # .env.supabase.local → dev
npm run infisical:push:env:keys            # supabase/.env.keys → keys

# Push both main env files
npm run infisical:push:both

# Push all files including encryption keys
npm run infisical:push:all
```

### Running Directly with Infisical

Skip local files entirely and run with Infisical secrets:

```bash
npm run dev:infisical              # Full stack
npm run frontend:infisical         # Frontend only
npm run backend:infisical          # Backend only
npm run s:start:infisical          # Supabase with Infisical
```

**Benefits:**

- Always using latest secrets
- No risk of outdated local files
- No need to manually sync
- Team-wide consistency

**Setup required:** See [Infisical Quickstart Guide](./infisical-quickstart.md)

---

## Encryption with dotenvx

The Supabase configuration files use [dotenvx](https://dotenvx.com/) to encrypt sensitive OAuth secrets before committing them to the repository.

### How It Works

1. **Public/Private Key Pairs**: Each environment has a keypair
   - Public key (committed): Used to encrypt values
   - Private key (gitignored): Used to decrypt values

2. **Encrypted Values**: Stored in format `encrypted:...`

3. **Key Storage**:
   - Public keys: In the `.env.production` and `.env.preview` files
   - Private keys: In `supabase/.env.keys` (gitignored, never commit!)

### Viewing Encrypted Secrets

```bash
# Decrypt and view production secrets
npx dotenvx decrypt -f supabase/.env.production

# Decrypt and view preview secrets  
npx dotenvx decrypt -f supabase/.env.preview
```

### Updating Encrypted Secrets

To update Google OAuth credentials:

```bash
# Update production
npx @dotenvx/dotenvx set SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID "new-client-id" -f supabase/.env.production
npx @dotenvx/dotenvx set SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET "new-secret" -f supabase/.env.production

# Update preview/develop
npx @dotenvx/dotenvx set SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID "new-client-id" -f supabase/.env.preview
npx @dotenvx/dotenvx set SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET "new-secret" -f supabase/.env.preview
```

### Recovering Encryption Keys

If you're a new team member or lost your `supabase/.env.keys` file, you can recover it from Infisical:

```bash
# Step 1: Pull the encryption keys from Infisical
npm run infisical:sync:env:keys
# This creates: supabase/.env.keys.recovered

# Step 2: Copy the recovered file to the working location
cp supabase/.env.keys.recovered supabase/.env.keys

# Step 3: Verify it works by decrypting a config file
npx dotenvx decrypt -f supabase/.env.production
```

**⚠️ Important Notes:**

- The sync command creates `supabase/.env.keys.recovered` - it does NOT automatically create or overwrite `supabase/.env.keys`
- You must manually copy or rename the `.recovered` file to activate it
- The `supabase/.env.keys` file is required to decrypt the encrypted values in `supabase/.env.production` and `supabase/.env.preview`
- Without it, the Supabase CLI cannot read the Google OAuth credentials

### Rotating Encryption Keys

If keys are compromised:

```bash
# Rotate production keys
npx dotenvx rotate -f supabase/.env.production

# Rotate preview keys
npx dotenvx rotate -f supabase/.env.preview

# Push updated keys to Infisical
npm run infisical:push:env:keys
```

**Important:** After rotating, update the private keys on your Supabase project:

```bash
npx supabase secrets set --env-file supabase/.env.keys
```

**Related documentation:** [Supabase dotenvx Guide](../supabase-dotenvx.md)

---

## Common Workflows

### Starting Local Development

**With local Supabase:**

```bash
# Start local Supabase (one-time)
npm run s:start

# Run full stack
npm run dev:local
```

**With Infisical (recommended):**

```bash
npm run dev:infisical
```

**With synced files:**

```bash
# Step 1: Sync all files from Infisical (creates .recovered files)
npm run infisical:sync:all

# Step 2: Copy recovered files to activate them
cp .env.supabase.local.recovered .env.supabase.local
cp .env.local.recovered .env.local
cp supabase/.env.keys.recovered supabase/.env.keys

# Step 3: Run development environment
npm run dev:local
```

**Note:** Infisical sync commands create `.recovered` files that you must manually copy to use.

---

### Testing Against Live Database

```bash
# Option 1: With Infisical
npm run dev:infisical

# Option 2: With synced .env.local
npm run infisical:sync:local:env
cp .env.local.recovered .env.local
npm run dev:live
```

---

### Syncing with Infisical

**Pull latest secrets:**

```bash
npm run infisical:sync:both
```

**Review changes:**

```bash
diff .env.local .env.local.recovered
diff .env.supabase.local .env.supabase.local.recovered
```

**Apply changes:**

```bash
cp .env.local.recovered .env.local
cp .env.supabase.local.recovered .env.supabase.local
```

**Push local changes:**

```bash
# Edit your local .env files first, then:
npm run infisical:push:both
```

---

### Linking Supabase CLI to Projects

**Link to production (main branch):**

```bash
npm run s:link:prod
```

**Link to develop branch:**

```bash
npm run s:link:dev
```

**Verify current link:**

```bash
npx supabase status
```

---

### Updating Google OAuth Credentials

**For local development** (`.env.supabase.local` or `.env.local`):

1. Update the values directly in the files
2. Push to Infisical: `npm run infisical:push:both`

**For Supabase CLI** (`supabase/.env.production` or `supabase/.env.preview`):

1. Use dotenvx to encrypt:

   ```bash
   npx @dotenvx/dotenvx set SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET "new-secret" -f supabase/.env.production
   ```

2. Commit the encrypted file
3. Update Supabase project secrets:

   ```bash
   npx supabase secrets set --env-file supabase/.env.keys
   ```

---

## Variable Reference

### Supabase Connection

| Variable | Description | Used In |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | All environments |
| `SUPABASE_ANON_KEY` | Public anonymous key for client-side | All environments |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin key (use with caution) | Backend only |
| `SUPABASE_JWT_SECRET` | JWT signing secret | Backend auth validation |
| `SUPABASE_PROJECT_ID` | Project identifier | Configuration, DB connections |
| `DB_URL` / `DATABASE_URL` | Direct PostgreSQL connection string | Backend, migrations |

### Authentication

| Variable | Description | Used In |
|----------|-------------|---------|
| `GOOGLE_ENABLED` | Enable/disable Google OAuth | Backend, Supabase config |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Backend |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Backend |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` | Google OAuth for Supabase config | Supabase CLI |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` | Google OAuth secret for Supabase | Supabase CLI (encrypted) |

### Email Configuration

| Variable | Description | Used In |
|----------|-------------|---------|
| `STORAGE_EMAIL` | Gmail address for sending emails | Backend |
| `STORAGE_EMAIL_PASSWORD` | Gmail app password (not account password) | Backend |
| `BOOKING_ADMIN_EMAIL` | Admin email for BCC on bookings | Backend (optional) |

### Frontend (Vite)

| Variable | Description | Used In |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API endpoint | Frontend |
| `VITE_SUPABASE_URL` | Supabase URL for frontend | Frontend |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key for frontend | Frontend |

### Backend

| Variable | Description | Used In |
|----------|-------------|---------|
| `PORT` | Server port number | Backend |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowed origins | Backend |
| `NODE_ENV` | Node environment (development/production) | Backend, Frontend |

### Storage

| Variable | Description | Used In |
|----------|-------------|---------|
| `SUPABASE_STORAGE_URL` | S3-compatible storage endpoint | Backend |
| `S3_REGION` | AWS S3 region | Backend |
| `S3_BUCKET` | S3 bucket name for storage | Backend |

### Security

| Variable | Description | Used In |
|----------|-------------|---------|
| `CRON_SECRET` | Shared secret for cron endpoint protection | Backend, Scheduler |

### Testing

| Variable | Description | Used In |
|----------|-------------|---------|
| `CYPRESS_REGULAR_USER_EMAIL` | Test user email | Cypress E2E tests |
| `CYPRESS_REGULAR_USER_PASSWORD` | Test user password | Cypress E2E tests |

### Encryption (dotenvx)

| Variable | Description | Used In |
|----------|-------------|---------|
| `DOTENV_PUBLIC_KEY_PRODUCTION` | Public encryption key for production | supabase/.env.production |
| `DOTENV_PUBLIC_KEY_PREVIEW` | Public encryption key for preview | supabase/.env.preview |
| `DOTENV_PRIVATE_KEY_PRODUCTION` | Private decryption key for production | supabase/.env.keys (gitignored) |
| `DOTENV_PRIVATE_KEY_PREVIEW` | Private decryption key for preview | supabase/.env.keys (gitignored) |

---

## Troubleshooting

### "Authentication failed" with Infisical

```bash
infisical logout
infisical login
```

Select the same region as your team project.

### "SUPABASE_URL not found in environment"

Make sure you're using the correct npm script:

- `npm run dev:local` requires `.env.supabase.local`
- `npm run dev:live` requires `.env.local`
- `npm run dev:infisical` requires Infisical authentication

### "Invalid JWT token" errors

- Verify `SUPABASE_JWT_SECRET` matches your Supabase project
- Check that you're using the correct environment (local vs live)
- For local development, restart Supabase: `npm run s:restart`

### Supabase CLI can't decrypt values

1. Check that `supabase/.env.keys` exists and isn't empty
2. Verify the private keys match the public keys in `.env.production`/`.env.preview`
3. Try re-encrypting:

   ```bash
   npx dotenvx decrypt -f supabase/.env.production
   npx dotenvx encrypt -f supabase/.env.production
   ```

### Gmail emails not sending

1. Verify you're using an **App Password**, not your account password
2. Check that 2-factor authentication is enabled on your Gmail account
3. Generate a new app password if needed: [Google App Passwords](https://myaccount.google.com/apppasswords)

### CORS errors in browser

1. Check `ALLOWED_ORIGINS` includes your frontend URL
2. Verify backend is running on expected port
3. Check browser console for specific origin being blocked

### Out-of-sync secrets

```bash
# Pull latest from Infisical
npm run infisical:sync:all

# Compare with your local files
diff .env.local .env.local.recovered
diff .env.supabase.local .env.supabase.local.recovered
diff supabase/.env.keys supabase/.env.keys.recovered

# If Infisical version is newer, copy it
cp .env.local.recovered .env.local
cp .env.supabase.local.recovered .env.supabase.local
cp supabase/.env.keys.recovered supabase/.env.keys
```

### Missing encryption keys (supabase/.env.keys)

If you don't have the `supabase/.env.keys` file:

```bash
# Step 1: Pull from Infisical (creates .recovered file)
npm run infisical:sync:env:keys

# Step 2: Manually copy to working location
cp supabase/.env.keys.recovered supabase/.env.keys

# Step 3: Test that it works
npx dotenvx decrypt -f supabase/.env.production
```

**⚠️ Remember:** The sync command only creates `supabase/.env.keys.recovered`. You must manually copy it to `supabase/.env.keys` before the encryption keys will work.

This file is essential for decrypting the encrypted values in Supabase configuration files.

### Can't link Supabase CLI to project

1. Login first: `npm run s:login`
2. Verify your access permissions in Supabase dashboard
3. Check the project ID in the env file matches Supabase dashboard
4. Try linking manually:

   ```bash
   # For production
   npx @dotenvx/dotenvx run -f supabase/.env.production -- npx supabase link
   
   # For develop
   npx @dotenvx/dotenvx run -f supabase/.env.preview -- npx supabase link
   ```

---

## Related Documentation

- [Infisical Quickstart Guide](./infisical-quickstart.md) - Setting up Infisical for secret management
- [Supabase dotenvx Guide](../supabase-dotenvx.md) - Detailed dotenvx encryption guide
- [Local Development Setup](./database/supabase-local-development.md) - Complete local dev guide
- [Contribution Guide](./workflows/contribution-guide.md) - Git workflow and best practices

---

## Security Best Practices

1. **Never commit** `.env.local`, `.env.supabase.local`, or `supabase/.env.keys`
2. **Never share** service role keys publicly
3. **Use Infisical** for team secret sharing instead of chat/email
4. **Rotate secrets** if they're accidentally exposed
5. **Use app passwords** for Gmail, never your account password
6. **Review** `.gitignore` before committing to ensure env files are excluded
7. **Encrypt** sensitive values with dotenvx before committing
8. **Limit access** to Infisical production environment to trusted team members

---

**Last Updated:** January 2025
