# Setup Script Guide

The `setup.sh` script automates the initial configuration for both Docker deployment and local development environments.

## Overview

The setup script handles:

- Environment file creation from templates
- Configuration validation
- Interactive setup flow
- Guidance for next steps

## Usage

### Basic Usage

```bash
# Make script executable (first time only)
chmod +x scripts/setup.sh

# Run the setup script
./scripts/setup.sh
```

### Interactive Options

When you run the script, you'll be prompted to choose:

1. **Docker containerized deployment** (uses `.env.production`)
2. **Local development** (uses `.env.local`)

## Docker Deployment Setup

Choose option 1 for Docker deployment:

```bash
$ ./scripts/setup.sh

🚀 Full-Stack Storage and Booking App - Setup
=============================================

Choose your setup method:
1. Docker containerized deployment (uses .env.production)
2. Local development (uses .env.local)

Enter choice (1 or 2): 1
```

### Docker Setup Process

1. Creates `.env.production` from `.env.production.template`
2. Prompts you to edit the environment file
3. Validates required variables are configured
4. Provides next steps for Docker deployment

### Required Environment Variables

The script validates these variables for Docker deployment:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key  
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `EMAIL_FROM_2` - Your Gmail address for notifications
- `GMAIL_APP_PASSWORD` - Your Gmail app password

## Local Development Setup

Choose option 2 for local development:

```bash
$ ./scripts/setup.sh

Enter choice (1 or 2): 2
💻 Setting up for local development...
```

### Local Development Process

1. Creates `.env.local` from `.env.local.template`
2. Validates configuration
3. Provides next steps for local development

## Script Features

### Validation

The script checks that environment variables are:

- Present in the environment file
- Not set to template placeholder values (e.g., `YOUR_SUPABASE_URL`)
- Properly configured for the chosen deployment method

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

### Successful Docker Setup

```bash
✅ Setup complete! Environment is configured.

Next steps for Docker:
1. Build:  docker compose --env-file .env.production -f docker-compose.production.yml build
2. Run:    docker compose --env-file .env.production -f docker-compose.production.yml up -d

Access points after running:
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health

Useful commands:
   - View logs: docker compose -f docker-compose.production.yml logs -f
   - Stop: docker compose -f docker-compose.production.yml down
```

### Successful Local Development Setup

```bash
✅ Setup complete! Environment is configured.

Next steps for local development:
1. Install dependencies: npm run install-all
2. Run frontend: cd frontend && npm run dev
3. Run backend: cd backend && npm run start:dev

Access points after running:
   - Frontend: http://localhost:5180
   - Backend API: http://localhost:3000
```

## Troubleshooting

### Template File Missing

If you see:

```bash
❌ .env.production.template not found!
```

Ensure you're running the script from the project root directory and the template file exists.

### Validation Failures

If variables are not configured:

```bash
❌ Found 2 unconfigured variables in .env.production
Please update these values before building the application.
```

Edit your environment file with actual values (not placeholder values starting with `YOUR_`).

### Permission Issues

If you get permission denied:

```bash
chmod +x scripts/setup.sh
```

## Manual Alternative

You can also set up the environment manually without the script:

### Docker Environment

```bash
cp .env.production.template .env.production
# Edit .env.production with your values
```

### Local Development Environment

```bash
cp .env.local.template .env.local  
# Edit .env.local with your values
```

## Related Documentation

- [Docker Deployment Guide](../docker-deployment.md) - Complete Docker setup
- [Getting Started Guide](../../getting-started.md) - Overall project setup
- [Development Cycle](../development-cycle.md) - Development workflow
