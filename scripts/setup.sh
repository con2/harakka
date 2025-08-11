#!/bin/bash

# Simple setup script for Full-Stack Storage and Booking App
# Creates and validates .env.production file

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

echo "🚀 Full-Stack Storage and Booking App - Setup"
echo "============================================="
echo ""
echo "Choose your setup method:"
echo "1. Docker containerized deployment (uses .env.production)"
echo "2. Local development (uses .env.local)"
echo ""
read -p "Enter choice (1 or 2): " setup_choice

case $setup_choice in
  1)
    ENV_FILE=".env.production"
    TEMPLATE_FILE=".env.production.template"
    echo "� Setting up for Docker deployment..."
    ;;
  2)
    ENV_FILE=".env.local"
    TEMPLATE_FILE=".env.local.template"
    echo "💻 Setting up for local development..."
    ;;
  *)
    echo "❌ Invalid choice. Please run the script again and choose 1 or 2."
    exit 1
    ;;
esac

echo ""

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
	echo "📄 Creating $ENV_FILE from template..."
	if [ ! -f "$TEMPLATE_FILE" ]; then
		echo "❌ $TEMPLATE_FILE not found!"
		exit 1
	fi
	
	cp "$TEMPLATE_FILE" "$ENV_FILE"
	echo "✅ $ENV_FILE created from template"
	echo ""
	echo -e "${YELLOW}❗ IMPORTANT: Please edit $ENV_FILE with your actual credentials!${RESET}"
	echo "   Required variables to update:"
	echo "   - SUPABASE_URL"
	echo "   - SUPABASE_ANON_KEY" 
	echo "   - SUPABASE_SERVICE_ROLE_KEY"
	echo "   - EMAIL_FROM_2 (your Gmail)"
	echo "   - GMAIL_APP_PASSWORD"
	echo ""
	read -p "Press Enter after you've updated $ENV_FILE..."
else
	echo "✅ $ENV_FILE already exists"
fi

# Validate required environment variables
echo "🔍 Validating environment variables..."

# Function to check if a variable is set and not a template value
check_env_var() {
  local var_name="$1"
  local env_file="$2"
  local var_value=$(grep "^$var_name=" "$env_file" | cut -d'=' -f2-)
  
  if [ -z "$var_value" ] || [[ "$var_value" =~ ^YOUR_ ]]; then
    echo "❌ $var_name is not configured (value: '$var_value')"
    return 1
  else
    echo "✅ $var_name is configured"
    return 0
  fi
}

# Check required variables
failed_vars=0
check_env_var "SUPABASE_URL" "$ENV_FILE" || ((failed_vars++))
check_env_var "SUPABASE_ANON_KEY" "$ENV_FILE" || ((failed_vars++))
check_env_var "SUPABASE_SERVICE_ROLE_KEY" "$ENV_FILE" || ((failed_vars++))
check_env_var "EMAIL_FROM_2" "$ENV_FILE" || ((failed_vars++))
check_env_var "GMAIL_APP_PASSWORD" "$ENV_FILE" || ((failed_vars++))

if [ $failed_vars -gt 0 ]; then
  echo ""
  echo "❌ Found $failed_vars unconfigured variables in $ENV_FILE"
  echo "Please update these values before building the application."
  exit 1
fi

echo ""
echo -e "${GREEN}🎉 Setup complete! Environment is configured.${RESET}"
echo ""

if [ "$setup_choice" = "1" ]; then
  echo -e "${CYAN}Next steps for Docker:${RESET}"
  echo "1. Build:  docker compose --env-file .env.production -f docker-compose.production.yml build"
  echo "2. Run:    docker compose --env-file .env.production -f docker-compose.production.yml up -d"
  echo ""
  echo -e "${YELLOW}Access points after running:${RESET}"
  echo "   - Frontend: http://localhost"
  echo "   - Backend API: http://localhost:3000" 
  echo "   - Health Check: http://localhost:3000/health"
else
  echo -e "${CYAN}Next steps for local development:${RESET}"
  echo "1. Install dependencies: npm run install-all"
  echo "2. Run frontend: cd frontend && npm run dev"
  echo "3. Run backend: cd backend && npm run start:dev"
  echo ""
  echo -e "${YELLOW}Access points after running:${RESET}"
  echo "   - Frontend: http://localhost:5180"
  echo "   - Backend API: http://localhost:3000"
fi
echo ""
echo -e "${YELLOW}Useful commands:${RESET}"
echo "   - View logs: docker compose -f docker-compose.production.yml logs -f"
echo "   - Stop: docker compose -f docker-compose.production.yml down"
