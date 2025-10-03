#!/bin/bash

# Simple setup script for the App
# Creates and validates .env.local file

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

echo "🚀 Harakka App - Setup"
echo "============================================="
echo ""
echo "💻 Setting up for local development..."

ENV_FILE="../.env.local"
TEMPLATE_FILE="../.env.local.template"

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
  echo "   - SUPABASE_PROJECT_ID"
  echo "   - SUPABASE_SERVICE_ROLE_KEY"
  echo "   - SUPABASE_ANON_KEY"
  echo "   - SUPABASE_JWT_SECRET"
  echo "   - STORAGE_EMAIL"
  echo "   - STORAGE_EMAIL_PASSWORD"
  echo "   - CRON_SECRET"
  echo "   - CRON_URL"
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
check_env_var "SUPABASE_PROJECT_ID" "$ENV_FILE" || ((failed_vars++))
check_env_var "SUPABASE_SERVICE_ROLE_KEY" "$ENV_FILE" || ((failed_vars++))
check_env_var "SUPABASE_ANON_KEY" "$ENV_FILE" || ((failed_vars++))
check_env_var "SUPABASE_JWT_SECRET" "$ENV_FILE" || ((failed_vars++))
check_env_var "STORAGE_EMAIL" "$ENV_FILE" || ((failed_vars++))
check_env_var "STORAGE_EMAIL_PASSWORD" "$ENV_FILE" || ((failed_vars++))
check_env_var "CRON_SECRET" "$ENV_FILE" || ((failed_vars++))
check_env_var "CRON_URL" "$ENV_FILE" || ((failed_vars++))

if [ $failed_vars -gt 0 ]; then
  echo ""
  echo "❌ Found $failed_vars unconfigured variables in $ENV_FILE"
  echo "Please update these values before building the application."
  exit 1
fi

echo ""
echo -e "${GREEN}🎉 Setup complete! Environment is configured.${RESET}"
echo ""
echo -e "${CYAN}Next steps for local development:${RESET}"
echo "1. Install dependencies: npm run install-all"
echo "2. Run the app: npm run dev"
echo ""
echo -e "${YELLOW}Access points after running:${RESET}"
echo "   - Frontend: http://localhost:5180"
echo "   - Backend API: http://localhost:3000"
fi
echo ""
