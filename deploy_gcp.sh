#!/bin/bash

# Configuration
PROJECT_ID=$(gcloud config get-value project)
SERVICE_NAME="ai-interview-platform"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "Deploying $SERVICE_NAME to Project: $PROJECT_ID in Region: $REGION"

# 1. Enable Google Cloud APIs
echo "Enabling necessary APIs..."
gcloud services enable run.googleapis.com \
                       containerregistry.googleapis.com \
                       cloudbuild.googleapis.com

# 2. Build and Push the container image using Cloud Build
echo "Building and pushing image to GCR..."
gcloud builds submit --tag $IMAGE_NAME .

# 3. Deploy to Cloud Run
echo "Deploying to Cloud Run..."
# Load local .env if it exists for local testing/reference, 
# but we'll pass keys explicitly or use gcloud secrets
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 3005 \
    --set-env-vars "GEMINI_API_KEY=$GEMINI_API_KEY,TAVILY_API_KEY=$TAVILY_API_KEY,DB_HOST=$DB_HOST,DB_USER=$DB_USER,DB_PASSWORD=$DB_PASSWORD,DB_NAME=$DB_NAME,DB_DIALECT=$DB_DIALECT"

echo "------------------------------------------------"
echo "DEPLOYMENT COMPLETE"
echo "------------------------------------------------"
echo "Your service is now live! Use the URL provided by Cloud Run."
echo ""
echo "NOTE: If you haven't provisioned the database yet, run:"
echo "bash scripts/provision_gcp_db.sh"
echo ""
echo "Then update the Cloud Run environment variables with the database details."
