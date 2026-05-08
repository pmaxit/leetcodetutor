#!/bin/bash
set -e

# Configuration
PROJECT_ID=$(gcloud config get-value project)
SERVICE_NAME="ai-interview-platform"
REGION="us-central1"

echo "🚀 Deploying $SERVICE_NAME to GCP ($PROJECT_ID)..."

# Load local .env for build args (like Tldraw license)
if [ -f .env ]; then
    export $(grep -v '^#' .env | grep -v '^\s*$' | xargs)
fi

# Build and Deploy via Cloud Build
gcloud builds submit \
    --config=cloudbuild.yaml \
    --substitutions=_VITE_TLDRAW_LICENSE_KEY="${VITE_TLDRAW_LICENSE_KEY}" .

# Get the URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
echo -e "\n✅ DEPLOYMENT COMPLETE!"
echo "Live at: $SERVICE_URL"
