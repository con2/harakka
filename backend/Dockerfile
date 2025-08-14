# Backend-only Dockerfile for microservice architecture

# Stage 1: Build common dependencies
FROM node:20-alpine AS common-builder
WORKDIR /app
COPY common/ ./common/
WORKDIR /app/common
RUN npm install
# Create a simple index.js for the common module
RUN echo "// Common module exports" > index.js
RUN echo "module.exports = {};" >> index.js

# Stage 2: Build backend
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

# Stage 3: Production runtime
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init wget

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# Copy built application
COPY --from=backend-builder --chown=nestjs:nodejs /app/backend/dist ./dist
COPY --from=backend-builder --chown=nestjs:nodejs /app/backend/node_modules ./node_modules
COPY --from=backend-builder --chown=nestjs:nodejs /app/backend/package*.json ./
COPY --from=common-builder --chown=nestjs:nodejs /app/common ./common

# Switch to non-root user
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/backend/src/main.js"]
