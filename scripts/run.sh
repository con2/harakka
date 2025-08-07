#!/bin/bash

# Quick run script for the containerized application
# This script loads environment variables and starts the application

set -e

# Parse command line arguments
REBUILD=false
if [[ "$1" == "--rebuild" ]]; then
    REBUILD=true
    echo "🔄 Rebuild mode enabled"
fi

echo "🚀 Starting Full-Stack Storage and Booking App"
echo "============================================="

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production not found. Please run ./setup.sh first."
    exit 1
fi

# Load environment variables
echo "📋 Loading environment variables..."
set -a  # automatically export all variables
source .env.production
set +a  # disable automatic export
echo "✅ Environment variables loaded"

# Verify critical frontend variables are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Missing required frontend environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)"
    echo "   Please check your .env.production file"
    exit 1
fi

echo "🔧 Frontend variables configured:"
echo "   - VITE_SUPABASE_URL: $VITE_SUPABASE_URL"
echo "   - VITE_API_URL: ${VITE_API_URL:-http://localhost:3000}"

# Rebuild if requested
if [ "$REBUILD" = true ]; then
    echo ""
    echo "🏗️  Rebuilding application with current environment variables..."
    docker-compose -f docker-compose.production.yml build --no-cache
    echo "✅ Rebuild completed!"
fi

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
