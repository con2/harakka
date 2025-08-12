# Docker Deployment Guide

This guide covers how to deploy the Full-Stack Storage and Booking Application using Docker containers.

## Prerequisites

- **Docker**: Latest version
- **Docker Compose**: v2.0 or higher
- **Git**: For cloning the repository

## Quick Start (Recommended)

The containerized app only needs **2 simple commands** after initial setup:

### 1. First Time Setup

```bash
git clone https://github.com/Ermegilius/FullStack_Storage_and_Booking_App.git
cd FullStack_Storage_and_Booking_App

# Make setup script executable and run it
chmod +x scripts/setup.sh
./scripts/setup.sh
# Choose option 1 for Docker deployment
```

### 2. Build and Run

```bash
# Build the containers
docker compose --env-file .env.production -f docker-compose.production.yml build

# Run the application  
docker compose --env-file .env.production -f docker-compose.production.yml up -d
```

## Manual Setup (Alternative)

If you prefer to set up everything manually without using the setup script:

### 1. Environment Configuration

```bash
# Copy the production template
cp .env.production.template .env.production

# Edit .env.production with your actual values
nano .env.production  # or use your preferred editor
```

**Required variables to update:**

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `EMAIL_FROM_2` - Your Gmail address for notifications
- `GMAIL_APP_PASSWORD` - Your Gmail app password

### 2. Build Containers

```bash
docker compose --env-file .env.production -f docker-compose.production.yml build
```

### 3. Run Application

```bash
docker compose --env-file .env.production -f docker-compose.production.yml up -d
```

## Access Points

After successful deployment, access your application at:

- **Frontend**: <http://localhost>
- **Backend API**: <http://localhost:3000>  
- **Health Check**: <http://localhost:3000/health>

## Container Architecture

The Docker setup consists of:

- **Frontend Container**: Nginx serving React app + reverse proxy to backend
- **Backend Container**: NestJS API server
- **Networking**: Frontend container proxies `/api/*` requests to backend container
- **Environment**: Variables passed via `.env.production` file

The `frontend/nginx.conf` file is **essential** - it serves the React app and proxies API calls to the backend container.

## Management Commands

### View Logs

```bash
# All services
docker compose -f docker-compose.production.yml logs -f

# Specific service
docker compose -f docker-compose.production.yml logs -f frontend
docker compose -f docker-compose.production.yml logs -f backend
```

### Stop Application

```bash
docker compose -f docker-compose.production.yml down
```

### Restart Services

```bash
# Restart all services
docker compose -f docker-compose.production.yml restart

# Restart specific service
docker compose -f docker-compose.production.yml restart frontend
docker compose -f docker-compose.production.yml restart backend
```

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose --env-file .env.production -f docker-compose.production.yml build
docker compose --env-file .env.production -f docker-compose.production.yml up -d
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 80 and 3000 are not in use by other applications
2. **Environment variables**: Verify all required variables are set in `.env.production`
3. **Docker permissions**: Ensure your user has permission to run Docker commands

### Debug Mode

```bash
# Run with debug output
docker compose --env-file .env.production -f docker-compose.production.yml up

# Check container status
docker compose -f docker-compose.production.yml ps

# Inspect specific container
docker compose -f docker-compose.production.yml exec frontend sh
docker compose -f docker-compose.production.yml exec backend sh
```

## Production Considerations

- **Reverse Proxy**: Consider using a reverse proxy like Nginx or Traefik for SSL termination
- **Environment Variables**: Store sensitive variables securely (e.g., Docker secrets, external key management)
- **Monitoring**: Set up logging and monitoring for production deployments
- **Backups**: Ensure your Supabase database is properly backed up
- **Updates**: Plan for zero-downtime deployments using rolling updates

## Related Documentation

- [Setup Script Guide](scripts/setup.md) - Detailed setup script documentation
- [Development Cycle](development-cycle.md) - Git workflow and development process
- [Default Deployment](default-deployment.md) - Alternative deployment methods
