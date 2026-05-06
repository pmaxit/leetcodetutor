#!/bin/bash

# 🚀 AI Interview Platform - Complete Deployment Script
# Deploys both server and client, exposes to ngrok in one command

set -e

# Increase file descriptor limit to prevent nodemon "too many open files" error
ulimit -n 10000

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_PORT="${SERVER_PORT:-3005}"
CLIENT_PORT="${CLIENT_PORT:-5173}"
LOG_DIR="/tmp/interview-platform"

# Create log directory
mkdir -p "$LOG_DIR"

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🚀 AI Interview Platform - Complete Deployment Script    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check port is not in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port is already in use${NC}"
        return 1
    fi
    return 0
}

# ============================================================
# STEP 1: Verify Prerequisites
# ============================================================
print_section "STEP 1: Verifying Prerequisites"

# Check Node.js
if command_exists node; then
    echo -e "${GREEN}✅ Node.js installed:$(node --version)${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

# Check npm
if command_exists npm; then
    echo -e "${GREEN}✅ npm installed: $(npm --version)${NC}"
else
    echo -e "${RED}❌ npm not found.${NC}"
    exit 1
fi

# Check ngrok
if command_exists ngrok; then
    echo -e "${GREEN}✅ ngrok installed: $(ngrok version)${NC}"
else
    echo -e "${RED}❌ ngrok not found. Run: snap install ngrok${NC}"
    exit 1
fi

# Check LM Studio
if command_exists lms; then
    echo -e "${GREEN}✅ LM Studio CLI found${NC}"
else
    echo -e "${YELLOW}⚠️  LM Studio CLI not found (optional)${NC}"
fi

# ============================================================
# STEP 2: Check Ports
# ============================================================
print_section "STEP 2: Checking Ports"

if ! check_port $SERVER_PORT; then
    echo -e "${RED}❌ Server port $SERVER_PORT is in use${NC}"
    read -p "Kill process on port $SERVER_PORT? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:$SERVER_PORT | xargs kill -9 2>/dev/null || true
        sleep 1
    else
        exit 1
    fi
fi
echo -e "${GREEN}✅ Port $SERVER_PORT is available${NC}"

if ! check_port $CLIENT_PORT; then
    echo -e "${YELLOW}⚠️  Port $CLIENT_PORT is in use (client dev server)${NC}"
fi

# ============================================================
# STEP 3: Start LM Studio Service
# ============================================================
print_section "STEP 3: Starting LM Studio Service"

if command_exists lms; then
    echo "🤖 Checking LM Studio status..."
    LMS_STATUS=$(lms status 2>&1 || echo "offline")

    # Check if server is running and what model is loaded
    SERVER_RUNNING=false
    MODEL_LOADED=false

    if echo "$LMS_STATUS" | grep -q "Server: ON"; then
        SERVER_RUNNING=true
        echo -e "${GREEN}✅ LM Studio server is already running${NC}"

        # Check if correct model is already loaded
        if echo "$LMS_STATUS" | grep -q "google/gemma-4-e2b"; then
            MODEL_LOADED=true
            echo -e "${GREEN}✅ Model google/gemma-4-e2b is already loaded${NC}"
        fi
    fi

    # Start server if not running
    if [ "$SERVER_RUNNING" = false ]; then
        echo -e "${YELLOW}📝 Starting LM Studio server...${NC}"
        lms server start > "$LOG_DIR/lms.log" 2>&1 &
        LMS_PID=$!
        echo "   LM Studio PID: $LMS_PID"
        echo "   Logs: tail -f $LOG_DIR/lms.log"

        # Wait for LM Studio to start
        echo "⏳ Waiting for LM Studio to be ready..."
        RETRY_COUNT=0
        MAX_RETRIES=30

        while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
            if lms status 2>&1 | grep -q "Server: ON"; then
                echo -e "${GREEN}✅ LM Studio server started successfully${NC}"
                break
            fi
            RETRY_COUNT=$((RETRY_COUNT + 1))
            sleep 1
        done

        if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
            echo -e "${YELLOW}⚠️  LM Studio took too long to start, continuing anyway${NC}"
        fi
    fi

    # Load model if not already loaded
    if [ "$MODEL_LOADED" = false ]; then
        echo ""
        echo "📦 Loading model: google/gemma-4-e2b..."
        if lms load "google/gemma-4-e2b" >> "$LOG_DIR/lms.log" 2>&1; then
            echo -e "${GREEN}✅ Model loaded successfully${NC}"
        else
            echo -e "${YELLOW}⚠️  Model loading may still be in progress${NC}"
            echo "   Check status with: lms status"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  LM Studio CLI not found, skipping auto-start${NC}"
    echo "   Install LM Studio from: https://lmstudio.ai"
fi

# ============================================================
# STEP 4: Install Server Dependencies
# ============================================================
print_section "STEP 4: Installing Server Dependencies"

