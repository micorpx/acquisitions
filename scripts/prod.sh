#!/bin/bash

# Production deployment script for Acquisition App
# This script starts the application in production mode with Neon Cloud Database

echo "🚀 Starting Acquisition App in Production Mode"
echo "==============================================="

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "   Please create .env.production with your production environment variables."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker and try again."
    exit 1
fi

echo "📦 Building and starting production container..."
echo "   - Environment file: .env.production"
echo "   - Using Neon Cloud Database (no local proxy)"
echo "   - Running in optimized production mode"
echo ""

# Start production environment using production env file for substitution
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d

# Wait for app to initialize
echo "⏳ Waiting for application to be ready..."
sleep 5

# Run migrations inside the production container
echo "📜 Applying latest schema with Drizzle..."
docker compose --env-file .env.production -f docker-compose.prod.yml exec app npm run db:migrate

echo ""
echo "🎉 Production environment started!"
echo "   Application: http://localhost:3000"
echo "   Logs: docker logs acquisitions-api"
echo ""
echo "Useful commands:"
echo "   View logs: docker logs -f acquisitions-api"
echo "   Stop app: docker compose --env-file .env.production -f docker-compose.prod.yml down"
