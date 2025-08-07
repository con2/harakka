#!/bin/bash

# Setup script for Full-Stack Storage and Booking App
# This script helps set up the environment for deployment

set -e

echo "🚀 Full-Stack Storage and Booking App - Setup Script"
echo "=================================================="

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "📄 Creating .env.production from template..."
    cp .env.production.template .env.production
    echo "✅ .env.production created from template"
    echo ""
    echo "❗ IMPORTANT: Please edit .env.production with your actual credentials before proceeding!"
    echo "   You need to fill in:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_ANON_KEY" 
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - SUPABASE_JWT_SECRET"
    echo "   - Gmail configuration (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, etc.)"
    echo ""
    read -p "Press Enter after you've updated .env.production with your credentials..."
else
    echo "✅ .env.production already exists"
fi

# Validate required environment variables
echo "🔍 Validating environment variables..."

if ! grep -q "YOUR_SUPABASE_URL\|https://.*\.supabase\.co" .env.production; then
    echo "❌ SUPABASE_URL not configured properly"
    exit 1
fi

if grep -q "YOUR_SUPABASE_ANON_KEY" .env.production; then
    echo "❌ SUPABASE_ANON_KEY not configured"
    exit 1
fi

if grep -q "YOUR_GMAIL_CLIENT_ID" .env.production; then
    echo "❌ Gmail configuration not complete"
    exit 1
fi

echo "✅ Environment variables appear to be configured"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Load environment variables for Docker Compose
export $(grep -v '^#' .env.production | xargs)

echo ""
echo "🏗️  Building Docker container..."
if docker-compose -f docker-compose.production.yml build; then
    echo "✅ Container built successfully"
else
    echo "❌ Container build failed"
    exit 1
fi

echo ""
echo "🚀 Would you like to start the application now? (y/n)"
read -p "Start application: " start_app

if [[ $start_app =~ ^[Yy]$ ]]; then
    echo "🚀 Starting the application..."
    docker-compose -f docker-compose.production.yml up -d
    
    echo ""
    echo "⏳ Waiting for services to start up..."
    sleep 5
    
    # Check if services are running
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Backend is healthy"
    else
        echo "⚠️  Backend may still be starting up"
    fi
    
    echo ""
    echo "🎉 Application is starting up!"
    echo ""
    echo "📱 Access points:"
    echo "   - Frontend: http://localhost"
    echo "   - Backend API: http://localhost:3000" 
    echo "   - Health Check: http://localhost:3000/health"
    echo ""
    echo "📊 To view logs: docker-compose -f docker-compose.production.yml logs -f"
    echo "🛑 To stop: docker-compose -f docker-compose.production.yml down"
else
    echo ""
    echo "🎉 Setup complete! You can start the application manually with:"
    echo "   export \$(grep -v '^#' .env.production | xargs)"
    echo "   docker-compose -f docker-compose.production.yml up -d"
    echo ""
    echo "📱 Then access:"
    echo "   - Frontend: http://localhost"
    echo "   - Backend API: http://localhost:3000" 
    echo "   - Health Check: http://localhost:3000/health"
fi
echo ""
echo "🔒 Security reminder:"
echo "   - Never commit .env.production to version control"
echo "   - Use secure methods to inject environment variables in production"
echo "   - Regularly rotate your credentials"
