# SQL Quality Checks with PostgresTools

This project uses PostgresTools for SQL linting, type checking, and validation against our Supabase database.

## Available Scripts

### Quick Commands

```bash
# Check both migrations and scripts directories
npm run sql:check

# Check only migration files
npm run sql:check:migrations

# Check only script files  
npm run sql:check:scripts

# Detailed output with processed files list
npm run sql:check:verbose

# Check all SQL files in project
npm run sql:check:all
```

### What PostgresTools Checks

✅ **Syntax validation** - Catches SQL syntax errors  
✅ **Type checking** - Verifies tables, columns exist in database  
✅ **Safety warnings** - Alerts for potentially dangerous operations (DROP TABLE, etc.)  
✅ **Best practices** - Recommends PostgreSQL best practices  
✅ **Schema validation** - Ensures queries match your actual database schema  

### Configuration

- **Config file:** `postgrestools.jsonc`
- **Database:** Connects to local Supabase instance (`127.0.0.1:54322`)
- **Checked directories:** `supabase/migrations/`, `scripts/`

### VSCode Integration

With the PostgresTools VSCode extension installed, you get:

- Real-time SQL error highlighting
- Database-aware autocompletion
- Table/column suggestions from your actual schema
- Instant feedback as you type

### Examples

```bash
# Before committing migrations
npm run sql:check:migrations

# Before deploying scripts
npm run sql:check:scripts

# Full project SQL health check
npm run sql:check:verbose
```

This ensures all SQL code is validated against your actual database schema before deployment.
