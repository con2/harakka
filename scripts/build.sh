#!/bin/bash
# Build script for Docker images

set -e

# ---------- Colors ----------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'
NC=$RESET  # Back‑compat
# -----------------------------

# ---------- Usage ----------
usage() {
  echo ""
  echo "Usage: $(basename "$0") [--separate] [-h|--help]"
  echo ""
  echo "Options:"
  echo "  --separate   Build separate frontend and backend images."
  echo "  -h, --help   Show this help message and exit."
  echo ""
}
# ---------------------------

# Load environment variables if .env.production exists
if [ -f ".env.production" ]; then
	echo -e "${YELLOW}📋 Loading environment variables from .env.production...${NC}"
	set -a # automatically export all variables
	source .env.production
	set +a # disable automatic export
	echo -e "${GREEN}✅ Environment variables loaded${NC}"

	# Show key frontend variables
	echo -e "${CYAN}🔧 Frontend build variables:${RESET}"
	echo -e "   - VITE_SUPABASE_URL: ${BLUE}${VITE_SUPABASE_URL}${RESET}"
	echo -e "   - VITE_API_URL: ${BLUE}${VITE_API_URL:-http://localhost:3000}${RESET}"
	echo ""
else
	echo -e "${YELLOW}⚠️  No .env.production found. Frontend variables may not be configured.${NC}"
	echo "   Run ./scripts/setup.sh first to configure environment variables."
	echo ""
fi

# Configuration
IMAGE_NAME="booking-app"
REGISTRY_URL="${REGISTRY_URL:-your-registry.azurecr.io}" # Update with your ACR
TAG="${TAG:-latest}"
FULL_IMAGE="${REGISTRY_URL}/${IMAGE_NAME}:${TAG}"

# Parse command line arguments
BUILD_SEPARATE=false

case "$1" in
  --separate)
    BUILD_SEPARATE=true
    echo -e "${YELLOW}🔄 Separate build mode enabled${RESET}"
    ;;
  -h|--help)
    usage
    exit 0
    ;;
  "" )
    ;;  # no arguments; continue
  *)
    echo -e "${RED}❌ Unknown option: $1${RESET}"
    usage
    exit 1
    ;;
esac

echo -e "${GREEN}Building Full-Stack Booking App Docker Image${NC}"
echo "Image: ${FULL_IMAGE}"
echo ""

# Build the main application image
echo -e "${YELLOW}Building application image...${NC}"
docker build -t "${FULL_IMAGE}" .

if [ $? -eq 0 ]; then
	echo -e "${GREEN}✅ Build successful!${NC}"
else
	echo -e "${RED}❌ Build failed!${NC}"
	exit 1
fi

# Build separate images if requested or ask user
if [ "$BUILD_SEPARATE" = true ]; then
	REPLY="y"
else
	read -p "Build separate frontend and backend images? (y/N): " -n 1 -r
	echo
fi

if [[ $REPLY =~ ^[Yy]$ ]] || [ "$BUILD_SEPARATE" = true ]; then
	echo -e "${YELLOW}Building frontend image...${NC}"
	docker build -t "${REGISTRY_URL}/${IMAGE_NAME}-frontend:${TAG}" -f frontend/Dockerfile .

	echo -e "${YELLOW}Building backend image...${NC}"
	docker build -t "${REGISTRY_URL}/${IMAGE_NAME}-backend:${TAG}" -f backend/Dockerfile .
fi

# Push to registry
read -p "Push images to registry? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
	echo -e "${YELLOW}Pushing images to registry...${NC}"

	# Login to registry (uncomment the appropriate line)
	# az acr login --name your-registry  # For Azure Container Registry
	# docker login ${REGISTRY_URL}       # For other registries

	docker push "${FULL_IMAGE}"

	if docker image ls | grep -q "${IMAGE_NAME}-frontend"; then
		docker push "${REGISTRY_URL}/${IMAGE_NAME}-frontend:${TAG}"
	fi

	if docker image ls | grep -q "${IMAGE_NAME}-backend"; then
		docker push "${REGISTRY_URL}/${IMAGE_NAME}-backend:${TAG}"
	fi

	echo -e "${GREEN}✅ Images pushed successfully!${NC}"
fi

echo ""
echo -e "${GREEN}Build process complete!${RESET}"
echo -e "${CYAN}Next steps:${RESET}"
echo "1. Push to your container registry: docker push ${FULL_IMAGE}"
echo "2. Deploy using one of the methods in DEPLOYMENT.md"
