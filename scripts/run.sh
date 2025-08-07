#!/bin/bash

# Quick run script for the containerized application
# This script loads environment variables and starts the application

set -e

echo "🚀 Starting Full-Stack Storage and Booking App"
echo "============================================="

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production not found. Please run ./setup.sh first."
    exit 1
fi

# Load environment variables
echo "📋 Loading environment variables..."
export $(grep -v '^#' .env.production | xargs)
echo "✅ Environment variables loaded"

# Start the application
echo "🚀 Starting containers..."
docker-compose -f docker-compose.production.yml up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Health check
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Application is running!"
else
    echo "⚠️  Services may still be starting up..."
fi

echo ""
echo "📱 Access points:"
echo "   - Frontend: http://localhost"
echo "   - Backend API: http://localhost:3000"
echo "   - Health Check: http://localhost:3000/health"
echo ""
echo "📊 Useful commands:"
echo "   - View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "   - Stop app: docker-compose -f docker-compose.production.yml down"
echo "   - Restart: docker-compose -f docker-compose.production.yml restart"
