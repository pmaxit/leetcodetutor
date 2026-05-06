#!/bin/bash

# 🚀 AI Interview Platform - Docker Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🚀 AI Interview Platform - Docker Deployment             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Docker
if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Determine which docker compose command to use
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker compose"
elif command_exists docker-compose; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Verify configuration
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo -e "${YELLOW}Please create a .env file based on the examples provided.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment file found${NC}"

# Stop and remove any existing containers from this project
echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🛑 Stopping any existing containers...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

if $DOCKER_COMPOSE_CMD ps 2>/dev/null | grep -q "machine-learning"; then
    echo -e "${YELLOW}Found running containers, stopping...${NC}"
    $DOCKER_COMPOSE_CMD down --remove-orphans 2>/dev/null || true
    sleep 2
    echo -e "${GREEN}✅ Containers stopped${NC}"
else
    echo -e "${GREEN}✅ No existing containers found${NC}"
fi

# Kill any lingering processes on ports 3005 and 5173
if command -v lsof >/dev/null 2>&1; then
    for PORT in 3005 5173; do
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  Process still using port $PORT, forcing termination...${NC}"
            lsof -ti :$PORT | xargs kill -9 2>/dev/null || true
            sleep 1
        fi
    done
fi
echo -e "${GREEN}✅ Ports 3005 and 5173 ready${NC}"

# Build and start the container
echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔨 Building and Starting Docker Container${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

echo "Running: $DOCKER_COMPOSE_CMD up --build -d"
$DOCKER_COMPOSE_CMD up --build -d

echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

echo "📱 Access Points:"
echo "  Application:      http://localhost:3005"
echo ""
echo "📝 Useful Commands:"
echo "  View Logs:        $DOCKER_COMPOSE_CMD logs -f"
echo "  Stop Services:    $DOCKER_COMPOSE_CMD down"
echo "  Restart Services: $DOCKER_COMPOSE_CMD restart"
echo ""
echo -e "${YELLOW}Wait a few seconds for the server to fully start up.${NC}"
