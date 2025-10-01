# Supabase Local Development Guide

This guide focuses on local Supabase (Docker + CLI). For branching, migrations, and the GitHub integration, use the canonical guide: docs/developers/Supabase.md.

This guide covers setting up the Supabase CLI for team development, including installation and local development workflow.

## Table of contents

1. [Sources](#sources)
2. [Prerequisites](#prerequisites)
3. Installation
   - [Docker](#docker-installation)
   - [Supabase CLI](#cli-installation)
4. [Commands](#commands)
5. [Project setup](#project-setup)
6. [Local Development](#local-development)

## Sources

[Official Documentation](https://supabase.com/docs/reference/cli/start)  
[Local Branching YT video](https://www.youtube.com/watch?v=N0Wb85m3YMI)

## Prerequisites

Make sure you have the following things:

1. **[Installed Docker](#docker-installation)**
2. **[Installed Supabase CLI](#cli-installation)**
3. **The supabase DB password/env vars** - Ask a fellow developer

## Docker Installation

To use the supabase CLI, make sure you have installed docker prior.  

- [Install for Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
- [Install for mac](https://docs.docker.com/desktop/setup/install/mac-install/)  

After installing, make sure to configure docker in the settings:

For windows:
![docker-settings-windows](https://supabase.com/docs/_next/image?url=%2Fdocs%2Fimg%2Fguides%2Fcli%2Fdocker-win.png&w=3840&q=75)

For mac:
![docker-settings-mac](https://supabase.com/docs/_next/image?url=%2Fdocs%2Fimg%2Fguides%2Fcli%2Fdocker-mac.png&w=3840&q=75)

## CLI Installation

### Option 1: Using Homebrew (macOS/Linux - Recommended)

```bash
brew install supabase
```

### Option 2: Using npx (Cross-platform)

```bash
# Or install globally
npm install -g supabase
```

### Option 3: Direct Download

Download the latest release from the [Supabase CLI releases page](https://github.com/supabase/cli/releases) and add it to your PATH.

### Verify Installation

```bash
supabase --version
```

## Environment Files

To switch between live Supabase and your local Supabase CLI instance, prepare both files:

- `.env.local` — Live/hosted Supabase
  - Contains live project values (project id, anon key, service role key, JWT secret, etc.).
  - Used by scripts: `npm run dev:live`, `npm run frontend:live`, `npm run backend:live`.

- `.env.supabase.local` — Local Supabase (CLI)
  - Contains local values printed by the Supabase CLI after you start it (API URL, keys, studio URL, etc.).
  - Used by scripts: `npm run dev:local`, `npm run frontend:local`, `npm run backend:local`.

Templates:

- Copy `.env.local.template` → `.env.local` and fill live keys.
- Copy `.env.supabase.local.template` → `.env.supabase.local` and fill the local values.

Tip: Start local Supabase with `npm run s:start`; the CLI prints the local API URL, studio URL, and publishable/secret keys you can use in `.env.supabase.local`.

Note on encrypted secrets

- The file `supabase/.env.keys` stores private decryption keys for values encrypted in `supabase/.env.production` and `.env.preview` (e.g., Google OAuth secret). It’s not required for local‑only development. See [Secrets & Encryption](./Supabase.md#secrets--encryption) (Secrets & Encryption).

### Script ↔ Env Matrix

| Purpose | Script | Env file |
| --- | --- | --- |
| Live app (both) | `npm run dev:live` | `.env.local` |
| Live frontend | `npm run frontend:live` | `.env.local` |
| Live backend | `npm run backend:live` | `.env.local` |
| Local app (both) | `npm run dev:local` | `.env.supabase.local` |
| Local frontend | `npm run frontend:local` | `.env.supabase.local` |
| Local backend | `npm run backend:local` | `.env.supabase.local` |
| Start local Supabase | `npm run s:start` | `.env.supabase.local` |
| Restart local Supabase | `npm run s:restart` | `.env.supabase.local` |
| Reset local DB | `npm run s:reset` | `.env.supabase.local` |

## Secrets & Encryption

We use dotenvx to encrypt sensitive values (e.g., Google OAuth client secret) inside the Supabase environment files:

- `supabase/.env.production` and `supabase/.env.preview` may contain values like `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET="encrypted:..."`.
- The decryption keys live in `supabase/.env.keys` and are ignored by Git (see `supabase/.gitignore`). Keep this file private.

How it works

- Our link scripts (`npm run s:link:prod`, `npm run s:link:dev`) use `dotenvx run -f ...` to load the env file, automatically decrypting any `encrypted:` values using the matching key from `supabase/.env.keys`.
- `supabase/config.toml` reads `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` and `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` via `env(...)` for the Google provider configuration.

Updating encrypted secrets

- To update the encrypted Google secret, edit `supabase/.env.production` or `.env.preview` and re‑encrypt using dotenvx per their docs. Ensure the corresponding private key in `supabase/.env.keys` matches.
- Do not commit real secrets or private keys to Git.

Uploading secrets to Supabase

- If you need Supabase to hold certain envs for CLI/functions, upload only the required variables (e.g., decrypted provider secrets), not the private decryption keys. Example:

```bash
# Upload env vars from a file (choose only the needed ones)
npx supabase secrets set --env-file supabase/.env.production
```

Warning: Avoid uploading `supabase/.env.keys` to Supabase secrets. Those keys are for local decryption only.

## Commands

To get a full list of commands you can run `supabase`. If **"supabase is not found"**, prefix it as such: `npx supabase`.  
To find out more about **any command** run `npx supabase [command] --help` and the terminal will provide more information.

### Available npm scripts

#### Core Development

- `npm run dev` - Start frontend + backend (remote DB)
- `npm run dev:local` - Start local Supabase + frontend + backend
- `npm run dev:live` - Start frontend + backend with live environment
- `npm run frontend` - Start only frontend
- `npm run backend` - Start only backend
- `npm run frontend:local` - Start frontend with local Supabase environment
- `npm run frontend:live` - Start frontend with live environment
- `npm run backend:local` - Start backend with local Supabase environment
- `npm run backend:live` - Start backend with live environment
- `npm run install-all` - Install dependencies for all packages (root, frontend, backend)

#### Supabase Management

- `npm run s:start` - Start local Supabase stack
- `npm run s:stop` - Stop local Supabase stack
- `npm run s:restart` - Restart local Supabase stack
- `npm run s:status` - Show status of local services
- `npm run s:studio` - Open Supabase Studio
- `npm run s:link` - Link project to Supabase

#### Database Operations

- `npm run s:reset` - Reset local DB and apply all migrations
- `npm run s:seed:main` - Create/refresh seed data from main
- `npm run s:dump` - Dump database schema to file

## Project Setup

1. **Login with Supabase**  
   Run and follow terminal instructions: `supabase login` (Homebrew install) or `npx supabase login`.

2. **Link the project**  
   Use our scripts for the correct project:
   - Production (main): `npm run s:link:prod`
   - Develop/persistent preview: `npm run s:link:dev`

3. **Optional: Create/refresh seed data**  
   If you need seed data: `npm run s:seed:main`

4. **Start the containers**

   `npx supabase start` or `npm run s:start`

   After starting up the containers, you can visit the [studio](http://127.0.0.1:54323) to get a comprehensive overview of the local instance

   ![Supabase Studio Screenshot](https://supabase.com/docs/img/guides/cli/local-studio.png)

## Local Development

Local changes are done using migration files. They contain SQL which is applied to your local supabase instance.

**Important!** When running local supabase, make sure you use the local development environment.

```bash
## Run the frontend locally
npm run frontend:local
## Run the backend locally 
npm run backend:local
## Or run both from one terminal if you prefer
npm run dev:local
```

### View changes locally

After creating your new table, restart the containers to view them locally using

```bash
npm run s:reset
```

This will apply your new migration and you will be able to see it in the [studio](http://127.0.0.1:54323)

### Migrations & Types

- Creating migrations, applying them, and CI workflow: see [Migrations](supabase-index.md#migrations).
- Regenerating types from local/remote: see [Supabase Useful Scripts](supabase-index.md#useful-scripts)
