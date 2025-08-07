# Frontend-only Dockerfile for microservice architecture
FROM node:20-alpine AS builder

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

# Copy nginx configuration if it exists
RUN if [ -f "../nginx.conf" ]; then cp ../nginx.conf /etc/nginx/nginx.conf; fi

# Create a simple nginx config if none exists
RUN if [ ! -f /etc/nginx/nginx.conf ]; then \
  echo 'events { worker_connections 1024; }' > /etc/nginx/nginx.conf && \
  echo 'http {' >> /etc/nginx/nginx.conf && \
  echo '  include /etc/nginx/mime.types;' >> /etc/nginx/nginx.conf && \
  echo '  default_type application/octet-stream;' >> /etc/nginx/nginx.conf && \
  echo '  server {' >> /etc/nginx/nginx.conf && \
  echo '    listen 80;' >> /etc/nginx/nginx.conf && \
  echo '    server_name localhost;' >> /etc/nginx/nginx.conf && \
  echo '    root /usr/share/nginx/html;' >> /etc/nginx/nginx.conf && \
  echo '    index index.html index.htm;' >> /etc/nginx/nginx.conf && \
  echo '    location / {' >> /etc/nginx/nginx.conf && \
  echo '      try_files $uri $uri/ /index.html;' >> /etc/nginx/nginx.conf && \
  echo '    }' >> /etc/nginx/nginx.conf && \
  echo '  }' >> /etc/nginx/nginx.conf && \
  echo '}' >> /etc/nginx/nginx.conf; \
fi

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]
