# Supabase dotenvx Encryption Guide

## Overview

This guide explains how we use [dotenvx](https://dotenvx.com/) to encrypt sensitive Google OAuth credentials in our Supabase configuration files. By encrypting these values, we can safely commit them to the repository without exposing secrets, while still allowing the Supabase CLI and CI/CD pipelines to decrypt and use them.

## Why dotenvx?

- **Safe commits** - Encrypted secrets can be committed to git
- **Branch-specific configs** - Different OAuth credentials for production vs develop branches
- **No plaintext leaks** - Secrets never appear in plaintext in the repository
- **Easy rotation** - Simple commands to update or rotate encrypted values

## How It Works

### Public/Private Key Pairs

dotenvx uses asymmetric encryption with public/private key pairs:

- **Public key** (committed): Used to encrypt values, stored in `.env.production` and `.env.preview`
- **Private key** (gitignored): Used to decrypt values, stored in `supabase/.env.keys`

Each environment (production and preview) has its own key pair.

### Encryption Format

Encrypted values use the format:

```bash
VARIABLE_NAME="encrypted:BkKLX8..."
```

The Supabase CLI and dotenvx automatically decrypt these when needed.

### Key Storage

```bash
supabase/
├── .env.production       # Committed - Contains encrypted Google OAuth + public key
├── .env.preview          # Committed - Contains encrypted OAuth for develop branch + public key
└── .env.keys             # Gitignored - Contains private decryption keys
```

**Important:** `supabase/.env.keys` is backed up in Infisical (`keys` environment) for team access.

---

## Setup & Installation

### Prerequisites

- Node.js and npm installed
- Supabase CLI installed
- Access to the team's Infisical account (for key recovery)

### Installing dotenvx

dotenvx is already in the project dependencies. To use it directly:

```bash
# Already installed via package.json
npx @dotenvx/dotenvx --version
```

---

## Environment Files

### `supabase/.env.production`

**Purpose:** Contains encrypted Google OAuth credentials for the **main branch** Supabase project.

**Contains:**

- `DOTENV_PUBLIC_KEY_PRODUCTION` - Public encryption key
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` - Google OAuth client ID (plaintext)
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` - Google OAuth secret (encrypted)

**Status:** Committed to repository

### `supabase/.env.preview`

**Purpose:** Contains encrypted Google OAuth credentials for the **develop branch** Supabase project.

**Contains:**

- `DOTENV_PUBLIC_KEY_PREVIEW` - Public encryption key
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` - Google OAuth client ID (plaintext)
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` - Google OAuth secret (encrypted)

**Status:** Committed to repository

### `supabase/.env.keys`

**Purpose:** Contains private decryption keys for both production and preview environments.

**Contains:**

- `DOTENV_PRIVATE_KEY_PRODUCTION` - Private key for decrypting production secrets
- `DOTENV_PRIVATE_KEY_PREVIEW` - Private key for decrypting preview secrets

**Status:**

- Gitignored (never commit!)
- Backed up in Infisical (`keys` environment)
- Required for Supabase CLI operations

---

## Working with Encrypted Secrets

### Viewing Encrypted Values

To see the decrypted values:

```bash
# View production secrets
npx dotenvx decrypt -f supabase/.env.production

# View preview secrets
npx dotenvx decrypt -f supabase/.env.preview
```

### Adding or Updating Secrets

Use the `set` command to add or update encrypted values:

```bash
# Update production Google OAuth
npx @dotenvx/dotenvx set SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID "your-client-id" -f supabase/.env.production
npx @dotenvx/dotenvx set SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET "your-secret" -f supabase/.env.production

# Update preview/develop Google OAuth
npx @dotenvx/dotenvx set SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID "your-client-id" -f supabase/.env.preview
npx @dotenvx/dotenvx set SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET "your-secret" -f supabase/.env.preview
```

After updating, commit the modified `.env.production` or `.env.preview` file.

### Rotating Encryption Keys

If keys are compromised or need rotation:

```bash
# Rotate production keys
npx dotenvx rotate -f supabase/.env.production

# Rotate preview keys
npx dotenvx rotate -f supabase/.env.preview

# Push updated keys to Infisical for team access
npm run infisical:push:env:keys

# Upload new keys to Supabase projects
npx supabase secrets set --env-file supabase/.env.keys
```

### Recovering Keys from Infisical

If you're a new team member or lost your `supabase/.env.keys` file:

```bash
# Pull encryption keys from Infisical
npm run infisical:sync:env:keys

# Copy to working location
cp supabase/.env.keys.recovered supabase/.env.keys

# Verify it works
npx dotenvx decrypt -f supabase/.env.production
```

See the [Environment Variables Guide](./developers/environment-variables.md#recovering-encryption-keys) for more details.

---

## Supabase CLI Integration

### How config.toml References Encrypted Values

The `supabase/config.toml` file references environment variables using the `env()` function:

```toml
[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"
```

When the Supabase CLI runs with dotenvx, it:

1. Loads the appropriate `.env.production` or `.env.preview` file
2. Uses `supabase/.env.keys` to decrypt encrypted values
3. Provides decrypted values to the CLI

### Linking to Supabase Projects

Link your local Supabase CLI to the correct project:

```bash
# Link to production (main branch)
npm run s:link:prod

# Link to develop branch
npm run s:link:dev

# Verify link
npx supabase status
```

These commands automatically use dotenvx to decrypt the credentials.

### Uploading Keys to Supabase Projects

For Supabase's branching system to decrypt values during preview builds, upload the private keys to each project:

```bash
# First, link to the project
npm run s:link:prod  # or s:link:dev

# Then upload the decryption keys
npm run s:secrets:upload

# Or manually:
npx supabase secrets set --env-file supabase/.env.keys
```

**Do this once per Supabase project** (both production and develop branches).

---

## Common Operations

### Setting Up a New OAuth Provider

When adding Google OAuth or updating credentials:

#### Step 1: Update the encrypted files

```bash
# For production
npx @dotenvx/dotenvx set SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID "new-client-id" -f supabase/.env.production
npx @dotenvx/dotenvx set SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET "new-secret" -f supabase/.env.production

# For preview/develop
npx @dotenvx/dotenvx set SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID "preview-client-id" -f supabase/.env.preview
npx @dotenvx/dotenvx set SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET "preview-secret" -f supabase/.env.preview
```

#### Step 2: Commit the changes

```bash
git add supabase/.env.production supabase/.env.preview
git commit -m "Update Google OAuth credentials"
git push
```

#### Step 3: Upload keys to Supabase projects

```bash
# Link to production and upload
npm run s:link:prod
npm run s:secrets:upload

# Link to develop and upload
npm run s:link:dev
npm run s:secrets:upload
```

#### Step 4: Backup keys to Infisical (if not already done)

```bash
npm run infisical:push:env:keys
```

### Pushing Configuration Changes

When pushing Supabase configuration changes:

```bash
# For production (manual push)
npx @dotenvx/dotenvx run -f supabase/.env.production -- npx supabase db push

# For develop (manual push)
npx @dotenvx/dotenvx run -f supabase/.env.preview -- npx supabase db push
```

### Testing Decryption Locally

Verify your keys can decrypt the values:

```bash
# Test production decryption
npx @dotenvx/dotenvx run -f supabase/.env.production -- env | grep SUPABASE_AUTH

# Test preview decryption
npx @dotenvx/dotenvx run -f supabase/.env.preview -- env | grep SUPABASE_AUTH
```

---

## Troubleshooting

### "DOTENV_PRIVATE_KEY is missing" Error

The Supabase CLI can't find the decryption keys.

**Solution:**

```bash
# Check if .env.keys exists
ls supabase/.env.keys

# If missing, recover from Infisical
npm run infisical:sync:env:keys
cp supabase/.env.keys.recovered supabase/.env.keys
```

### "Failed to decrypt" Error

The private key doesn't match the public key used for encryption.

**Solutions:**

1. Verify you have the latest `.env.keys` file:

   ```bash
   npm run infisical:sync:env:keys
   cp supabase/.env.keys.recovered supabase/.env.keys
   ```

2. Check if keys need rotation:

   ```bash
   npx dotenvx decrypt -f supabase/.env.production
   ```

3. If keys are mismatched, you may need to re-encrypt with the correct key pair.

### Config Shows "env(VARIABLE) is unset"

Supabase CLI warns that environment variables are unset.

**Solution:**

```bash
# Ensure you're running commands with dotenvx
npx @dotenvx/dotenvx run -f supabase/.env.production -- npx supabase <command>

# Or use the npm scripts which include dotenvx:
npm run s:link:prod
```

### Supabase Branching Can't Decrypt in CI/CD

Preview branches fail to build because they can't decrypt secrets.

**Solution:** Ensure the private keys are uploaded to the Supabase project:

```bash
# Link to the develop project
npm run s:link:dev

# Upload keys
npm run s:secrets:upload
```

The Supabase branching executor needs these keys to decrypt `.env.preview` during builds.

### Values Appear as "encrypted:..." in Logs

The encrypted string is being used directly instead of being decrypted.

**Solution:** Make sure dotenvx is wrapping the command:

```bash
# ❌ Wrong - skips decryption
npx supabase link

# ✅ Correct - includes decryption
npx @dotenvx/dotenvx run -f supabase/.env.production -- npx supabase link

# ✅ Or use npm scripts
npm run s:link:prod
```

---

## Security Best Practices

1. **Never commit `supabase/.env.keys`** - This file contains private decryption keys
2. **Backup keys in Infisical** - Use `npm run infisical:push:env:keys` after generating new keys
3. **Rotate keys if exposed** - Use `npx dotenvx rotate` immediately if keys are compromised
4. **Use different credentials** - Production and preview should use separate OAuth applications
5. **Verify before committing** - Always test decryption before pushing encrypted files
6. **Limit key access** - Only trusted team members should have access to Infisical `keys` environment

---

## Related Documentation

- [Environment Variables Guide](./developers/environment-variables.md) - Complete environment setup
- [Infisical Quickstart](./developers/infisical-quickstart.md) - Secret management setup
- [dotenvx Official Docs](https://dotenvx.com/docs) - Full dotenvx documentation
- [Supabase CLI Reference](https://supabase.com/docs/guides/cli) - Supabase CLI commands

---

**Last Updated:** January 2025