cd "$PROJECT_ROOT"
if [ ! -d "node_modules" ]; then
    echo "📦 Installing server dependencies..."
    npm install > "$LOG_DIR/server-npm-install.log" 2>&1
    echo -e "${GREEN}✅ Server dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Server dependencies already installed${NC}"
fi

# ============================================================
# STEP 5: Install Client Dependencies
# ============================================================
print_section "STEP 5: Installing Client Dependencies"

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd "$PROJECT_ROOT/client"
    npm install > "$LOG_DIR/client-npm-install.log" 2>&1
    cd "$PROJECT_ROOT"
    echo -e "${GREEN}✅ Client dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Client dependencies already installed${NC}"
fi

# ============================================================
# STEP 6: Build Client
# ============================================================
print_section "STEP 6: Building Client"

echo "🔨 Building React client..."
cd "$PROJECT_ROOT/client"
npm run build > "$LOG_DIR/client-build.log" 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Client build completed${NC}"
else
    echo -e "${RED}❌ Client build failed${NC}"
    tail -20 "$LOG_DIR/client-build.log"
    exit 1
fi
cd "$PROJECT_ROOT"

# ============================================================
# STEP 7: Verify Configuration
# ============================================================
print_section "STEP 7: Verifying Configuration"

if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi

# Check .env has LM Studio config
if grep -q "LLM_BASE_URL" .env; then
    LLM_BASE_URL=$(grep "LLM_BASE_URL" .env | cut -d '=' -f 2)
    echo -e "${GREEN}✅ LLM configured: $LLM_BASE_URL${NC}"
else
    echo -e "${RED}❌ LLM_BASE_URL not configured in .env${NC}"
    exit 1
fi

# ============================================================
# STEP 8: Test Server Health
# ============================================================
print_section "STEP 8: Testing Server Health"

echo "🔍 Testing server startup..."

# Start server in background temporarily
timeout 10 npm run dev > "$LOG_DIR/server-startup-test.log" 2>&1 &
SERVER_TEST_PID=$!
sleep 3

# Test health endpoint
if curl -s http://localhost:$SERVER_PORT/api/health | jq . > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server health check passed${NC}"
    kill $SERVER_TEST_PID 2>/dev/null || true
else
    echo -e "${YELLOW}⚠️  Server health check failed${NC}"
    echo "   Check logs: cat $LOG_DIR/server-startup-test.log"
    kill $SERVER_TEST_PID 2>/dev/null || true
fi

wait $SERVER_TEST_PID 2>/dev/null || true
sleep 1

# ============================================================
# STEP 9: Start Servers
# ============================================================
print_section "STEP 9: Starting Servers"

echo -e "${YELLOW}📝 Starting Node.js server...${NC}"
npm start > "$LOG_DIR/server.log" 2>&1 &
SERVER_PID=$!
echo "   Server PID: $SERVER_PID"
echo "   Logs: tail -f $LOG_DIR/server.log"

sleep 3

# Check if server started successfully
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${RED}❌ Server failed to start${NC}"
    echo "   Logs:"
    tail -20 "$LOG_DIR/server.log"
    exit 1
fi

# Check server health
if curl -s http://localhost:$SERVER_PORT/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server started successfully on port $SERVER_PORT${NC}"
else
    echo -e "${YELLOW}⚠️  Server started but health check failed${NC}"
    echo "   This might be OK if LM Studio isn't running"
fi

# Optional: Start client dev server
echo ""
read -p "Start React dev server on port $CLIENT_PORT? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}📝 Starting React dev server...${NC}"
    cd "$PROJECT_ROOT/client"
    npm run dev > "$LOG_DIR/client.log" 2>&1 &
    CLIENT_PID=$!
    echo "   Client PID: $CLIENT_PID"
    echo "   Logs: tail -f $LOG_DIR/client.log"
    cd "$PROJECT_ROOT"
    sleep 3
fi

# ============================================================
# STEP 10: Start ngrok Tunnel
# ============================================================
print_section "STEP 10: Starting ngrok Tunnel"

echo -e "${YELLOW}🔗 Starting ngrok tunnel on port $SERVER_PORT...${NC}"
echo "   (This will create a public HTTPS URL)"
echo ""

# Start ngrok in background but capture URL
ngrok http $SERVER_PORT > "$LOG_DIR/ngrok.log" 2>&1 &
NGROK_PID=$!
echo "   ngrok PID: $NGROK_PID"

# Wait for ngrok to initialize
sleep 3

# Get the ngrok URL from logs/API
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o 'https://[^"]*' | head -1)

if [ -z "$NGROK_URL" ]; then
    # Try extracting from ngrok log
    NGROK_URL=$(grep -o 'https://[^ ]*' "$LOG_DIR/ngrok.log" 2>/dev/null | head -1)
fi

if [ -n "$NGROK_URL" ]; then
    echo -e "${GREEN}✅ ngrok tunnel created${NC}"
else
    echo -e "${YELLOW}⚠️  Could not extract ngrok URL${NC}"
    echo "   Check: http://localhost:4040 for status"
    NGROK_URL="https://<YOUR_NGROK_URL>"
fi

