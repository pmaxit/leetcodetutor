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

# 1. Enable Google Cloud APIs
echo -e "${BLUE}Step 1: Enabling necessary APIs...${NC}"
gcloud services enable run.googleapis.com \
                       containerregistry.googleapis.com \
                       cloudbuild.googleapis.com \
                       sqladmin.googleapis.com

# 2. Build and Push the container image using Cloud Build
echo -e "\n${BLUE}Step 2: Building and pushing Docker image to GCR...${NC}"
echo "Using multi-stage Dockerfile for optimized production build."
gcloud builds submit --tag $IMAGE_NAME .

# 3. Deploy to Cloud Run
echo -e "\n${BLUE}Step 3: Deploying to Cloud Run...${NC}"

# Load local .env if it exists for environment variables
if [ -f .env ]; then
    echo "Loading environment variables from .env..."
    # Export vars while ignoring comments
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}⚠️  No .env file found. Deploying with default environment variables.${NC}"
fi

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
    --set-env-vars "GEMINI_API_KEY=${GEMINI_API_KEY:-},OPENROUTER_API_KEY=${OPENROUTER_API_KEY:-},OPENROUTER_FALLBACKS=${OPENROUTER_FALLBACKS:-},OPENROUTER_URL=${OPENROUTER_URL:-https://openrouter.ai/api/v1},LM_STUDIO_URL=${LM_STUDIO_URL:-},LM_STUDIO_KEY=${LM_STUDIO_KEY:-},LM_STUDIO_MODEL=${LM_STUDIO_MODEL:-},LLM_BASE_URL=${LLM_BASE_URL:-},LLM_API_KEY=${LLM_API_KEY:-},LLM_MODEL=${LLM_MODEL:-},LLM_ENABLE_TOOLS=${LLM_ENABLE_TOOLS:-false},TAVILY_API_KEY=${TAVILY_API_KEY:-},DB_HOST=${DB_HOST:-},DB_USER=${DB_USER:-},DB_PASSWORD=${DB_PASSWORD:-},DB_NAME=${DB_NAME:-},DB_DIALECT=${DB_DIALECT:-mysql},DB_SOCKET_PATH=/cloudsql/adveralabs:us-central1:adveralabs-mysql"

echo -e "\n${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}\n"

SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
echo "Your service is now live at:"
echo -e "${BLUE}$SERVICE_URL${NC}\n"
