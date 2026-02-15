#!/bin/bash

# Development startup script for Acquisition App
# This script starts the application in development mode with local PostgreSQL

echo "🚀 Starting Acquisition App in Development Mode"
echo "================================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "   Please copy .env.example to .env and update with your credentials."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

echo "📦 Building and starting development containers..."
echo "   - PostgreSQL database will be started"
echo "   - Application will run with hot reload enabled"
echo ""

# Start the development environment
docker compose -f docker-compose.dev.yml up --build

echo ""
echo "🎉 Development environment started!"
echo "   Application: http://localhost:3000"
echo "   Database: postgres://postgres:postgres@localhost:5432/acquisitions"
echo ""
echo "To stop the environment, press Ctrl+C or run: docker compose -f docker-compose.dev.yml down"
echo "To stop and remove database data, run: docker compose -f docker-compose.dev.yml down -v"
