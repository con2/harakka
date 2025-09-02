# Branch Testing Environment Setup

## Overview
You now have a complete setup for testing with Supabase preview branches locally.

## Environment Files
- **`.env.local`** - Production database (rcbddkhvysexkvgqpcud)
- **`.env.branch`** - Preview branch database (kffoqormzcaftuypriia)
- **`supabase-local.env`** - Local Supabase instance

## 🔧 Setup Required

### 1. Get Supabase API Keys for Branch
You need to add these keys to `.env.branch`:

1. Go to: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/settings/api
2. Copy the `anon` and `service_role` keys
3. Add them to `.env.branch`:

```dotenv
SUPABASE_ANON_KEY=your_branch_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_branch_service_role_key_here
VITE_SUPABASE_ANON_KEY=your_branch_anon_key_here
```

### 2. Update Branch Credentials (when needed)
When you get a new branch, you only need to update these two values in `.env.branch`:
- `SUPABASE_PROJECT_ID` - The new branch project ID
- `DB_PASSWORD` - The new branch database password

All other URLs will automatically update using variable substitution.

```dotenv
SUPABASE_ANON_KEY=your_branch_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_branch_service_role_key_here
VITE_SUPABASE_ANON_KEY=your_branch_anon_key_here
```

## 🚀 Available Scripts

### Branch Database Operations
```bash
npm run branch:pull      # Pull schema from preview branch (public only)
npm run branch:push      # Push migrations to preview branch
npm run branch:reset     # Reset preview branch database
npm run branch:diff      # Generate diff for preview branch changes
npm run branch:status    # Show branch connection details
npm run branch:studio    # Get link to branch Supabase Studio
```

### Development with Branch
```bash
npm run dev:branch       # Run frontend + backend with branch database
npm run frontend:branch  # Run only frontend with branch database
npm run backend:branch   # Run only backend with branch database
```

### Existing Production Scripts
```bash
npm run dev:live         # Run with production database (.env.local)
npm run dev:local        # Run with local Supabase instance
```

## 🧪 Testing Workflow

### 1. **Safe Database Testing**
```bash
# Test schema changes safely
npm run branch:diff      # See what changes you want to make
npm run branch:push      # Apply changes to branch
npm run branch:pull      # Pull updated schema
```

### 2. **Full Application Testing**
```bash
# Run your app against the branch database
npm run dev:branch

# This will start:
# - Frontend on http://localhost:5173 (connected to branch)
# - Backend on http://localhost:3000 (connected to branch)
```

### 3. **Database Operations**
```bash
# Reset branch database to clean state
npm run branch:reset

# Pull latest schema from production to branch
npm run branch:pull
```

## ⚠️ Important Notes

1. **Branch Limitations**: Preview branches can only modify `public` schema
2. **Auth/Storage Changes**: Must be applied directly to production
3. **Environment Isolation**: Branch and production are completely separate
4. **API Keys**: Branch has different API keys than production

## 🔄 Typical Development Flow

1. **Create feature branch in Git**
2. **Test database changes**: `npm run branch:diff` → `npm run branch:push`
3. **Test application**: `npm run dev:branch`
4. **Iterate and test**: Make changes, push to branch, test
5. **When ready**: Apply changes to production

## 🆘 Troubleshooting

- **Connection errors**: Check if branch is still active with `npm run branch:status`
- **API key errors**: Make sure you've added the branch API keys to `.env.branch`
- **Schema errors**: Remember branches only support `public` schema changes

## 📝 Next Steps

1. Add the branch API keys to `.env.branch`
2. Test the connection: `npm run branch:status`
3. Try running the app: `npm run dev:branch`
4. Test some database operations: `npm run branch:diff`
