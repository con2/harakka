# Supabase CLI Setup and Team Workflow

This guide covers setting up the Supabase CLI for team development, including installation, local development workflow, and best practices for collaboration.

## Table of Contents

- [CLI Installation](#cli-installation)
- [Project Setup](#project-setup)
- [Local Development Workflow](#local-development-workflow)
- [Database Management](#database-management)
- [Edge Functions Development](#edge-functions-development)
- [Team Collaboration](#team-collaboration)
- [Available npm Scripts](#available-npm-scripts)
- [Troubleshooting](#troubleshooting)

## CLI Installation

### Option 1: Using Homebrew (macOS/Linux - Recommended)

```bash
brew install supabase/tap/supabase
```

### Option 2: Using npx (Cross-platform)

```bash
# Run commands directly with npx (no installation required)
npx supabase --help

# Or install globally
npm install -g supabase
```

### Option 3: Direct Download

Download the latest release from the [Supabase CLI releases page](https://github.com/supabase/cli/releases) and add it to your PATH.

### Verify Installation

```bash
supabase --version
```

## Project Setup

### Initial Setup for New Team Members

1. **Clone the repository**:

   ```bash
   git clone https://github.com/con2/FullStack_Storage_and_Booking_App.git
   cd FullStack_Storage_and_Booking_App
   ```

2. **Install dependencies**:

   ```bash
   npm run install-all
   ```

3. **Login to Supabase**:

   ```bash
   supabase login
   ```

   This will open a browser for authentication.

4. **Verify project linking**:

   ```bash
   supabase status
   ```

   The project should already be linked to `rcbddkhvysexkvgqpcud`.

## Local Development Workflow

### Starting Local Supabase Stack

```bash
# Start all Supabase services locally
npm run supabase:start

# Or directly
supabase start
```

This will start:

- **PostgreSQL Database** (port 54322)
- **API Gateway** (port 54321)
- **Supabase Studio** (port 54323)
- **Inbucket** email testing (port 54324)
- **Realtime** server
- **Storage** service
- **Edge Functions** runtime

### Accessing Local Services

- **Supabase Studio**: <http://localhost:54323>
- **API Endpoint**: <http://localhost:54321>
- **Database**: `postgresql://postgres:postgres@localhost:54322/postgres`
- **Email Testing**: <http://localhost:54324>

### Stopping Local Services

```bash
npm run s:stop
```

### Development with Local Stack

```bash
# Start local Supabase + frontend + backend
npm run dev:local
```

This is ideal for:

- Offline development
- Testing database changes
- Developing edge functions
- Testing with seed data

## Database Management

### Schema Changes

#### Making Changes Locally

1. **Create a new migration**:

   ```bash
   npm run s:migration:new "add_new_table"
   ```

2. **Edit the migration file** in `supabase/migrations/`

3. **Apply locally**:

   ```bash
   npm run s:reset  # Resets and applies all migrations
   ```

#### Pulling Remote Changes

```bash
# Pull latest schema changes from remote
npm run s:pull
```

#### Pushing Local Changes to Remote

```bash
# Push local migrations to remote database
npm run s:push
```

### Type Generation

```bash
# Generate types from local database
npm run generate:types:local

# Generate types from remote database (fallback)
npm run generate:types
```

### Database Reset and Seeding

```bash
# Reset local database and apply all migrations + seed data
npm run s:reset
```

The reset will:

1. Drop the local database
2. Recreate it
3. Apply all migrations in order
4. Run seed data from `supabase/seed.sql`

### Creating Seed Data

```bash
# Dump current remote data for seeding (requires proper authentication)
npm run s:seed
```

## Edge Functions Development

### Local Development

```bash
# Serve edge functions locally
npm run s:functions:serve
```

Functions will be available at:

- `http://localhost:54321/functions/v1/{function-name}`

### Available Functions

- **hello-world**: Basic example function
- **JWT-Role-Insersion**: JWT role handling
- **update_app_metadata**: User metadata updates

### Deploying Functions

Deploying functions is the same a pushing your changes to the live version. They become deployed but not in use.

```bash
# Deploy all functions
npm run s:functions:deploy

# Deploy specific function
supabase s deploy {function-name}
```

## Team Collaboration

### Migration Workflow

1. **Before starting work**:

   ```bash
   git pull origin main
   npm run s:pull  # Get latest schema changes
   npm run s:reset # Apply everything locally
   ```

2. **Making schema changes**:

   ```bash
   npm run s:migration:new "descriptive_name"
   # Edit the migration file
   npm run supabase:reset  # Test locally
   ```

3. **Before committing**:

   ```bash
   npm run generate:types  # Update TypeScript types
   git add supabase/migrations/ common/supabase.types.ts
   git commit -m "feat: add new migration for X"
   ```

4. **After merging to main**:

   ```bash
   npm run s:push  # Apply to remote database
   ```

### Best Practices

- **Always create migrations** for schema changes (never edit the database directly)
- **Test migrations locally** before pushing to remote
- **Keep migrations small and focused** - one logical change per migration
- **Use descriptive migration names** that explain what changed
- **Update types after schema changes** and commit them together
- **Communicate database changes** to the team via PR descriptions

### Resolving Conflicts

If you encounter migration conflicts:

```bash
# Check migration status
supabase migration list

# Repair migration history if needed
supabase migration repair --status applied {migration-name}
```

OR

```bash
npx supabase migration list
npx migration repair --status applied {migration-name}
```

## Available npm Scripts

### Core Development

- `npm run dev` - Start frontend + backend (remote DB)
- `npm run dev:local` - Start local Supabase + frontend + backend
- `npm run frontend` - Start only frontend
- `npm run backend` - Start only backend

### Supabase Management

- `npm run s:start` - Start local Supabase stack
- `npm run s:stop` - Stop local Supabase stack
- `npm run s:restart` - Restart local Supabase stack
- `npm run s:status` - Show status of local services
- `npm run s:studio` - Open Supabase Studio

### Database Operations

- `npm run s:reset` - Reset local DB and apply all migrations
- `npm run s:pull` - Pull schema changes from remote
- `npm run s:push` - Push local migrations to remote
- `npm run s:seed` - Create seed data from remote DB

### Migrations

- `npm run s:migration:new` - Create new migration
- `npm run s:migration:up` - Apply pending migrations

### Edge Functions

- `npm run s:functions:serve` - Serve functions locally
- `npm run s:functions:deploy` - Deploy functions to remote

## Troubleshooting

### Common Issues

1. **"Database not found" error**:

```bash
   npm run s:stop
   npm run s:start
```

2. **Migration conflicts**:

```bash
   supabase migration list
   # Check for conflicts and resolve manually
```

3. **Authentication issues**:

```bash
   supabase logout
   supabase login
```

```bash
   npx supabase logout
   npx supabase login
```

4. **Port conflicts**:
   - Check if other services are using ports 54321-54327
   - Stop conflicting services or modify `supabase/config.toml`

5. **Type generation fails**:

```bash
   # Fallback to remote types
   npm run generate:types:remote
```

### Getting Help

- Check the [Supabase CLI documentation](https://supabase.com/docs/guides/cli)
- Use `--help` flag with any command: `supabase [command] --help`
- Check local logs: `supabase status --debug`

## Configuration

The project configuration is stored in `supabase/config.toml`. Key settings:

- **Database version**: PostgreSQL 15
- **API port**: 54321
- **Studio port**: 54323
- **Database port**: 54322
- **Auth settings**: Configured for production environment

## Next Steps

After setting up the CLI:

1. **Review the database schema** in Supabase Studio
2. **Explore the edge functions** in `supabase/functions/`
3. **Run the application locally** with `npm run dev:local`
4. **Create your first migration** when you need to make schema changes
5. **Read the main project documentation** in `docs/developers/`

For more advanced usage, see:

- [Database Schema Documentation](./backend/database-schema.md)
- [API Reference](./backend/api-reference.md)
- [Development Cycle](../workflows/development-cycle.md)
