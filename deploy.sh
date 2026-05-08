#!/bin/bash
set -e

echo "🚀 Starting AI Interview Platform..."

# 1. Environment & Tools Check
[ -f .env ] || { echo "❌ .env file missing"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker not found"; exit 1; }

COMPOSE="docker compose"
docker compose version >/dev/null 2>&1 || COMPOSE="docker-compose"

# 2. Cleanup existing services and ports
echo "🧹 Cleaning up..."
$COMPOSE down --remove-orphans 2>/dev/null || true

# Kill processes on app ports if they exist
for PORT in 3005 5173; do
    if command -v lsof >/dev/null 2>&1; then
        lsof -ti :$PORT | xargs kill -9 2>/dev/null || true
    fi
done

# 3. Build and Start
echo "🔨 Building and starting containers..."
if ! $COMPOSE up --build -d; then
    echo "⚠️  Standard build failed, attempting cache clear..."
    docker buildx prune -af || true
    $COMPOSE build --no-cache
    $COMPOSE up -d
fi

echo -e "\n✅ DEPLOYMENT COMPLETE!"
LOCAL_IP=$(hostname -I | awk '{print $1}' || echo "localhost")
echo "Local Application: http://localhost:3005"
if [ "$LOCAL_IP" != "localhost" ]; then
    echo "Network Access:    http://$LOCAL_IP:3005"
fi
echo "View Logs:         $COMPOSE logs -f"
