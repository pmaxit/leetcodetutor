#!/bin/bash

# 🛑 Stop Deployment Script
# Cleanly stops all running services

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

LOG_DIR="/tmp/interview-platform"
PID_FILE="$LOG_DIR/pids.txt"

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🛑 Stopping AI Interview Platform Services              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if PIDs file exists
if [ -f "$PID_FILE" ]; then
    echo "Reading process IDs from: $PID_FILE"
    source "$PID_FILE"
else
    echo -e "${YELLOW}⚠️  No PID file found. Searching for processes...${NC}"

    # Find processes by name
    SERVER_PID=$(pgrep -f "npm run dev" | grep -v stop | head -1)
    NGROK_PID=$(pgrep ngrok | head -1)
fi

echo ""
echo "Stopping services:"
echo ""

# Stop Server
if [ -n "$SERVER_PID" ] && kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${YELLOW}🛑 Stopping Node.js server (PID: $SERVER_PID)...${NC}"
    kill $SERVER_PID
    sleep 1
    if kill -0 $SERVER_PID 2>/dev/null; then
        echo "   Force killing..."
        kill -9 $SERVER_PID
    fi
    echo -e "${GREEN}✅ Server stopped${NC}"
else
    echo -e "${YELLOW}ℹ️  Server not running${NC}"
fi

# Stop Client
if [ -n "$CLIENT_PID" ] && kill -0 $CLIENT_PID 2>/dev/null; then
    echo -e "${YELLOW}🛑 Stopping React client (PID: $CLIENT_PID)...${NC}"
    kill $CLIENT_PID
    sleep 1
    if kill -0 $CLIENT_PID 2>/dev/null; then
        echo "   Force killing..."
        kill -9 $CLIENT_PID
    fi
    echo -e "${GREEN}✅ Client stopped${NC}"
else
    echo -e "${YELLOW}ℹ️  Client not running${NC}"
fi

# Stop ngrok
if [ -n "$NGROK_PID" ] && kill -0 $NGROK_PID 2>/dev/null; then
    echo -e "${YELLOW}🛑 Stopping ngrok (PID: $NGROK_PID)...${NC}"
    kill $NGROK_PID
    sleep 1
    if kill -0 $NGROK_PID 2>/dev/null; then
        echo "   Force killing..."
        kill -9 $NGROK_PID
    fi
    echo -e "${GREEN}✅ ngrok stopped${NC}"
else
    echo -e "${YELLOW}ℹ️  ngrok not running${NC}"
fi

# Kill any remaining npm/ngrok processes
echo ""
echo -e "${YELLOW}🔍 Checking for remaining processes...${NC}"

# Kill remaining npm processes (but not this script)
REMAINING_NPM=$(pgrep -f "npm run dev" | grep -v stop)
if [ -n "$REMAINING_NPM" ]; then
    echo -e "${YELLOW}Killing remaining npm processes: $REMAINING_NPM${NC}"
    echo "$REMAINING_NPM" | xargs kill -9 2>/dev/null || true
fi

# Kill remaining ngrok
REMAINING_NGROK=$(pgrep ngrok)
if [ -n "$REMAINING_NGROK" ]; then
    echo -e "${YELLOW}Killing remaining ngrok: $REMAINING_NGROK${NC}"
    echo "$REMAINING_NGROK" | xargs kill -9 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}✅ All services stopped${NC}"
echo ""
echo "Logs saved to: $LOG_DIR/"
echo "  server.log"
echo "  client.log"
echo "  ngrok.log"
echo ""
echo -e "${BLUE}To restart: ./deploy.sh${NC}"
