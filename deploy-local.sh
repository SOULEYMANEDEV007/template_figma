#!/bin/bash
set -e

# Configuration
APP_NAME="classroom-frontend"
SERVER_IP="185.126.82.162"
SERVER_USER="devciplus"
LOCAL_BUILD_DIR=".next"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting local build and package for ${APP_NAME}...${NC}"

# Verify environment file
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production file not found!${NC}"
    exit 1
fi

# Build the application locally
echo -e "${BLUE}📦 Building application...${NC}"
pnpm run build || { echo -e "${RED}❌ Build failed${NC}"; exit 1; }

# Run linting and formatting checks
echo -e "${BLUE}🔍 Running code quality checks...${NC}"
# pnpm run lint || echo -e "${YELLOW}⚠️  Linting completed with warnings${NC}"
pnpm run format || echo -e "${YELLOW}⚠️  Formatting check completed${NC}"

# Run security checks
echo -e "${BLUE}🔍 Running security checks...${NC}"
pnpm audit --audit-level moderate || echo -e "${YELLOW}⚠️  Security audit completed with warnings${NC}"

# Create deployment package
echo -e "${BLUE}📋 Creating deployment package...${NC}"
mkdir -p deploy
cp -r ${LOCAL_BUILD_DIR} deploy/
cp -r public deploy/
cp package.json pnpm-lock.yaml next.config.ts deploy/
cp middleware.ts deploy/
cp ecosystem.config.js deploy/
cp .env.production deploy/
cp -r messages deploy/ 2>/dev/null || echo "No messages directory to copy"

# Create deployment archive
echo -e "${BLUE}📦 Creating deployment archive...${NC}"
tar -czf deploy.tar.gz -C deploy . || { echo -e "${RED}❌ Archive creation failed${NC}"; exit 1; }

# Upload to server
echo -e "${BLUE}⬆️  Uploading to server...${NC}"
scp deploy.tar.gz ${SERVER_USER}@${SERVER_IP}:~/ || { echo -e "${RED}❌ Upload failed${NC}"; exit 1; }

# Upload server deployment script
echo -e "${BLUE}📋 Uploading server deployment script...${NC}"
scp deploy-server.sh ${SERVER_USER}@${SERVER_IP}:~/ || { echo -e "${RED}❌ Server script upload failed${NC}"; exit 1; }

# Clean up local files
echo -e "${BLUE}🧹 Cleaning up local deployment files...${NC}"
rm -rf deploy deploy.tar.gz

echo -e "${GREEN}✅ Local build and upload completed!${NC}"
echo -e "${BLUE}🔧 Next steps:${NC}"
echo -e "${BLUE}1. SSH to server: ssh ${SERVER_USER}@${SERVER_IP}${NC}"
echo -e "${BLUE}2. Run server deployment: chmod +x ~/deploy-server.sh && ~/deploy-server.sh${NC}"