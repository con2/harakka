# Test Branch: Supabase Changes

This branch contains experimental changes to the Supabase database schema for testing new features.

## 🎯 Purpose

Test new database features and schema changes before implementing them in production.

## 🚀 Quick Start

```bash
# Run the setup script
./setup_test_branch.sh

# Or manually:
git checkout test/supabase-changes
supabase start
supabase db reset
```

## 🧪 Test Features Included

### 1. **Feature Flags System**
- New `test_features` table for managing feature flags
- Pre-configured test features (search, AI, pricing, sync)

### 2. **Enhanced Storage Items**
- `test_priority_score` column for ranking/sorting
- `test_metadata` JSONB column for flexible data storage

### 3. **Analytics Functions**
- `calculate_test_metrics()` function for real-time metrics
- Automated test metadata updates via triggers

### 4. **Performance Optimizations**
- GIN indexes for JSONB search
- Optimized indexes for test features

### 5. **Security Enhancements**
- Row Level Security on test tables
- Role-based access policies

## 📊 Testing the Changes

### Database Queries
```sql
-- View test features
SELECT * FROM test_features;

-- Check analytics view
SELECT * FROM test_analytics_view;

-- Test new functions
SELECT calculate_test_metrics('some-item-id');
```

### Using Test Queries File
```bash
# Run test queries in Supabase Studio or psql
psql 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' -f backend/test_queries.sql
```

## 🔄 Workflow

### Making Changes
1. Edit migration file: `supabase/migrations/20250626153710_test_branch_changes.sql`
2. Apply changes: `supabase db reset`
3. Test functionality using test queries
4. Commit changes to test branch

### Testing Frontend Integration
1. Update your frontend application to use test features
2. Connect to local Supabase instance (port 54321)
3. Test feature flags and new functionality

### Rolling Back
```bash
# Switch back to main branch
git checkout main

# Reset database to main branch state
supabase db reset
```

## 📁 Files Added/Modified

- `supabase/migrations/20250626153710_test_branch_changes.sql` - Main test migration
- `backend/test_queries.sql` - Test queries and examples
- `setup_test_branch.sh` - Automated setup script
- `TEST_BRANCH_README.md` - This documentation

## 🔍 What to Test

### Functionality Testing
- [ ] Feature flag toggling works
- [ ] Test metadata updates correctly
- [ ] Analytics calculations are accurate
- [ ] Search performance with new indexes
- [ ] Row Level Security policies

### Performance Testing
- [ ] Query performance with new indexes
- [ ] JSONB operations on test_metadata
- [ ] Trigger performance on updates
- [ ] View query optimization

### Integration Testing
- [ ] Frontend can read feature flags
- [ ] API endpoints work with new columns
- [ ] Authentication/authorization still works
- [ ] Existing functionality not broken

## 🚨 Important Notes

- **This is a test branch** - Do not merge to main without review
- **Local only** - These changes are not deployed to production
- **Isolated** - Test branch has its own migration timeline
- **Reversible** - Easy to rollback by switching branches

## 🔗 Related Documentation

- [Supabase Migrations Guide](https://supabase.com/docs/guides/local-development/migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [JSONB Operations](https://www.postgresql.org/docs/current/datatype-json.html)

## 📞 Support

If you encounter issues:
1. Check Supabase logs: `supabase logs`
2. Verify Docker is running
3. Reset environment: `./setup_test_branch.sh`
4. Switch to main branch and try again
