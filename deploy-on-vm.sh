#!/bin/bash

# Deployment Script for GCP VM
# Run this on your GCP VM to set up and start the application

set -e

echo "🚀 AI Interview Platform - GCP VM Deployment"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if repo exists
if [ ! -d "interview-platform" ]; then
    echo -e "${BLUE}📦 Cloning repository...${NC}"
    git clone https://github.com/your-repo/interview-platform.git
fi

cd interview-platform

echo -e "${BLUE}🔄 Installing dependencies...${NC}"
npm install

echo -e "${BLUE}🔄 Installing client dependencies...${NC}"
cd client && npm install && cd ..

# Check .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Creating .env file...${NC}"
    cat > .env << 'EOF'
# LLM Configuration - Uses SSH tunnel to local LM Studio
LLM_BASE_URL=http://localhost:1234/v1
LLM_API_KEY=lm-studio
LLM_MODEL=google/gemma-3n-e4b

# Database (optional)
DB_HOST=35.224.79.154
DB_USER=test
DB_PASSWORD=test123
DB_NAME=neetcode_db
DB_DIALECT=mysql

# Server
PORT=3005
EOF
    echo -e "${GREEN}✅ .env created${NC}"
fi

# Test LM Studio connection
echo ""
echo -e "${BLUE}🔍 Testing LM Studio connection...${NC}"
if curl -s http://localhost:1234/v1/models | grep -q "google/gemma-3n-e4b"; then
    echo -e "${GREEN}✅ LM Studio is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  LM Studio not responding${NC}"
    echo "   Make sure SSH tunnel is active on your desktop:"
    echo "   ssh -R 1234:localhost:1234 USER@VM_IP -N"
    echo ""
fi

# Test Server Health
echo ""
echo -e "${BLUE}🏥 Checking server health...${NC}"
if timeout 5 npm run dev > /tmp/server.log 2>&1 &
then
    SERVER_PID=$!
    sleep 3

    if curl -s http://localhost:3005/api/health | grep -q "healthy"; then
        echo -e "${GREEN}✅ Server is healthy${NC}"
        kill $SERVER_PID 2>/dev/null || true
    else
        echo -e "${YELLOW}⚠️  Server responded but health check failed${NC}"
        kill $SERVER_PID 2>/dev/null || true
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment Ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  Verify SSH tunnel is active (on your desktop):"
echo "   ssh -R 1234:localhost:1234 USER@VM_IP -N"
echo ""
echo "2️⃣  Start the server:"
echo "   npm run dev"
echo ""
echo "3️⃣  Access the application:"
echo "   http://$(hostname -I | awk '{print $1}'):3005"
echo ""
echo "4️⃣  Check server logs:"
echo "   tail -f /tmp/server.log"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "- Keep the SSH tunnel running on your desktop"
echo "- LM Studio must be running locally"
echo "- Check /tmp/server.log for any errors"
echo ""
