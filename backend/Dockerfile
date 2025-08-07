# Backend-only Dockerfile for microservice architecture
FROM node:20-alpine AS builder

WORKDIR /app

# Stage 1: Build common dependencies
FROM node:20-alpine AS common-builder
WORKDIR /app
COPY common/ ./common/
WORKDIR /app/common
RUN npm install
# Create a simple index.js for the common module
RUN echo "// Common module exports" > index.js
RUN echo "module.exports = {};" >> index.js

# Copy backend package files
WORKDIR /app
COPY backend/package*.json ./backend/
COPY package*.json ./

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Copy backend source
COPY backend/ ./
COPY common/ ../common/

# Build backend
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init wget

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/backend/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/backend/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/backend/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/common ../common

# Switch to non-root user
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "-r", "../common", "dist/backend/src/main.js"]
