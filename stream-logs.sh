#!/bin/bash

# 📊 Stream logs from deployment
# Usage: ./stream-logs.sh

LOG_DIR="/tmp/interview-platform"

if [ ! -d "$LOG_DIR" ]; then
    echo "❌ Log directory not found: $LOG_DIR"
    echo "Make sure deployment is running first with: ./deploy.sh"
    exit 1
fi

echo "📊 Streaming logs from: $LOG_DIR"
echo "Press Ctrl+C to stop"
echo ""

# Use tail -f to follow multiple log files
tail -f "$LOG_DIR"/*.log 2>/dev/null
