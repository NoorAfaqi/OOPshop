#!/bin/bash
# Production Docker Build Script

echo "Building production Docker images and containers..."

# Build images
echo ""
echo "Building images..."
docker-compose -f docker-compose.prod.yml build

# Start containers
echo ""
echo "Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

# Show status
echo ""
echo "Container status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Production environment is ready!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo ""
echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "To stop: docker-compose -f docker-compose.prod.yml down"

