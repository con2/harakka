#!/bin/bash

# Test Branch Setup Script
# This script helps set up and manage the test branch environment

set -e

echo "🧪 Test Branch Environment Setup"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're on the test branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "test/supabase-changes" ]; then
    print_warning "Current branch: $current_branch"
    echo "Switching to test branch..."
    git checkout test/supabase-changes
fi

print_status "On test branch: test/supabase-changes"

# Check if Supabase is running
echo "Checking Supabase status..."
if ! supabase status &>/dev/null; then
    print_warning "Supabase not running. Starting services..."
    
    # Try to start Supabase
    if supabase start; then
        print_status "Supabase services started"
    else
        print_error "Failed to start Supabase services"
        echo "You may need to:"
        echo "1. Start Docker Desktop"
        echo "2. Check port conflicts"
        echo "3. Run 'supabase stop' first"
        exit 1
    fi
else
    print_status "Supabase is running"
fi

# Apply test migrations
echo "Applying test migrations..."
if supabase db reset; then
    print_status "Test migrations applied successfully"
else
    print_error "Failed to apply migrations"
    exit 1
fi

# Show available test features
echo ""
echo "🧪 Test Features Available:"
echo "=========================="
echo "1. test_features table - Feature flag management"
echo "2. Enhanced storage_items with test columns"
echo "3. Test analytics functions"
echo "4. Test metadata triggers"
echo "5. Test analytics view"
echo ""

# Show connection info
echo "🔗 Connection Information:"
echo "========================="
supabase status | grep -E "(API URL|DB URL|Studio URL)"

echo ""
print_status "Test environment is ready!"
echo ""
echo "💡 Next steps:"
echo "- Open Supabase Studio to view test tables"
echo "- Run test queries in backend/test_queries.sql"
echo "- Test your application with new features"
echo ""
echo "To rollback test changes:"
echo "  git checkout main"
echo "  supabase db reset"
