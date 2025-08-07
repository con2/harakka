#!/bin/bash
# Build script for Docker images

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="booking-app"
REGISTRY_URL="${REGISTRY_URL:-your-registry.azurecr.io}"  # Update with your ACR
TAG="${TAG:-latest}"
FULL_IMAGE="${REGISTRY_URL}/${IMAGE_NAME}:${TAG}"

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

# Optional: Build separate frontend and backend images for microservice architecture
read -p "Build separate frontend and backend images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
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
echo -e "${GREEN}Build process complete!${NC}"
echo "Next steps:"
echo "1. Push to your container registry: docker push ${FULL_IMAGE}"
echo "2. Deploy using one of the methods in DEPLOYMENT.md"
