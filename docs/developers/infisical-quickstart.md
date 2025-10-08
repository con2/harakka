# 🔐 Infisical Quick Start for Team Members

**Stop sharing .env files in team chat!** 🛑

Use Infisical instead for secure, centralized environment variable management.

## Quick Setup (5 minutes)

### 1. Install Infisical CLI

```bash
npm install -g @infisical/cli
```

### 2. Authenticate

```bash
infisical login
```

#### Choose the same region as the project (ask team lead)

### 3. Verify Access

```bash
cd /path/to/FullStack_Storage_and_Booking_App
infisical secrets get NODE_ENV --env=dev
```

### 4. Start Development

You have **two options**:

#### Option A: Use Infisical directly (recommended)

```bash
npm run dev:infisical          # Run full app with Infisical
npm run frontend:infisical     # Frontend only
npm run backend:infisical      # Backend only
```

#### Option B: Sync to local .env files

```bash
# PULL: Sync latest secrets to local files
npm run infisical:sync:local:env        # Get .env.local → .env.local.recovered
npm run infisical:sync:supabase:local   # Get .env.supabase.local → .env.supabase.local.recovered
npm run infisical:sync:both             # Get both files at once

# Then copy to your working files
cp .env.local.recovered .env.local
cp .env.supabase.local.recovered .env.supabase.local

# PUSH: Upload your local changes back to Infisical
npm run infisical:push:local:env        # Push .env.local → staging
npm run infisical:push:supabase:local   # Push .env.supabase.local → dev  
npm run infisical:push:both             # Push both files

# Now use your normal commands
npm run dev:local              # Uses .env.local + .env.supabase.local
npm run s:start                # Uses .env.supabase.local
```

## What Changed?

### ❌ Old Way (Insecure)

- Copy .env files from team chat
- Wonder if you have the latest version
- Risk exposing secrets in Git
- Manual environment management

### ✅ New Way (Secure)

- Centralized secret management
- Always up-to-date secrets
- Role-based access control
- Audit logs and versioning

## Common Commands

```bash
# View available secrets
infisical secrets get NODE_ENV --env=dev

# Run any command with secrets injected
infisical run --env=dev -- [your-command]

# Check your Infisical user
infisical user

# Logout/login if needed
infisical logout
infisical login
```

## Troubleshooting

### "Authentication failed"

```bash
infisical logout
infisical login
```

### "Permission denied"

- Ask project admin to invite you
- Check you're in the right workspace

### "No secrets found"

- Verify you're using `--env=dev`
- Check with team lead that secrets are uploaded

## Need Help?

1. Check the full guide: `docs/developers/infisical-setup.md`
2. Ask the team lead to check your Infisical permissions

---

**🎉 Welcome to secure environment management!**