# ============================================================
# STEP 11: Display Summary
# ============================================================
print_section "🎉 DEPLOYMENT COMPLETE!"

echo -e "${GREEN}All services are running!${NC}"
echo ""
echo "📱 Access Points:"
echo "  Local Server:     http://localhost:$SERVER_PORT"
if [ -n "$CLIENT_PID" ]; then
    echo "  React Dev:        http://localhost:$CLIENT_PORT"
fi
echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}🌐 PUBLIC URL - SHARE THIS WITH ANYONE:${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "\033[1;92m╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "\033[1;92m║                                                            ║${NC}"
echo -e "\033[1;92m║  \033[1;46m\033[1;30m ${NGROK_URL} \033[1;92m                 ║${NC}"
echo -e "\033[1;92m║                                                            ║${NC}"
echo -e "\033[1;92m╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "📊 Monitor Requests:"
echo "  http://127.0.0.1:4040"
echo ""
echo "📝 View Logs:"
echo "  Server: tail -f $LOG_DIR/server.log"
if [ -n "$CLIENT_PID" ]; then
    echo "  Client: tail -f $LOG_DIR/client.log"
fi
echo "  ngrok:  tail -f $LOG_DIR/ngrok.log"
echo ""
echo "🛑 Stop Services:"
if [ -n "$LMS_PID" ]; then
    echo "  kill $LMS_PID (LM Studio)"
fi
echo "  kill $SERVER_PID"
if [ -n "$CLIENT_PID" ]; then
    echo "  kill $CLIENT_PID"
fi
echo "  kill $NGROK_PID"
echo ""
echo "Or run: ./stop-deployment.sh"
echo ""

# ============================================================
# STEP 12: Health Check Loop
# ============================================================
print_section "Health Checks"

echo "⏳ Running health checks..."
HEALTH_CHECK_TRIES=0
HEALTH_CHECK_MAX=10

while [ $HEALTH_CHECK_TRIES -lt $HEALTH_CHECK_MAX ]; do
    if curl -s http://localhost:$SERVER_PORT/api/health | jq . > /dev/null 2>&1; then
        HEALTH=$(curl -s http://localhost:$SERVER_PORT/api/health | jq -r '.status')
        LLM_STATUS=$(curl -s http://localhost:$SERVER_PORT/api/health | jq -r '.llmstudio')
        echo -e "${GREEN}✅ Server Health: $HEALTH (LM Studio: $LLM_STATUS)${NC}"
        break
    fi
    HEALTH_CHECK_TRIES=$((HEALTH_CHECK_TRIES + 1))
    sleep 1
done

# ============================================================
# Keep running with log streaming
# ============================================================
echo ""
echo -e "${BLUE}Deployment is live! Press Ctrl+C to stop all services.${NC}"
echo ""

# Save PIDs to file for easy cleanup
cat > "$LOG_DIR/pids.txt" << EOF
LMS_PID=${LMS_PID:-}
SERVER_PID=$SERVER_PID
CLIENT_PID=${CLIENT_PID:-}
NGROK_PID=$NGROK_PID
EOF

echo "Process IDs saved to: $LOG_DIR/pids.txt"
echo ""

# ============================================================
# Stream logs with color coding
# ============================================================
print_section "📊 Streaming Logs"

echo -e "${BLUE}Legend:${NC}"
echo -e "  ${BLUE}[SERVER]${NC}  - Node.js server"
if [ -n "$CLIENT_PID" ]; then
    echo -e "  ${GREEN}[CLIENT]${NC}  - React application"
fi
echo -e "  ${YELLOW}[NGROK]${NC}   - Public tunnel"
echo ""
echo "Logs are also saved in: $LOG_DIR"
echo ""

# Function to stream logs with color-coded prefixes
stream_logs_with_prefix() {
    while true; do
        # Read from all log files with labeled prefixes
        tail -f "$LOG_DIR/server.log" 2>/dev/null | sed "s/^/${BLUE}[SERVER]${NC} /" &
        SERVER_TAIL_PID=$!

        if [ -n "$CLIENT_PID" ] && [ -f "$LOG_DIR/client.log" ]; then
            tail -f "$LOG_DIR/client.log" 2>/dev/null | sed "s/^/${GREEN}[CLIENT]${NC} /" &
            CLIENT_TAIL_PID=$!
        fi

        tail -f "$LOG_DIR/ngrok.log" 2>/dev/null | sed "s/^/${YELLOW}[NGROK]${NC}  /" &
        NGROK_TAIL_PID=$!

        # Wait for any of them to finish
        wait -n 2>/dev/null

        # Clean up remaining processes
        kill $SERVER_TAIL_PID $CLIENT_TAIL_PID $NGROK_TAIL_PID 2>/dev/null || true
    done
}

# Stream logs in background
stream_logs_with_prefix &
STREAM_PID=$!

# Wait for interrupt
trap 'kill $LMS_PID $SERVER_PID $CLIENT_PID $NGROK_PID $STREAM_PID 2>/dev/null; exit 0' INT TERM

wait
