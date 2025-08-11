# Scripts Directory

This directory contains setup scripts for the Full-Stack Storage and Booking App.

## Quick Start (Recommended)

The containerized app only needs **2 simple commands** after initial setup:

### First time setup

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Build and run

```bash
# Build the containers
docker compose --env-file .env.production -f docker-compose.production.yml build

# Run the application  
docker compose --env-file .env.production -f docker-compose.production.yml up -d
```

## Available Scripts

- **`setup.sh`** - Creates `.env.production` from template and validates configuration

## Manual Commands (no scripts needed)

You can also run everything manually without any scripts:

### 1. Setup environment file

```bash
cp .env.production.template .env.production
# Edit .env.production with your actual values
```

### 2. Build

```bash
docker compose --env-file .env.production -f docker-compose.production.yml build
```

### 3. Run

```bash
docker compose --env-file .env.production -f docker-compose.production.yml up -d
```

## Access Points

After running, access your application at:

- **Frontend**: <http://localhost>
- **Backend API**: <http://localhost:3000>  
- **Health Check**: <http://localhost:3000/health>

## Useful Commands

```bash
# View logs
docker compose -f docker-compose.production.yml logs -f

# Stop application
docker compose -f docker-compose.production.yml down

# Restart specific service
docker compose -f docker-compose.production.yml restart frontend
docker compose -f docker-compose.production.yml restart backend
```

## How the Multi-Container Setup Works

- **Frontend Container**: Nginx serving React app + proxy to backend
- **Backend Container**: NestJS API server
- **Networking**: Frontend proxies `/api/*` requests to backend container
- **Environment**: Variables passed via `.env.production` file

The `frontend/nginx.conf` file is **essential** - it serves the React app and proxies API calls to the backend container.

## Prerequisites

- Docker and Docker Compose installed
- `.env.production` file with your actual credentials (created by `setup.sh`)
