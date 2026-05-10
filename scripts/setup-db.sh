#!/bin/bash
# JourneyFix.ch - Database setup script
# Creates the database and runs Prisma migrations

set -e

echo "=== JourneyFix Database Setup ==="

# Check if .env exists
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo ""
  echo "⚠️  Please edit .env and set your DATABASE_URL and ANTHROPIC_API_KEY"
  echo "   Example: DATABASE_URL=\"postgresql://postgres:YOUR_PASSWORD@localhost:5432/journeyfix\""
  echo ""
  read -p "Press Enter after you've updated .env, or Ctrl+C to exit..."
fi

# Load .env for DATABASE_URL
export $(grep -v '^#' .env | xargs)

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set in .env"
  exit 1
fi

# Extract db name from URL (last part after /)
DB_NAME=$(echo $DATABASE_URL | sed -n 's|.*/\([^/?]*\).*|\1|p')
echo "Database: $DB_NAME"

# Try to create database (may fail if it exists or no permissions - that's ok)
echo "Creating database (if not exists)..."
createdb "$DB_NAME" 2>/dev/null || psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "  (Database may already exist or use existing connection)"

echo ""
echo "Running Prisma generate..."
npx prisma generate

echo ""
echo "Pushing schema to database..."
npx prisma db push

echo ""
echo "✅ Database setup complete!"
echo "   Run: npm run dev"
