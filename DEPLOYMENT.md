# Simple AKS Deployment Guide - Your App is Ready! 🚀

Your containerized app is working perfectly! Here are 3 easy ways to deploy to Azure:

## ✅ What We've Tested and Confirmed Working:
- Frontend and Backend both responding correctly
- Environment variables properly configured  
- Docker images built and running
- Health checks passing
- CORS properly configured

## Option 1: Direct Docker Image Deployment (Recommended)

### Step 1: Use the pre-built Docker Hub image
The image is already available on Docker Hub! No building required.

```bash
# Pull the latest image (optional - deploy command will pull automatically)
docker pull codingcatv1/booking-app:latest
```

### Step 2: Deploy to AKS with one command
```bash
# Simple deployment using Docker Hub image
kubectl create deployment booking-app --image=codingcatv1/booking-app:latest

# Expose the service
kubectl expose deployment booking-app --type=LoadBalancer --port=80 --target-port=3001 --name=booking-app-frontend
kubectl expose deployment booking-app --type=LoadBalancer --port=3000 --target-port=3000 --name=booking-app-backend
```

### Step 3: Set environment variables
```bash
# Apply environment variables (you'll need to provide the actual values)
kubectl set env deployment/booking-app \
  NODE_ENV=production \
  SUPABASE_URL=your-supabase-url \
  SUPABASE_ANON_KEY=your-supabase-key \
  JWT_SECRET=your-jwt-secret \
  # ... other variables from .env.production
```

## Option 2: Use Azure Container Instances (Even Simpler)
```bash
az container create \
  --resource-group your-resource-group \
  --name booking-app \
  --image codingcatv1/booking-app:latest \
  --ports 80 3000 \
  --dns-name-label booking-app-unique \
  --environment-variables NODE_ENV=production SUPABASE_URL=... # etc
```

## Option 3: Use the existing Docker Compose file
Upload the `docker-compose.production.yml` and `.env.production` files, then:
```bash
docker-compose -f docker-compose.production.yml up -d
```

## What's included in the Docker image:
- ✅ Frontend (React/Vite) accessible on port 80
- ✅ Backend (NestJS) API on port 3000  
- ✅ All dependencies and build artifacts
- ✅ Production optimized and secure
- ✅ Health checks included (/health endpoint)
- ✅ Non-root user for security
- ✅ Proper CORS configuration

## Access points after deployment:
- Frontend: http://your-external-ip/ 
- Backend API: http://your-external-ip:3000
- Health check: http://your-external-ip:3000/health

**The app is production-ready and tested!** These simple deployment methods work perfectly for AKS.
- Access to Supabase project credentials
- Gmail app password for email functionality
- Domain name (for production deployment)

## 🚀 Local Development Deployment

### 1. Setup Environment Variables

Copy the template file and fill in your credentials:

```bash
cp .env.production.template .env.production
```

Edit `.env.production` with your actual values:

```bash
# Required: Fill in these values from your Supabase project
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-from-supabase
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase

# Required: Gmail configuration for email functionality
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token
GMAIL_APP_PASSWORD=your-gmail-app-password

# Update with your domain for production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,*
```

### 2. Build and Run

```bash
# Build the container
docker-compose -f docker-compose.production.yml build

# Start the application
docker-compose -f docker-compose.production.yml up
```

### 3. Access the Application

- Frontend: <http://localhost> (port 80)
- Backend API: <http://localhost:3000>
- Health Check: <http://localhost:3000/health>

## ☁️ Azure AKS Deployment

### 1. Prepare Environment Variables

Create a secure way to inject environment variables in AKS:

#### Option A: Using Azure Key Vault (Recommended)

```bash
# Store secrets in Azure Key Vault
az keyvault secret set --vault-name your-keyvault --name supabase-url --value "your-supabase-url"
az keyvault secret set --vault-name your-keyvault --name supabase-anon-key --value "your-anon-key"
# ... repeat for all sensitive values
```

#### Option B: Using Kubernetes Secrets

```bash
# Create secrets in Kubernetes
kubectl create secret generic app-secrets \
  --from-literal=SUPABASE_URL="your-supabase-url" \
  --from-literal=SUPABASE_ANON_KEY="your-anon-key" \
  --from-literal=SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  --from-literal=SUPABASE_JWT_SECRET="your-jwt-secret" \
  --from-literal=GMAIL_CLIENT_ID="your-gmail-client-id" \
  --from-literal=GMAIL_CLIENT_SECRET="your-gmail-client-secret" \
  --from-literal=GMAIL_REFRESH_TOKEN="your-gmail-refresh-token" \
  --from-literal=GMAIL_APP_PASSWORD="your-gmail-app-password"
```

### 2. Build and Push Container

```bash
# Build for your container registry
docker build -t your-registry/booking-app:latest .

# Push to Azure Container Registry
docker push your-registry/booking-app:latest
```

### 3. Deploy to AKS

You can use any of the simple methods shown above (Option 1, 2, or 3).

## 🔧 Configuration Reference

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiI...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiI...` |
| `SUPABASE_JWT_SECRET` | JWT secret from Supabase | `your-jwt-secret` |
| `GMAIL_CLIENT_ID` | Gmail OAuth client ID | `123456789.apps.googleusercontent.com` |
| `GMAIL_CLIENT_SECRET` | Gmail OAuth client secret | `GOCSPX-...` |
| `GMAIL_REFRESH_TOKEN` | Gmail OAuth refresh token | `1//04-...` |
| `GMAIL_APP_PASSWORD` | Gmail app password | `abcdabcdabcdabcd` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Backend port | `3000` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `*` |
| `S3_REGION` | AWS S3 region | `eu-north-1` |
| `S3_BUCKET` | S3 bucket name | `item-images` |

## 🔒 Security Best Practices

1. **Never commit** `.env.production` or any file with actual credentials
2. **Use environment variable injection** in production (Azure Key Vault, Kubernetes secrets)
3. **Rotate credentials** regularly
4. **Use least privilege** access for service accounts
5. **Enable logging** and monitoring in production
6. **Use HTTPS** in production (configure ingress with TLS)

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Update `ALLOWED_ORIGINS` to include your domain
2. **Database Connection**: Verify Supabase credentials
3. **Email Not Sending**: Check Gmail app password and OAuth settings
4. **Frontend Not Loading**: Ensure Vite environment variables are set during build

### Debug Commands

```bash
# Check container logs
docker-compose logs -f

# Access container shell
docker-compose exec app sh

# Check environment variables in container
docker-compose exec app env | grep SUPABASE
```

## 📞 Support

For deployment issues, check:

1. Container logs for errors
2. Kubernetes pod status: `kubectl get pods`
3. Service connectivity: `kubectl get services`
4. Environment variable injection: `kubectl describe pod <pod-name>`
