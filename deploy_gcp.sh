#!/bin/bash

# 🚀 AI Interview Platform - GCP Cloud Run Deployment Script

set -e

# Configuration
PROJECT_ID=$(gcloud config get-value project)
SERVICE_NAME="ai-interview-platform"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 Deploying to Google Cloud Run                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region:  $REGION"
echo ""

# Load local .env early for build args
if [ -f .env ]; then
    echo "Loading environment variables from .env for build..."
    export $(grep -v '^#' .env | grep -v '^\s*$' | xargs)
else
    echo -e "${RED}⚠️  No .env file found. Build will use empty build args.${NC}"
fi

# 1. Enable Google Cloud APIs
echo -e "${BLUE}Step 1: Enabling necessary APIs...${NC}"
gcloud services enable run.googleapis.com \
                       containerregistry.googleapis.com \
                       cloudbuild.googleapis.com \
                       sqladmin.googleapis.com

# 2. Build and Push the container image using Cloud Build
echo -e "\n${BLUE}Step 2: Building and pushing Docker image to GCR...${NC}"
echo "Using multi-stage Dockerfile for optimized production build."
gcloud builds submit --tag $IMAGE_NAME --build-arg="VITE_TLDRAW_LICENSE_KEY=${VITE_TLDRAW_LICENSE_KEY}" .

# 3. Deploy to Cloud Run
echo -e "\n${BLUE}Step 3: Deploying to Cloud Run...${NC}"

# Create a temporary JSON env-vars file (Cloud Run requires YAML/JSON format)
TEMP_ENV_FILE=".env.cloud-run.json"

python3 << 'PYTHON_EOF'
import json
import os

env_vars = {
    "GEMINI_API_KEY": os.environ.get("GEMINI_API_KEY", ""),
    "OPENROUTER_API_KEY": os.environ.get("OPENROUTER_API_KEY", ""),
    "OPENROUTER_FALLBACKS": os.environ.get("OPENROUTER_FALLBACKS", ""),
    "OPENROUTER_URL": os.environ.get("OPENROUTER_URL", "https://openrouter.ai/api/v1"),
    "LLM_PROVIDER_STRATEGY": "openrouter-only",
    "LM_STUDIO_URL": os.environ.get("LM_STUDIO_URL", ""),
    "LM_STUDIO_KEY": os.environ.get("LM_STUDIO_KEY", ""),
    "LM_STUDIO_MODEL": os.environ.get("LM_STUDIO_MODEL", ""),
    "LLM_BASE_URL": os.environ.get("LLM_BASE_URL", ""),
    "LLM_API_KEY": os.environ.get("LLM_API_KEY", ""),
    "LLM_MODEL": os.environ.get("LLM_MODEL", ""),
    "LLM_ENABLE_TOOLS": os.environ.get("LLM_ENABLE_TOOLS", "false"),
    "TAVILY_API_KEY": os.environ.get("TAVILY_API_KEY", ""),
    "VITE_TLDRAW_LICENSE_KEY": os.environ.get("VITE_TLDRAW_LICENSE_KEY", ""),
    "DB_HOST": os.environ.get("DB_HOST", ""),
    "DB_USER": os.environ.get("DB_USER", ""),
    "DB_PASSWORD": os.environ.get("DB_PASSWORD", ""),
    "DB_NAME": os.environ.get("DB_NAME", ""),
    "DB_DIALECT": os.environ.get("DB_DIALECT", "mysql"),
    "DB_SOCKET_PATH": "/cloudsql/adveralabs:us-central1:adveralabs-mysql",
    "NODE_ENV": "production"
}

with open(".env.cloud-run.json", "w") as f:
    json.dump(env_vars, f, indent=2)

print("✅ Created .env.cloud-run.json")
PYTHON_EOF

# 4. Handle secret-to-literal transition if necessary
echo -e "\n${BLUE}Step 4: Clearing existing secret references to avoid type mismatch...${NC}"
# This resolves the "Cannot update environment variable to string literal" error
# List of variables that might have been set as secrets in previous deployments
VARS_TO_CLEAR="OPENROUTER_API_KEY,LLM_PROVIDER_STRATEGY,LLM_BASE_URL,LLM_API_KEY,LLM_MODEL,LLM_ENABLE_TOOLS,DB_HOST,DB_USER,DB_PASSWORD,DB_NAME,DB_DIALECT,TAVILY_API_KEY,GEMINI_API_KEY,OPENROUTER_FALLBACKS,LM_STUDIO_KEY,VITE_TLDRAW_LICENSE_KEY"

gcloud run services update $SERVICE_NAME \
    --region $REGION \
    --remove-env-vars "$VARS_TO_CLEAR" \
    --remove-secrets "$VARS_TO_CLEAR" || echo "No existing secrets/vars to clear."

echo "Deploying with environment variables..."

gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --add-cloudsql-instances adveralabs:us-central1:adveralabs-mysql \
    --port 8080 \
    --timeout 120 \
    --cpu 2 \
    --memory 2Gi \
    --env-vars-file ".env.cloud-run.json"

# Clean up temp file
rm -f ".env.cloud-run.json"

echo -e "\n${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}\n"

SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
echo "Your service is now live at:"
echo -e "${BLUE}$SERVICE_URL${NC}\n"
