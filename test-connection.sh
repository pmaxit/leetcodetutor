#!/bin/bash

echo "🔍 AI Interview Platform - Connection Test"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: OpenRouter
echo "${BLUE}🔷 Test 1: OpenRouter Connection${NC}"
OPENROUTER_KEY=$(grep "OPENROUTER_API_KEY=" .env 2>/dev/null | cut -d= -f2)
if [ -z "$OPENROUTER_KEY" ]; then
    echo -e "${YELLOW}⚠️  OPENROUTER_API_KEY not found in .env${NC}"
    echo "   ➜ Get your key from: https://openrouter.ai"
    echo "   ➜ Add it to .env: OPENROUTER_API_KEY=sk-or-v1-..."
elif [ "$OPENROUTER_KEY" = "your-openrouter-api-key-here" ]; then
    echo -e "${YELLOW}⚠️  OPENROUTER_API_KEY is not configured${NC}"
    echo "   ➜ Replace placeholder in .env with your actual API key"
elif curl -s -H "Authorization: Bearer $OPENROUTER_KEY" https://openrouter.ai/api/v1/models | grep -q "object"; then
    echo -e "${GREEN}✅ OpenRouter is accessible${NC}"
    echo "   Available models:"
    curl -s -H "Authorization: Bearer $OPENROUTER_KEY" https://openrouter.ai/api/v1/models | jq '.data[].id' 2>/dev/null | head -5 || curl -s -H "Authorization: Bearer $OPENROUTER_KEY" https://openrouter.ai/api/v1/models | head -20
else
    echo -e "${RED}❌ OpenRouter is NOT responding${NC}"
    echo "   ➜ Check your OPENROUTER_API_KEY is correct"
    echo "   ➜ Sign up at: https://openrouter.ai"
fi
echo ""

# Test 2: Server
echo "${BLUE}🔷 Test 2: Server Connection${NC}"
if curl -s http://localhost:3005/api/health | grep -q "status"; then
    echo -e "${GREEN}✅ Server is running${NC}"
    echo "   Response:"
    curl -s http://localhost:3005/api/health | jq . 2>/dev/null || curl -s http://localhost:3005/api/health
else
    echo -e "${RED}❌ Server is NOT responding${NC}"
    echo "   ➜ Start with: npm run dev"
fi
echo ""

# Test 3: Environment
echo "${BLUE}🔷 Test 3: Environment Configuration${NC}"
if [ -f .env ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    echo "   Configuration:"
    grep -E "LLM_|PORT=" .env | sed 's/^/   /'
else
    echo -e "${RED}❌ .env file NOT found${NC}"
fi
echo ""

# Test 4: Node modules
echo "${BLUE}🔷 Test 4: Dependencies${NC}"
if [ -d node_modules ]; then
    echo -e "${GREEN}✅ Server dependencies installed${NC}"
else
    echo -e "${RED}❌ Server dependencies NOT installed${NC}"
    echo "   ➜ Run: npm install"
fi

if [ -d client/node_modules ]; then
    echo -e "${GREEN}✅ Client dependencies installed${NC}"
else
    echo -e "${RED}❌ Client dependencies NOT installed${NC}"
    echo "   ➜ Run: cd client && npm install"
fi
echo ""

# Test 5: Database
echo "${BLUE}🔷 Test 5: Database Configuration${NC}"
DB_HOST=$(grep "DB_HOST=" .env | cut -d= -f2)
if [ -z "$DB_HOST" ]; then
    echo -e "${YELLOW}⚠️  No database configured${NC}"
else
    if timeout 2 bash -c "echo >/dev/tcp/$DB_HOST/3306" 2>/dev/null; then
        echo -e "${GREEN}✅ Database is accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  Database may not be accessible (but optional)${NC}"
    fi
fi
echo ""

# Summary
echo "${BLUE}=========================================="
echo "📋 Summary${NC}"
echo "${BLUE}=========================================${NC}"
echo ""
echo "🟢 = Ready to go"
echo "🔴 = Fix before continuing"
echo "🟡 = Optional/Warning"
echo ""
echo "To start the application:"
echo ""
echo "  Terminal 1 (Server):"
echo "    ${YELLOW}npm run dev${NC}"
echo ""
echo "  Terminal 2 (Client):"
echo "    ${YELLOW}cd client && npm run dev${NC}"
echo ""
echo "Then open: ${YELLOW}http://localhost:5173${NC}"
echo ""
