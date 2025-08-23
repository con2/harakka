# Frontend-only Dockerfile for microservice architecture
FROM node:20-alpine AS builder

# Declare build arguments that will be passed from docker-compose
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL

# Set environment variables for the build process
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app

# Copy common package first
COPY common/ ./common/
WORKDIR /app/common
RUN npm install && npm run build 2>/dev/null || echo "No build script for common"

# Copy frontend package files
WORKDIR /app
COPY frontend/package*.json ./frontend/
COPY package*.json ./

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Copy frontend source
COPY frontend/ ./
COPY common/ ../common/

# Build frontend
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built frontend
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Create a default nginx config with SPA fallback and /api reverse proxy
RUN cat > /etc/nginx/nginx.conf <<'NGINXCONF'
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events { worker_connections 1024; }

http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;
  sendfile      on;
  keepalive_timeout  65;
  gzip on;

  server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html index.htm;

    # Frontend SPA: fallback to index.html
    location / {
      try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to the backend service (Compose service name "backend")
    location /api/ {
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_read_timeout 60s;
      proxy_send_timeout 60s;
      proxy_pass http://backend:3000/;
    }
  }
}
NGINXCONF

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]
