# Scripts Directory

This directory conta## Requirements

- Docker and Docker Compose installed

## Script Flow Diagramployment and utility scripts for the Booking App.

## Available Scripts

- **`setup.sh`** - Initial setup script that creates environment files and builds containers
- **`run.sh`** - Quick script to start/restart the application  
- **`build.sh`** - Builds Docker images for production deployment

## Usage

### For Local Development with Docker

1. **First time setup:**
   ```bash
   ./scripts/setup.sh
   ```

2. **Start the application:**
   ```bash
   ./scripts/run.sh
   ```

3. **Build images manually:**
   ```bash
   ./scripts/build.sh
   ```

## Production Deployment

1. Build production images:

   ```bash
   ./scripts/build.sh
   ```

2. Deploy using methods outlined in DEPLOYMENT.md

## Prerequisites

### For Docker Development
- Docker and Docker Compose installed
- `.env.production` file (created by setup.sh)

### For Kubernetes Deployment
- Docker installed
- kubectl configured for your Azure AKS cluster
- Access to a container registry (Azure Container Registry recommended)
- `.env.production` file with production values

## Security Notes

- All scripts use the `.env.production` template system to avoid committing secrets to Git
- Kubernetes secrets are created dynamically from environment variables
- No sensitive information is stored in the repository

## Script Dependencies

```
setup.sh (creates .env.production)
├── run.sh (uses .env.production)  
└── build.sh (uses .env.production)
```

## Troubleshooting

- If scripts fail with permission errors, ensure they are executable: `chmod +x scripts/*.sh`
- If environment variables are missing, run `./scripts/setup.sh` again
- For deployment issues, check the methods in DEPLOYMENT.md
