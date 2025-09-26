# Supabase Local Development Guide

Note: This guide predates our Supabase Branching workflow. For the current, recommended process (branching + GitHub integration), see docs/developers/Supabase.md. The steps below focus on running Supabase locally and basic CLI usage.

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

#### Database Diffing & Syncing

- `npm run s:local:diff` - Generate diff of local changes
- `npm run s:diff:linked` - Generate diff against linked remote database
- `npm run s:diff:linked:f` - Generate diff against linked remote with filename

## Project Setup

1. **Login with Supabase**  
   Run and follow terminal instructions: `supabase login` (Homebrew install) or `npx supabase login`.

2. **Link the project**  
   Use our scripts for the correct project:
   - Production (main): `npm run s:link:prod`
   - Develop/persistent preview: `npm run s:link:dev`

3. **Optional: Create/refresh seed data**  
   If you need seed data: `npm run s:seed:main`

3. **Start the containers**  
   `npx supabase start` or `npm run s:start`

   After starting up the containers, you can visit the [studio](http://127.0.0.1:54323) to get a comprehensive overview of the local instance

   ![](https://supabase.com/docs/img/guides/cli/local-studio.png)

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

### 1. Create a migration file

```
supabase migration new <file-name>
```

### 2. Add your SQL

```sql
CREATE TABLE test_migration (
  coffee VARCHAR(255),
  year INT
);
```

### 3. View changes locally

After creating your new table, restart the containers to view them locally using

```
npm run s:reset
```

This will apply your new migration and you will be able to see it in the [studio](http://127.0.0.1:54323)

### 4. Generate Local Types  

If you have made changes to the schema, make sure you update the supabase types

```
npx supabase gen types typescript --local > common/supabase.types.ts
```

### 5. Apply migrations via GitHub (Branching)

Open a PR with changes in the `supabase/` folder. The Supabase workflow (provided by Supabase) runs automatically. Verify it passes before merging. Do not use `supabase db push`; we rely on the GitHub integration to apply migrations when merging to `develop` and later to `main`. See docs/developers/Supabase.md for details.
