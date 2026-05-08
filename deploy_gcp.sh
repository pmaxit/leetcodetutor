#!/bin/bash
set -e

# Configuration
PROJECT_ID=$(gcloud config get-value project)
SERVICE_NAME="ai-interview-platform"
REGION="us-central1"

echo "🚀 Deploying $SERVICE_NAME to GCP ($PROJECT_ID)..."

# Load local .env for build args (like Tldraw license)
if [ -f .env ]; then
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip comments and empty lines
        [[ $line =~ ^#.*$ ]] && continue
        [[ $line =~ ^\s*$ ]] && continue
        # Export the variable
        export "$line"
    done < .env
fi

# Build and Deploy via Cloud Build
gcloud builds submit \
    --config=cloudbuild.yaml \
    --substitutions=_VITE_TLDRAW_LICENSE_KEY="${VITE_TLDRAW_LICENSE_KEY//,/;}",_OPENROUTER_API_KEY="${OPENROUTER_API_KEY//,/;}",_OPENROUTER_URL="${OPENROUTER_URL//,/;}",_OPENROUTER_FALLBACKS="${OPENROUTER_FALLBACKS//,/;}",_LLM_PROVIDER_STRATEGY="openrouter-only",_DB_HOST="${DB_HOST//,/;}",_DB_USER="${DB_USER//,/;}",_DB_PASSWORD="${DB_PASSWORD//,/;}",_DB_NAME="${DB_NAME//,/;}" .

# Get the URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
echo -e "\n✅ DEPLOYMENT COMPLETE!"
echo "Live at: $SERVICE_URL"
