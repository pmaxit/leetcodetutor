#!/bin/bash

# Configuration
PROJECT_ID=$(gcloud config get-value project)
INSTANCE_NAME="interview-db-instance"
REGION="us-central1"
DB_NAME="interview_db"
DB_USER="admin"
DB_PASSWORD="YourStrongPassword123"

echo "Using project: $PROJECT_ID"

# 1. Create Cloud SQL Instance (MySQL 8.0)
echo "Creating Cloud SQL instance (this may take a few minutes)..."
gcloud sql instances create $INSTANCE_NAME \
    --database-version=MYSQL_8_0 \
    --cpu=1 \
    --memory=3840MiB \
    --region=$REGION \
    --root-password=$DB_PASSWORD

# 2. Create Database
echo "Creating database: $DB_NAME"
gcloud sql databases create $DB_NAME --instance=$INSTANCE_NAME

# 3. Create User
echo "Creating user: $DB_USER"
gcloud sql users create $DB_USER --host="%" --instance=$INSTANCE_NAME --password=$DB_PASSWORD

# 4. Enable Public IP (Optional: for local development access)
echo "Enabling public IP access (Warning: configure authorized networks for security)..."
gcloud sql instances patch $INSTANCE_NAME --assign-ip

# 5. Output connection details
INSTANCE_IP=$(gcloud sql instances describe $INSTANCE_NAME --format="value(ipAddresses.ipAddress)")

echo "------------------------------------------------"
echo "PROVISIONING COMPLETE"
echo "------------------------------------------------"
echo "DB_HOST=$INSTANCE_IP"
echo "DB_USER=$DB_USER"
echo "DB_PASSWORD=$DB_PASSWORD"
echo "DB_NAME=$DB_NAME"
echo "DB_DIALECT=mysql"
echo "------------------------------------------------"
echo "Update your .env file with these values and run 'npm run seed' to sync data."
