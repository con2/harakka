# Supabase Migration Deployment Workflow

This document describes the automated GitHub Actions workflow that deploys Supabase database migrations to production when PRs are merged into the `develop` branch.

## Overview

The `supabase-migration-deploy.yml` workflow automatically:

1. **Triggers only on completed merges** to the `develop` branch
2. **Detects migration changes** by comparing files in `supabase/migrations/`
3. **Checks for schema drift** between production database and local schema
4. **Creates automatic PRs** when manual database changes are detected
5. **Validates migrations** before deploying to production
6. **Deploys migrations safely** using Supabase CLI
7. **Provides comprehensive logging** and error handling

## Workflow Triggers

### Automatic Triggers

- **Push to develop branch**: Only when files in `supabase/migrations/` have changed
- **Merge detection**: Only runs on actual PR merges (not direct pushes)

### Manual Triggers

- **Workflow dispatch**: Can be manually triggered from GitHub Actions UI

## Prerequisites

### Required GitHub Secrets

The workflow requires these secrets to be configured in your repository settings:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI access token | `sbp_abc123...` |
| `PRODUCTION_PROJECT_ID` | Production Supabase project reference | `abcdefghijklmnop` |
| `PRODUCTION_DB_PASSWORD` | Production database password | `your_secure_password` |

### Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret** for each required secret
4. Add the values from your Supabase production project

## How It Works

### 1. Smart Triggering

```yaml
# Only runs on merge commits to develop branch
if: github.event_name == 'workflow_dispatch' || 
    (github.event_name == 'push' && contains(github.event.head_commit.message, 'Merge pull request'))
```

### 2. Change Detection

The workflow compares the current commit with the previous one to detect migration file changes:

```bash
git diff --name-only $PREV_COMMIT HEAD -- supabase/migrations/
```

### 3. Safety Checks

- Verifies all required secrets are present
- Validates migration file structure
- Checks file readability and basic syntax

### 4. Deployment Process

```bash
supabase login --token ${{ secrets.SUPABASE_ACCESS_TOKEN }}
supabase link --project-ref ${{ secrets.PRODUCTION_PROJECT_ID }}
supabase db push --password ${{ secrets.PRODUCTION_DB_PASSWORD }}
```

## Schema Drift Detection

### What is Schema Drift?

Schema drift occurs when manual changes are made directly to the production database that aren't captured in your migration files. This can happen when:

- Team members make hotfix changes directly in production
- Emergency database updates are applied manually
- Database changes are made through admin panels or SQL editors
- Configuration changes are applied outside the migration system

### How Drift Detection Works

The workflow automatically detects schema drift by:

1. **Comparing schemas**: Uses `supabase db diff --local` to compare production database with local schema
2. **Detecting differences**: Identifies any changes in tables, columns, functions, policies, triggers, etc.
3. **Generating migration**: Creates a timestamped migration file to capture the differences
4. **Creating PR**: Automatically creates a pull request with the captured changes
5. **Stopping deployment**: Halts the current deployment until drift is resolved

### When Drift is Detected

If manual changes are found in production:

```text
⚠️ Schema drift detected!
Manual changes found in production database.

❌ DEPLOYMENT STOPPED - Schema drift detected!

🔍 Manual changes were found in the production database that aren't captured in your migrations.

📋 What you need to do:
1. Review the automatically created PR with the detected changes
2. Verify the changes are intentional and safe
3. Merge the drift PR to sync your schema
4. Re-run this deployment workflow

🔗 Drift Migration PR: https://github.com/your-repo/pull/123
```

### Automatic PR Creation

When drift is detected, the workflow automatically:

- **Creates a new branch**: `drift/capture-manual-changes-TIMESTAMP`
- **Generates migration file**: `TIMESTAMP_capture_manual_changes.sql`
- **Creates detailed PR**: With complete description of detected changes
- **Assigns reviewer**: Tags the original PR author for review
- **Links context**: References the original commit that triggered detection

### Handling Drift PRs

#### Review Process

1. **Check the PR description**: Shows exactly what manual changes were detected
2. **Review the migration file**: Verify the SQL changes are intended and safe
3. **Investigate the source**: Determine who made the manual changes and why
4. **Validate the changes**: Ensure they don't conflict with your planned migrations

#### Example Drift PR Content

```sql
-- Migration generated automatically to capture manual database changes
-- Generated on: 2025-01-26 10:30:00 UTC
-- Source: Schema drift detection from production database
-- 
-- WARNING: Review these changes carefully before merging
-- These represent manual changes made directly to the production database

CREATE TABLE emergency_maintenance (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN emergency_contact VARCHAR(255);
```

#### Resolution Options

**Option 1: Merge the Drift PR (Recommended)**
- Review and approve the captured changes
- Merge the PR to sync your schema
- Re-run the original deployment

**Option 2: Reject and Rollback**
- If changes are unauthorized or incorrect
- Manually rollback the production changes
- Update the migration files as needed
- Re-run the deployment

## Workflow Steps Breakdown

