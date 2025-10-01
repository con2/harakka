# Supabase Local Development Guide

This guide focuses on local Supabase (Docker + CLI). For branching, migrations, and the GitHub integration, use the canonical guide: docs/developers/Supabase.md.

This guide covers setting up the Supabase CLI for team development, including installation and local development workflow.

## Table of contents

- [Sources](#sources)
- [Prerequisites](#prerequisites)
- [Docker Installation](#docker-installation)
- [CLI Installation](#cli-installation)
  - [Option 1: Using Homebrew (macOS/Linux - Recommended)](#option-1-using-homebrew-macoslinux---recommended)
  - [Option 2: Using npx (Cross-platform)](#option-2-using-npx-cross-platform)
  - [Option 3: Direct Download](#option-3-direct-download)
  - [Verify Installation](#verify-installation)
- [Environment Files](#environment-files)
  - [Script ↔ Env Matrix](#script--env-matrix)
- [Secrets & Encryption](#secrets--encryption)
- [Commands](#commands)
  - [Available npm scripts](#available-npm-scripts)
    - [Core Development](#core-development)
    - [Supabase Management](#supabase-management)
    - [Database Operations](#database-operations)
- [Project Setup](#project-setup)
  - [Login with Supabase](#login-with-supabase)
  - [Linking & Project Refs](#linking--project-refs)
  - [Production(main)](#productionmain)
  - [Persistent Branch(develop)](#persistent-branchdevelop)
  - [Start Container](#start-container)
  - [(Optional)Create/refresh seed data](#optionalcreaterefresh-seed-data)
- [Local Development](#local-development)
  - [View changes locally](#view-changes-locally)
  - [Migrations & Types](#migrations--types)
    - [Creating a Migration](#creating-a-migration)
    - [Branching & GitHub Integration](#branching--github-integration)
- [Troubleshooting](#troubleshooting)
  - [Workflow failed or branch out of sync](#workflow-failed-or-branch-out-of-sync)
  - [Error message when trying to run supabase db reset](#error-message-when-trying-to-run-supabase-db-reset)
  - [Error response from daemon](#error-response-from-daemon)
  - [Migrations](#migrations)
  - [Linking](#linking)
- [Useful Scripts](#useful-scripts)
- [Do Not Use](#do-not-use)

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

### Login with Supabase

Homebrew

```bash
supabase login # (Homebrew install)
```

Global

```bash
npx supabase login
```

### Linking & Project Refs

### Production(main)

Project ref: `rcbddkhvysexkvgqpcud`
Script:

```bash
npm run s:link:prod
```

### Persistent Branch(develop)

Project ref: `kpqrzaisoyxqillzpbms`
Script:

```bash
npm run s:link:dev
```

### Start Container

```bash
npm run s:start
## Or
supabase start # Add npx in front if using global

```

### (Optional)Create/refresh seed data

If you want to start your local database with seed data from production you can run:

```bash
npm run s:seed:main
npm run s:reset
```

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

#### Creating a Migration

Create a new migration with a descriptive, underscore‑separated name:

```bash
npm run s:migration:new my_feature_or_fix_name
```

This creates a new file under `supabase/migrations/`. Add your SQL there. To validate locally, rebuild your local DB:

```bash
npm run s:reset
```

If needed, regenerate local types for the app:

```bash
npm run generate:types:local
```

#### Branching & GitHub Integration

- Our Supabase project is set up with Branching. Changes to the `supabase/` folder in a PR trigger the Supabase workflow (provided by Supabase, not custom).
- Typical flow:
  - Commit your migration(s) under `supabase/migrations/`.
  - Open a PR on GitHub. Ensure the Supabase workflow/checks pass.
  - If `supabase db reset` works locally without issues, it’s a good indicator the workflow will succeed.
  - Merge into `develop` when the workflow passes. The persistent `develop` Supabase branch is updated with the new SQL.
  - Later, changes are merged to `main` for production. Our `main` Supabase branch mirrors the GitHub `main` branch.

Important: We do not run manual pushes. Do not use `supabase db push` or any `s:db:push...` scripts for schema. Let the GitHub integration apply migrations.

## Troubleshooting

### Workflow failed or branch out of sync

Reset the branch in the [Supabase UI](https://supabase.com/dashboard/project/rcbddkhvysexkvgqpcud/branches), then the migrations should run properly.

### Error message when trying to run supabase db reset

Sometimes you will get odd errors about connections failing when doing a `db reset`, If this happens restart your local supabase instance and try to **reset** again.

```bash
supabase stop && supabase start
# or
npm run s:restart
```

### Error response from daemon

Sometimes if you are switching back and forth between using `npm run s:` commands and `supabase`commands, you will get an error about the port being allocated already. If this happens try stopping the container that it suggests

```bash
npx supabase stop --project-id <project-id>
# or
supabase stop --project-id <project-id>
```

If this does not help you might need to delete all of your supabase containers before starting the server again.
**Warning:** This will remove all data from your current local containers.

```bash
npm run s:stop
# or
supabase stop

docker volume ls --filter "name=supabase" -q | xargs -r docker volume rm
# Then start your local supabase again with your prefered command
```

### Migrations

**Warning** Never edit previously merged migration files.

Migrations are read from top-to-bottom. If something needs changing, create a new migration to fix/adjust prior work. Editing old migrations after a PR is opened or merged can break the branching workflow.

### Linking

If the CLI complains about linking just run:

```bash
npm run s:link:prod
## or
supabase link --project-ref rcbddkhvysexkvgqpcud
```

## Useful Scripts

- Start/restart/status/studio

```bash
npm run s:start
npm run s:restart
npm run s:status
npm run s:studio
```

- Migrations

```bash
npm run s:migration:new my_change
npm run s:reset
```

- Types

```bash
npm run generate:types:local
npm run generate:types # Generates the types from the supabase main branch
```

## Do Not Use

- `supabase db push`
- `npm run s:db:push:prod` / `npm run s:db:push:preview`

These are not part of our branching workflow. Always rely on the GitHub integration to apply migrations.
