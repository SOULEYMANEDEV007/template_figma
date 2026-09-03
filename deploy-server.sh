#!/bin/bash
set -e

# Configuration
APP_NAME="classroom-frontend"
SERVER_PATH="/var/www/${APP_NAME}"
DOMAIN="ecole.ebene.ci"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting server deployment of ${APP_NAME}...${NC}"

# Check if deployment package exists
if [ ! -f "./deploy.tar.gz" ]; then
    echo -e "${RED}❌ deploy.tar.gz not found! Run deploy-local.sh first.${NC}"
    exit 1
fi

echo -e "${BLUE}🔄 Creating backup of current version...${NC}"
if [ -d ${SERVER_PATH} ]; then
    timestamp=$(date +%Y%m%d_%H%M%S)
    sudo mkdir -p ${SERVER_PATH}_backups
    sudo tar -czf ${SERVER_PATH}_backups/backup_${timestamp}.tar.gz -C ${SERVER_PATH} . 2>/dev/null || echo 'Backup failed, continuing...'

    # Keep only last 5 backups
    sudo find ${SERVER_PATH}_backups -name 'backup_*.tar.gz' -type f | sort -r | tail -n +6 | xargs sudo rm -f
fi

echo -e "${BLUE}📂 Preparing deployment directory...${NC}"
sudo mkdir -p ${SERVER_PATH}
sudo tar -xzf ~/deploy.tar.gz -C ${SERVER_PATH}

echo -e "${BLUE}🔐 Setting permissions...${NC}"
sudo chown -R $USER:$USER ${SERVER_PATH}
sudo chmod -R 755 ${SERVER_PATH}

echo -e "${BLUE}📝 Creating log directories...${NC}"
sudo mkdir -p /var/log/${APP_NAME}
sudo chown $USER:$USER /var/log/${APP_NAME}

echo -e "${BLUE}📦 Installing production dependencies...${NC}"
cd ${SERVER_PATH}
# Install pnpm if not available
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}Installing pnpm...${NC}"
    npm install -g pnpm
fi

pnpm install --prod --frozen-lockfile

echo -e "${BLUE}🔄 Setting up PM2...${NC}"
# Install PM2 if not available
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    npm install -g pm2
fi

pm2 delete ${APP_NAME} 2>/dev/null || echo 'App not running yet'
pm2 start ecosystem.config.js
pm2 save

echo -e "${BLUE}🧹 Cleaning up...${NC}"
rm ~/deploy.tar.gz
rm ~/deploy-server.sh

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}📊 Application status:${NC}"
pm2 status ${APP_NAME}

# Verify deployment
echo -e "${BLUE}🔍 Verifying deployment...${NC}"
sleep 5
curl -f -s "https://${DOMAIN}" > /dev/null && echo -e "${GREEN}✅ Website is accessible${NC}" || echo -e "${YELLOW}⚠️  Website check failed${NC}"

echo -e "${GREEN}🎉 Deployment process completed!${NC}"
echo -e "${GREEN}🌐 Visit: https://${DOMAIN}${NC}"
echo -e "${BLUE}📊 To check application status: pm2 status${NC}"
echo -e "${BLUE}📋 To view logs: pm2 logs ${APP_NAME}${NC}"
echo -e "${BLUE}🔄 To restart: pm2 restart ${APP_NAME}${NC}"