#!/bin/bash
set -e

PROJECT_ID="adveralabs"

if [ ! -f .env ]; then
  echo "Error: .env file not found!"
  exit 1
fi

echo "Pushing secrets to Secret Manager..."

# Read .env file, ignoring comments and empty lines
grep -v '^#' .env | grep -v '^\s*$' | while IFS='=' read -r key value; do
  # Trim whitespace from key and value
  key=$(echo "$key" | xargs)
  value=$(echo "$value" | xargs)
  
  # Convert key to lowercase-kebab if needed, but usually we use uppercase for env vars
  # We will keep them uppercase in Secret Manager for consistency with env vars
  
  echo "Processing $key..."
  
  # Check if secret exists
  if gcloud secrets describe "$key" --project="$PROJECT_ID" >/dev/null 2>&1; then
    echo "Secret $key already exists. Adding new version..."
  else
    echo "Creating secret $key..."
    gcloud secrets create "$key" --project="$PROJECT_ID" --replication-policy="automatic"
  fi
  
  # Add value to secret
  echo -n "$value" | gcloud secrets versions add "$key" --project="$PROJECT_ID" --data-file=-
done

echo "All secrets pushed to Secret Manager!"