| Step | Purpose | Conditions |
|------|---------|------------|
| **Checkout** | Get repository code with full history | Always |
| **Setup Node.js** | Install Node.js and npm | Always |
| **Install Supabase CLI** | Get latest Supabase CLI | Always |
| **Verify Secrets** | Check required secrets exist | Always |
| **Check Changes** | Detect migration file changes | Always |
| **Skip if No Changes** | Exit early if no migrations changed | When no changes detected |
| **Authenticate** | Login to Supabase | Only with changes |
| **Link Project** | Connect to production project | Only with changes |
| **Check Schema Drift** | Compare production vs local schema | Only with changes |
| **Generate Drift Migration** | Create migration file for manual changes | Only when drift detected |
| **Create Drift PR** | Automatically create PR for review | Only when drift detected |
| **Stop on Drift** | Halt deployment until drift resolved | Only when drift detected |
| **Validate Migrations** | Check migration file integrity | Only with changes, no drift |
| **Deploy Migrations** | Apply changes to production | Only with changes, no drift |
| **Verify Deployment** | Confirm migrations applied | Only with changes, no drift |
| **Report Summary** | Log deployment details | Only with changes, no drift |

## Expected Behavior

### Successful Deployment

```text
✅ All required secrets are available
Migration file changes detected:
supabase/migrations/20250826120000_add_new_table.sql
🔐 Authenticating with Supabase...
🔗 Linking to production project...
🔍 Validating migration files...
🚀 Deploying migrations to production...
✅ Migrations deployed successfully!
🎉 Migration deployment completed successfully!
```

### No Changes Detected

```text
No migration file changes detected
🔄 No migration changes detected - skipping deployment
This is expected behavior when migrations haven't changed
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Missing Secrets

**Error**: `❌ SUPABASE_ACCESS_TOKEN secret is missing`

**Solution**:

- Verify all three secrets are configured in GitHub repository settings
- Check secret names match exactly (case-sensitive)
- Ensure secrets have correct values from Supabase dashboard

#### 2. Authentication Failed

**Error**: `Failed to authenticate with Supabase`

**Solution**:

- Verify `SUPABASE_ACCESS_TOKEN` is valid and not expired
- Check token has appropriate permissions
- Generate new access token from Supabase dashboard if needed

#### 3. Project Linking Failed

**Error**: `Failed to link to production project`

**Solution**:

- Verify `PRODUCTION_PROJECT_ID` is correct (find in Supabase project settings)
- Check `PRODUCTION_DB_PASSWORD` is the database password, not project password
- Ensure database is accessible and not paused

#### 4. Migration Syntax Errors

**Error**: Migration deployment fails during `supabase db push`

**Solution**:

- Review migration files for SQL syntax errors
- Test migrations locally first with `supabase migration up`
- Check for missing dependencies or conflicting changes

#### 5. Permission Issues

**Error**: `Permission denied` or `Access forbidden`

**Solution**:

- Verify Supabase access token has `write` permissions
- Check database password is correct
- Ensure project is accessible from GitHub Actions IP ranges

### Debug Steps

#### 1. Check Workflow Logs

1. Go to **Actions** tab in your GitHub repository
2. Click on the failed workflow run
3. Expand each step to see detailed logs
4. Look for specific error messages

#### 2. Manual Verification

Test the workflow steps manually:

```bash
# Install Supabase CLI
npm install -g supabase

# Login with your token
supabase login --token YOUR_TOKEN

# Link to production
supabase link --project-ref YOUR_PROJECT_ID

# Check migration status
supabase migration list

# Test migration deployment (be careful!)
supabase db push
```

#### 3. Validate Migration Files

```bash
# Check migration files locally
ls -la supabase/migrations/

# Validate SQL syntax
# Use your preferred SQL validator or IDE
```

## Best Practices

### 1. Testing Migrations

- Always test migrations locally before merging PRs
- Use `supabase migration up` to apply locally
- Verify schema changes work as expected

### 2. Migration Naming

- Follow Supabase's timestamp naming convention
- Use descriptive names: `20250826120000_add_user_preferences_table.sql`
- Keep migrations focused and atomic

### 3. Rollback Strategy

- Supabase doesn't support automatic rollbacks
- Create rollback migrations manually if needed
- Test rollback procedures in development

### 4. Monitoring

- Monitor workflow execution after each merge
- Check Supabase dashboard for applied migrations
- Verify application functionality after deployments

## Security Considerations

### 1. Secret Management

- Never commit secrets to version control
- Rotate secrets periodically
- Use least-privilege access tokens

### 2. Production Safety

- Workflow only runs on merge commits (not direct pushes)
- Validates migrations before applying
- Requires manual approval for workflow_dispatch triggers

### 3. Access Control

- Limit who can merge to develop branch
- Review migration changes carefully in PRs
- Use branch protection rules

## Manual Override

If the workflow fails and you need to deploy migrations manually:

```bash
# 1. Install Supabase CLI locally
npm install -g supabase

# 2. Login to Supabase
supabase login --token YOUR_ACCESS_TOKEN

# 3. Link to production project
supabase link --project-ref YOUR_PROJECT_ID --password YOUR_DB_PASSWORD

# 4. Check current migration status
supabase migration list

# 5. Apply migrations
supabase db push --password YOUR_DB_PASSWORD
```

## Support

If you encounter issues:

1. Check this documentation for common solutions
2. Review GitHub Actions logs for specific errors
3. Test migrations locally before production deployment
4. Consult Supabase CLI documentation for advanced troubleshooting

## Related Documentation

- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Supabase Migration Guide](https://supabase.com/docs/guides/database/migrations)
