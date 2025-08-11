# Multi-stage Dockerfile for Full-Stack Booking App
# This builds both frontend and backend in a single container for AKS deployment

# Stage 1: Build common dependencies
FROM node:20-alpine AS common-builder
WORKDIR /app
COPY common/ ./common/
WORKDIR /app/common
RUN npm install
# Create a simple index.js for the common module
RUN echo "// Common module exports" > index.js
RUN echo "module.exports = {};" >> index.js

# Stage 2: Build the frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Build arguments for frontend environment variables
# Note: ANON_KEY and URL are public by design (visible in frontend JS)
# hadolint ignore=DL3059
ARG VITE_SUPABASE_URL
# hadolint ignore=DL3059
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL

# Make them available as environment variables during build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
# hadolint ignore=DL3059
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_API_URL=$VITE_API_URL

# Copy common package first
COPY --from=common-builder /app/common ./common

# Copy frontend package files
COPY frontend/package*.json ./frontend/
COPY package*.json ./

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Copy frontend source
COPY frontend/ ./
COPY common/ ../common/

# Build frontend
RUN npm run build && echo "✅ Frontend build completed successfully!"
RUN echo "📁 Frontend dist contents:" && ls -la dist/

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

# Stage 3: Build the backend
FROM node:20-alpine AS backend-builder
WORKDIR /app

# Copy common package first
COPY --from=common-builder /app/common ./common

# Copy backend package files
COPY backend/package*.json ./backend/
COPY package*.json ./

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Copy backend source
COPY backend/ ./
COPY common/ ../common/

# Build backend
RUN npm run build && echo "✅ Backend build completed successfully!"
RUN echo "📁 Backend dist contents:" && ls -la dist/

# Stage 4: Production runtime
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# Copy built applications
COPY --from=backend-builder --chown=nestjs:nodejs /app/backend/dist ./backend/dist
COPY --from=backend-builder --chown=nestjs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder --chown=nestjs:nodejs /app/backend/package*.json ./backend/
COPY --from=frontend-builder --chown=nestjs:nodejs /app/frontend/dist ./frontend/dist
COPY --from=common-builder --chown=nestjs:nodejs /app/common ./common

# Copy production package.json
COPY --chown=nestjs:nodejs package*.json ./

# Install serve for frontend (lightweight static server)
RUN npm install -g serve

# Create startup script
COPY --chown=nestjs:nodejs <<'EOF' /app/start.sh
#!/bin/sh
set -e

echo "🚀 Starting Full-Stack Booking App..."
echo ""

# Print environment information
echo "📋 Environment Information:"
echo "  - NODE_ENV: $NODE_ENV"
echo "  - PORT: $PORT"
echo "  - SUPABASE_URL: $(echo $SUPABASE_URL | cut -c1-30)..." # Only show first 30 chars for security
echo "  - JWT_SECRET: $(if [ -n "$JWT_SECRET" ]; then echo '[SET]'; else echo '[NOT SET]'; fi)"
echo "  - ALLOWED_ORIGINS: $ALLOWED_ORIGINS"
echo ""

# Check if critical files exist
echo "📁 Checking application files:"
if [ -d "frontend/dist" ]; then
    echo "  ✅ Frontend dist directory exists"
    echo "     Frontend files: $(ls frontend/dist | wc -l) files"
else
    echo "  ❌ Frontend dist directory missing"
fi

if [ -f "backend/dist/backend/src/main.js" ]; then
    echo "  ✅ Backend main.js exists"
else
    echo "  ❌ Backend main.js missing"
    echo "     Backend dist structure:"
    find backend/dist -name "*.js" | head -5
fi

if [ -d "common" ]; then
    echo "  ✅ Common directory exists"
else
    echo "  ❌ Common directory missing"
fi
echo ""

# Start frontend server in background
echo "🌐 Starting frontend server on port 3001..."
serve -s frontend/dist -p 3001 &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"

# Start backend server
echo "⚙️  Starting backend server on port 3000..."
cd backend
echo "  Current directory: $(pwd)"
echo "  Node version: $(node --version)"
echo "  Starting backend with: node dist/backend/src/main.js"

# Set NODE_PATH to help with module resolution
export NODE_PATH="/app/common:/app/backend/node_modules:$NODE_PATH"
echo "  NODE_PATH: $NODE_PATH"

exec node dist/backend/src/main.js &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"

echo ""
echo "🎉 Both services started! Waiting for processes..."
echo "  - Frontend: http://localhost:3001 (PID: $FRONTEND_PID)"
echo "  - Backend:  http://localhost:3000 (PID: $BACKEND_PID)"

# Wait for any process to exit
wait $FRONTEND_PID $BACKEND_PID
EOF

RUN chmod +x /app/start.sh

# Switch to non-root user
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Expose ports
EXPOSE 3000 3001

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/start.sh"]
