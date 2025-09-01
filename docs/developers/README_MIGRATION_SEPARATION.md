# Migration Separation & Branch Testing Documentation

## Overview

Due to Supabase preview branch restrictions, we've separated auth and storage schema changes from public schema changes into dedicated migration files. This enables safe testing with preview branches while maintaining production functionality.

## Environment Setup

### Quick Branch Setup

1. **Create branch environment file:**

   ```bash
   cp .env.branch.template .env.branch
   ```

2. **Get branch credentials:**

   ```bash
   supabase branches get
   ```

3. **Update `.env.branch` with:**
   - `SUPABASE_PROJECT_ID` - Copy PROJECT_REF from branch details
   - `DB_PASSWORD` - Copy PASSWORD from branch details  
   - `SUPABASE_ANON_KEY` - Get from Supabase dashboard → Settings → API
   - `SUPABASE_SERVICE_ROLE_KEY` - Get from Supabase dashboard → Settings → API

4. **Test connection:**

   ```bash
   npm run branch:status
   ```

## Separated Files

### Production-Only Migrations (Cannot be applied to preview branches)

1. **`20250825082829_auth_functions_production_only.sql`**
   - Contains all auth schema functions and triggers
   - Must be applied directly to production environment
   - Cannot be applied to preview branches due to auth schema restrictions

2. **`20250825082830_storage_policies_production_only.sql`**
   - Contains storage bucket policies and table operations
   - Must be applied directly to production environment
   - Cannot be applied to preview branches due to storage schema restrictions

### Branch-Safe Migrations (Can be applied to preview branches)

- Public schema changes can be safely tested in preview branches
- Future public schema changes should be placed in separate migration files
- Use `npm run branch:push` to apply to preview branches

## Branch Testing Workflow

### 1. Schema Testing with Preview Branches

```bash
# See what changes you want to make
npm run branch:diff

# Apply changes to preview branch (public schema only)
npm run branch:push

# Pull updated schema back to local
npm run branch:pull
```

### 2. Full Application Testing

```bash
# Run your app against the branch database
npm run dev:branch

# This starts:
# - Frontend on http://localhost:5173 (connected to branch)
# - Backend on http://localhost:3000 (connected to branch)
```

### 3. Database Operations

```bash
# Reset branch database to clean state
npm run branch:reset

# Pull latest schema from production to branch
npm run branch:pull

# Get link to branch Supabase Studio
npm run branch:studio
```

## Usage Instructions

### For Preview Branch Development

1. Preview branches will automatically skip production-only migrations
2. Only public schema migrations will be applied to preview branches
3. Use branch environment variables for testing branch-specific changes
4. Test schema changes safely before applying to production

### For Production Deployment

1. Apply all migration files including production-only ones
2. Use production database credentials
3. Migrations will be applied in chronological order by timestamp

```bash
# Apply all migrations to production
npm run s:push
```

## Migration Commands Reference

### Branch Database Operations

```bash
npm run branch:pull      # Pull schema from preview branch (public only)
npm run branch:push      # Push migrations to preview branch
npm run branch:reset     # Reset preview branch database
npm run branch:diff      # Generate diff for preview branch changes
npm run branch:status    # Show branch connection details
npm run branch:studio    # Get link to branch Supabase Studio
```

### Production Database Operations

```bash
npm run s:push          # Apply all migrations to production
npm run s:diff          # Generate diff for production changes
npm run s:status        # Show production connection details
```

### Development Commands

```bash
npm run dev:branch      # Run frontend + backend with branch database
npm run dev:live        # Run with production database
npm run dev:local       # Run with local Supabase instance
```

## Best Practices

1. **Separate Schema Changes**: Keep auth/storage changes separate from public schema changes
2. **Use Descriptive Names**: Include `_production_only` suffix for restricted migrations
3. **Test Branches First**: Always test public schema changes in preview branches before production
4. **Document Dependencies**: Note any dependencies between auth/storage and public schema changes

## Migration Naming Convention

- `YYYYMMDDHHMMSS_description.sql` - Standard migration
- `YYYYMMDDHHMMSS_description_production_only.sql` - Auth/Storage schema changes
- `YYYYMMDDHHMMSS_description_public_only.sql` - Public schema changes safe for preview branches

## Notes

- Auth and storage schemas are managed by Supabase and cannot be modified in preview branches
- This separation ensures preview branches work correctly while maintaining production functionality
- Always backup original migrations before separation
