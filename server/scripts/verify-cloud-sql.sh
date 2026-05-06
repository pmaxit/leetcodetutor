#!/bin/bash

# verify-cloud-sql.sh - Test Cloud SQL connection

echo "🔍 Verifying Cloud SQL Connection..."
echo ""

if [ -z "$DB_HOST" ]; then
  echo "❌ DB_HOST not set in .env"
  exit 1
fi

if [ -z "$DB_USER" ]; then
  echo "❌ DB_USER not set in .env"
  exit 1
fi

if [ -z "$DB_PASSWORD" ]; then
  echo "❌ DB_PASSWORD not set in .env"
  exit 1
fi

if [ -z "$DB_NAME" ]; then
  echo "❌ DB_NAME not set in .env"
  exit 1
fi

echo "📋 Configuration:"
echo "  Host:     $DB_HOST"
echo "  User:     $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Try to connect with mysql CLI
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -D "$DB_NAME" -e "SELECT COUNT(*) as problem_count FROM problems;" 2>/dev/null

if [ $? -eq 0 ]; then
  echo "✅ Connection successful!"
else
  echo "❌ Connection failed. Check your credentials and network access."
fi
