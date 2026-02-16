#!/bin/bash

# Development startup script for Acquisition App
# This script starts the application in development mode with Neon Local

echo "🚀 Starting Acquisition App in Development Mode"
echo "================================================"

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "❌ Error: .env.development file not found!"
    echo "   Please create .env.development with your development environment variables."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

echo "📦 Building and starting development containers..."
echo "   - Environment file: .env.development"
echo "   - Neon Local database proxy will be started"
echo "   - Application will run with hot reload enabled"
echo ""

# Start the development environment using development env file for substitution
docker compose --env-file .env.development -f docker-compose.dev.yml up --build

echo ""
echo "🎉 Development environment started!"
echo "   Application: http://localhost:3000"
echo "   Neon Local: localhost:5432"
echo ""
echo "To stop the environment, press Ctrl+C or run: docker compose --env-file .env.development -f docker-compose.dev.yml down"
echo "To stop and remove Neon Local state, run: docker compose --env-file .env.development -f docker-compose.dev.yml down -v"
