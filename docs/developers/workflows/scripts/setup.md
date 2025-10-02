# Setup Script Guide

The `setup.sh` script automates the initial configuration for local development environments.

## Overview

The setup script handles:

- Environment file creation from templates
- Configuration validation
- Interactive setup flow
- Guidance for next steps

## Usage

### Basic Usage

```sh
# Make script executable (first time only)
chmod +x scripts/setup.sh

# Run the setup script
./scripts/setup.sh
```

## Local Development Setup

When you run the script, it will set up the environment for local development:

```sh
$ ./scripts/setup.sh

🚀 Full-Stack Storage and Booking App - Setup
=============================================

💻 Setting up for local development...
```

### Local Development Process

1. Creates `.env.local` from `.env.local.template`
2. Validates configuration
3. Provides next steps for local development

### Required Environment Variables

The script validates these variables for local development:

- SUPABASE_URL - Your Supabase project URL
- SUPABASE_ANON_KEY - Your Supabase anonymous key
- SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key
- EMAIL_FROM_2 - Your Gmail address for notifications
- GMAIL_APP_PASSWORD - Your Gmail app password

## Script Features

### Validation

The script checks that environment variables are:

- Present in the environment file
- Not set to template placeholder values (e.g., `YOUR_SUPABASE_URL`)
- Properly configured for local development

### Color-coded Output

- 🟢 **Green**: Success messages
- 🟡 **Yellow**: Warnings and important notes
- 🔴 **Red**: Errors and failures
- 🔵 **Cyan**: Next step instructions

### Next Steps Guidance

After successful setup, the script provides:

- Exact commands to run next
- Access URLs for the application
- Useful management commands

## Example Output

### Successful Local Development Setup

```sh
✅ Setup complete! Environment is configured.

Next steps for local development:
1. Install dependencies: npm run install-all
2. Run app: npm run dev

Access points after running:
   - Frontend: http://localhost:5180
   - Backend API: http://localhost:3000
```

## Troubleshooting

### Template File Missing

If you see:

```sh
❌ .env.production.template not found!
```

Ensure you're running the script from the project root directory and the template file exists.

### Validation Failures

If variables are not configured:

```sh
❌ Found 2 unconfigured variables in .env.production
Please update these values before building the application.
```

Edit your environment file with actual values (not placeholder values starting with `YOUR_`).

### Permission Issues

If you get permission denied:

```sh
chmod +x scripts/setup.sh
```

## Manual Alternative

You can also set up the environment manually without the script:

### Local Development Environment

```sh
cp .env.local.template .env.local
# Edit .env.local with your values
```
