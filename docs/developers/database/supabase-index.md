# Supabase Branching & Workflow

This document explains how we use Supabase (Pro plan) with Branching and the GitHub integration. Our process relies on migrations in the `supabase/` folder and the Supabase GitHub workflow — we do not push schema manually.

> Tip on commands: when you see `supabase <command>`, you can run either `supabase <command>` (if installed via Homebrew) or `npx supabase <command>`.

## Table of Contents

- [Supabase Docs Index](#supabase-docs-index)
- [Prerequisites](#prerequisites)
- [Quick Start (Local)](#quick-start-local)
- [Creating a Migration](#creating-a-migration)
- [Branching & GitHub Integration](#branching--github-integration)
- [Linking & Project Refs](#linking--project-refs)
- [Troubleshooting](#troubleshooting)
- [Useful Scripts](#useful-scripts)
- [Do Not Use](#do-not-use)

## Supabase Docs Index

- Supabase Local Development Guide — Current
  - Path: [Supabase Local Development](supabase-local-development.md)
  - Purpose: Docker/CLI install details, local commands, running local stack. Use this for local-only workflows. For migrations/branching, see this page.

- Migration Separation Documentation — Deep-dive
  - Path: [Migration Seperation](migration-seperation.md)
  - Purpose: Background on separating auth/storage vs public schema to satisfy preview branch constraints. Read for context; follow this page for the workflow.

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

## Quick Start (Local)

1) Install dependencies

```bash
# In project root
npm i
npm run install-all
```

2) Login to Supabase

```bash
supabase login
# or
npm run s:login
```

3) Link the project (Production ref)

We also have `npm run s:link` which will allow you to link to any supabase project if needed.

```bash
npm run s:link:prod
```

4) Optional: seed data from main (if you have/need seed data)

This will take all the rows of data from the supabase main branch and put them into a seed.sql file in the supabase folder. This file is always read after migrations are run using `supabase db reset` or `npm run s:reset`

```bash
npm run s:seed:main
```

5) Start local Supabase

```bash
npm run s:start
```

6) Restart if needed (useful after adding migrations)

When you run this command it runs every file in the migration folder from top to bottom to create the tables locally. It always looks for a `seed.sql` file after the migrations are run.

```bash
npm run s:restart
```

## Creating a Migration

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

## Branching & GitHub Integration

- Our Supabase project is set up with Branching. Changes to the `supabase/` folder in a PR trigger the Supabase workflow (provided by Supabase, not custom).
- Typical flow:
  - Commit your migration(s) under `supabase/migrations/`.
  - Open a PR on GitHub. Ensure the Supabase workflow/checks pass.
  - If `supabase db reset` works locally without issues, it’s a good indicator the workflow will succeed.
  - Merge into `develop` when the workflow passes. The persistent `develop` Supabase branch is updated with the new SQL.
  - Later, changes are merged to `main` for production. Our `main` Supabase branch mirrors the GitHub `main` branch.

Important: We do not run manual pushes. Do not use `supabase db push` or any `s:db:push...` scripts for schema. Let the GitHub integration apply migrations.

## Linking & Project Refs

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

These scripts are defined in `package.json` and use environment files in `supabase/` to link to the correct project.

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
