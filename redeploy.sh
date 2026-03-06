#!/bin/bash

# Ezhuthidu Rebuild & Deploy Script
# This script ensures a clean build and deployment, clearing all Docker caches.

echo "🛑 Stopping containers..."
docker compose down

echo "🧹 Clearing Docker build cache..."
docker builder prune -f

echo "🚀 Rebuilding and starting containers (with forced build)..."
docker compose up -d --build

echo "⏳ Waiting for services to start..."
sleep 5

echo "📋 Checking container status..."
docker compose ps

echo "✅ Deployment complete! Please perform a HARD REFRESH (Ctrl+F5) in your browser."
