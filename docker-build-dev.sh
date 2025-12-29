#!/bin/bash
# Development Docker Build Script

echo "Building development Docker images and containers..."

# Build images
echo ""
echo "Building images..."
docker-compose build

# Start containers
echo ""
echo "Starting containers..."
docker-compose up -d

# Show status
echo ""
echo "Container status:"
docker-compose ps

echo ""
echo "✅ Development environment is ready!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"

