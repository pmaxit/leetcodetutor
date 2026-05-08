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

# 2. Build, Push, and Deploy using Cloud Build configuration
echo -e "\n${BLUE}Step 2: Building and deploying via Cloud Build...${NC}"
echo "Using cloudbuild.yaml with Tldraw license key as build argument."
gcloud builds submit \
    --config=cloudbuild.yaml \
    --substitutions=_VITE_TLDRAW_LICENSE_KEY="${VITE_TLDRAW_LICENSE_KEY}" .

echo -e "\n${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}\n"

SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
echo "Your service is now live at:"
echo -e "${BLUE}$SERVICE_URL${NC}\n"
